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
        filter_by_max_price(parts)
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

        {
          id: part.id,
          category: category,
          name: part.name,
          maker: part.maker,
          price: part.price,
          specs: part.specs,
          created_at: part.created_at,
          updated_at: part.updated_at
        }
      end

      def page_param
        params[:page] || 1
      end

      def per_page_param
        params[:per_page] || 20
      end
    end
  end
end
