# frozen_string_literal: true

module Api
  module V1
    class ShareTokensController < ApplicationController
      def create
        token = SecureRandom.urlsafe_base64(16)
        share_token = ShareToken.create!(
          token: token,
          parts_data: share_params.to_h
        )

        render json: {
          data: {
            token: share_token.token,
            url: "/share?token=#{share_token.token}"
          }
        }, status: :created
      rescue ActiveRecord::RecordInvalid => e
        render json: { error: { code: 'VALIDATION_ERROR', message: e.message } }, status: :unprocessable_entity
      end

      def show
        share_token = ShareToken.find_by!(token: params[:token])
        parts_data = share_token.parts_data.symbolize_keys

        parts = []
        total_price = 0

        # 各パーツを取得
        add_part_to_list(parts, 'cpu', PartsCpu, parts_data[:cpu_id]) { |p| total_price += p.price }
        add_part_to_list(parts, 'gpu', PartsGpu, parts_data[:gpu_id]) { |p| total_price += p.price }
        add_part_to_list(parts, 'memory', PartsMemory, parts_data[:memory_id]) { |p| total_price += p.price }
        add_part_to_list(parts, 'storage', PartsStorage, parts_data[:storage1_id]) { |p| total_price += p.price }
        add_part_to_list(parts, 'storage', PartsStorage, parts_data[:storage2_id]) { |p| total_price += p.price }
        add_part_to_list(parts, 'storage', PartsStorage, parts_data[:storage3_id]) { |p| total_price += p.price }
        add_part_to_list(parts, 'os', PartsOs, parts_data[:os_id]) { |p| total_price += p.price }
        add_part_to_list(parts, 'motherboard', PartsMotherboard, parts_data[:motherboard_id]) { |p| total_price += p.price }
        add_part_to_list(parts, 'psu', PartsPsu, parts_data[:psu_id]) { |p| total_price += p.price }
        add_part_to_list(parts, 'case', PartsCase, parts_data[:case_id]) { |p| total_price += p.price }

        render json: {
          data: {
            token: share_token.token,
            total_price: total_price,
            parts: parts,
            created_at: share_token.created_at
          }
        }
      rescue ActiveRecord::RecordNotFound
        render json: { error: { code: 'NOT_FOUND', message: '共有トークンが見つかりません' } }, status: :not_found
      end

      private

      def share_params
        params.permit(:cpu_id, :gpu_id, :memory_id, :storage1_id, :storage2_id, :storage3_id, :os_id, :motherboard_id, :psu_id, :case_id)
      end

      def add_part_to_list(parts, category, model_class, part_id)
        return unless part_id.present?

        part = model_class.find_by(id: part_id)
        return unless part

        yield(part) if block_given?

        parts << {
          category: category,
          part: {
            id: part.id,
            name: part.name,
            maker: part.maker,
            price: part.price
          }
        }
      end

      def build_query_string(parts)
        mapping = {
          'cpu_id' => 'cpu',
          'gpu_id' => 'gpu',
          'memory_id' => 'memory',
          'storage1_id' => 'storage1',
          'storage2_id' => 'storage2',
          'storage3_id' => 'storage3',
          'os_id' => 'os',
          'motherboard_id' => 'motherboard',
          'psu_id' => 'psu',
          'case_id' => 'case'
        }

        parts_hash = parts.is_a?(Hash) ? parts : parts.to_h
        parts_hash.compact.map { |k, v| "#{mapping[k.to_s] || k}=#{v}" }.join('&')
      end
    end
  end
end
