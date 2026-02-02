# frozen_string_literal: true

module Api
  module V1
    class PartsController < ApplicationController
      skip_before_action :authenticate_user!, raise: false
      before_action :set_part, only: [:show]

      CATEGORY_MODELS = {
        'cpu' => PartsCpu,
        'gpu' => PartsGpu,
        'memory' => PartsMemory,
        'storage' => PartsStorage,
        'os' => PartsOs,
        'motherboard' => PartsMotherboard,
        'psu' => PartsPsu,
        'case' => PartsCase
      }.freeze

      def index
        parts = fetch_parts
        parts = apply_filters(parts)

        # 配列の場合はKaminari.paginate_arrayを使用
        paginated = if parts.is_a?(Array)
                      Kaminari.paginate_array(parts).page(page_param).per(per_page_param)
                    else
                      parts.page(page_param).per(per_page_param)
                    end

        render json: {
          data: paginated.map { |part| serialize_part(part) },
          meta: {
            total: paginated.total_count,
            page: paginated.current_page,
            per_page: paginated.limit_value
          }
        }
      end

      def show
        render json: {
          data: serialize_part(@part)
        }
      end

      def recommendations
        cpu = PartsCpu.find_by(id: params[:cpu_id])
        memory = PartsMemory.find_by(id: params[:memory_id])
        gpu = PartsGpu.find_by(id: params[:gpu_id])

        unless cpu && memory
          render json: { error: { code: 'MISSING_PARAMS', message: 'CPUとメモリのIDが必要です' } }, status: :bad_request
          return
        end

        motherboard = recommend_motherboard(cpu, memory)
        psu = recommend_psu(cpu, gpu)
        pc_case = recommend_case(motherboard, gpu)

        render json: {
          motherboard: motherboard ? serialize_part(motherboard) : nil,
          psu: psu ? serialize_part(psu) : nil,
          case: pc_case ? serialize_part(pc_case) : nil
        }
      end

      private

      def fetch_parts
        category = params[:category]

        if category.present? && CATEGORY_MODELS.key?(category)
          CATEGORY_MODELS[category].all
        else
          all_parts
        end
      end

      def all_parts
        CATEGORY_MODELS.values.flat_map(&:all)
      end

      def apply_filters(parts)
        parts = filter_by_keyword(parts)
        parts = filter_by_min_price(parts)
        parts = filter_by_max_price(parts)
        parts = filter_by_socket(parts)
        parts = filter_by_memory_type(parts)
        parts = filter_by_form_factor(parts)
        filter_by_min_gpu_length(parts)
      end

      def filter_by_keyword(parts)
        return parts unless params[:keyword].present?

        if parts.is_a?(Array)
          parts.select { |p| p.name.include?(params[:keyword]) }
        else
          parts.where('name LIKE ?', "%#{params[:keyword]}%")
        end
      end

      def filter_by_min_price(parts)
        return parts unless params[:min_price].present?

        min_price = params[:min_price].to_i
        if parts.is_a?(Array)
          parts.select { |p| p.price >= min_price }
        else
          parts.where('price >= ?', min_price)
        end
      end

      def filter_by_max_price(parts)
        return parts unless params[:max_price].present?

        max_price = params[:max_price].to_i
        if parts.is_a?(Array)
          parts.select { |p| p.price <= max_price }
        else
          parts.where('price <= ?', max_price)
        end
      end

      # CPUソケットでフィルタリング（主にマザーボード向け）
      def filter_by_socket(parts)
        return parts unless params[:cpu_socket].present?

        if parts.is_a?(Array)
          parts.select { |p| p.respond_to?(:socket) && p.socket == params[:cpu_socket] }
        else
          return parts unless parts.column_names.include?('socket')

          parts.where(socket: params[:cpu_socket])
        end
      end

      # メモリタイプでフィルタリング（メモリ、マザーボード向け）
      def filter_by_memory_type(parts)
        return parts unless params[:memory_type].present?

        if parts.is_a?(Array)
          parts.select { |p| p.respond_to?(:memory_type) && p.memory_type == params[:memory_type] }
        else
          return parts unless parts.column_names.include?('memory_type')

          parts.where(memory_type: params[:memory_type])
        end
      end

      # フォームファクタでフィルタリング（ケース、マザーボード向け）
      def filter_by_form_factor(parts)
        return parts unless params[:form_factor].present?

        # ケースの場合、指定されたフォームファクタに対応できるものをフィルタリング
        # ATXケース → ATXのみ対応
        # mATXケース → ATX, mATX対応
        # ITXケース → ATX, mATX, ITX対応
        if parts.is_a?(Array)
          parts.select do |p|
            next false unless p.respond_to?(:form_factor)

            compatible_with_form_factor?(p.form_factor, params[:form_factor])
          end
        else
          return parts unless parts.column_names.include?('form_factor')

          # ケースの場合、マザーボードのフォームファクタに対応できるものを選択
          case params[:form_factor]
          when 'ATX'
            parts.where(form_factor: 'ATX')
          when 'mATX'
            parts.where(form_factor: %w[ATX mATX])
          when 'ITX'
            parts.where(form_factor: %w[ATX mATX ITX])
          else
            parts.where(form_factor: params[:form_factor])
          end
        end
      end

      # フォームファクタの互換性チェック
      def compatible_with_form_factor?(case_form_factor, mb_form_factor)
        # ケースのフォームファクタがマザーボードのフォームファクタに対応しているか
        case case_form_factor
        when 'ATX'
          %w[ATX mATX ITX].include?(mb_form_factor)
        when 'mATX'
          %w[mATX ITX].include?(mb_form_factor)
        when 'ITX'
          mb_form_factor == 'ITX'
        else
          false
        end
      end

      # 最小GPU長でフィルタリング（ケース向け）
      def filter_by_min_gpu_length(parts)
        return parts unless params[:min_gpu_length].present?

        min_length = params[:min_gpu_length].to_i
        if parts.is_a?(Array)
          parts.select { |p| p.respond_to?(:max_gpu_length_mm) && p.max_gpu_length_mm >= min_length }
        else
          return parts unless parts.column_names.include?('max_gpu_length_mm')

          parts.where('max_gpu_length_mm >= ?', min_length)
        end
      end

      def set_part
        category = params[:category]
        model = CATEGORY_MODELS[category]

        unless model
          render json: { error: { code: 'INVALID_CATEGORY', message: 'カテゴリが不正です' } }, status: :bad_request
          return
        end

        @part = model.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: { code: 'NOT_FOUND', message: 'パーツが見つかりません' } }, status: :not_found
      end

      def serialize_part(part)
        category = part.class.name.sub('Parts', '').downcase

        base = {
          id: part.id,
          category: category,
          name: part.name,
          maker: part.maker,
          price: part.price,
          specs: part.specs,
          created_at: part.created_at,
          updated_at: part.updated_at
        }

        # カテゴリ固有の属性を追加
        base.merge(category_specific_attributes(part))
      end

      def category_specific_attributes(part)
        attrs = {}

        # 各カテゴリ固有のカラムを追加
        attrs[:socket] = part.socket if part.respond_to?(:socket)
        attrs[:tdp] = part.tdp if part.respond_to?(:tdp)
        attrs[:memory_type] = part.memory_type if part.respond_to?(:memory_type)
        attrs[:form_factor] = part.form_factor if part.respond_to?(:form_factor)
        attrs[:wattage] = part.wattage if part.respond_to?(:wattage)
        attrs[:length_mm] = part.length_mm if part.respond_to?(:length_mm)
        attrs[:max_gpu_length_mm] = part.max_gpu_length_mm if part.respond_to?(:max_gpu_length_mm)

        attrs.compact
      end

      def page_param
        params[:page] || 1
      end

      def per_page_param
        params[:per_page] || 20
      end

      # 推奨マザーボード: CPUソケットとメモリタイプが一致するもの
      def recommend_motherboard(cpu, memory)
        PartsMotherboard
          .where(socket: cpu.socket, memory_type: memory.memory_type)
          .order(price: :asc)
          .first
      end

      # 推奨電源: CPU + GPU の TDP に余裕を持たせた容量
      def recommend_psu(cpu, gpu)
        total_tdp = cpu.tdp + (gpu&.tdp || 0)
        # TDPの1.5倍 + 100W程度の余裕を持たせる
        required_wattage = (total_tdp * 1.5 + 100).ceil

        PartsPsu
          .where('wattage >= ?', required_wattage)
          .order(wattage: :asc, price: :asc)
          .first
      end

      # 推奨ケース: GPUの長さが収まるもの
      def recommend_case(motherboard, gpu)
        query = PartsCase.all

        # GPUの長さに対応
        if gpu&.length_mm
          query = query.where('max_gpu_length_mm >= ?', gpu.length_mm)
        end

        # マザーボードのフォームファクターに対応
        if motherboard&.form_factor
          # ATXケースはATX/mATXに対応、mATXはmATX対応
          compatible_form_factors = case motherboard.form_factor
                                    when 'ATX' then ['ATX']
                                    when 'mATX' then ['ATX', 'mATX']
                                    when 'ITX' then ['ATX', 'mATX', 'ITX']
                                    else ['ATX']
                                    end
          query = query.where(form_factor: compatible_form_factors)
        end

        query.order(price: :asc).first
      end
    end
  end
end
