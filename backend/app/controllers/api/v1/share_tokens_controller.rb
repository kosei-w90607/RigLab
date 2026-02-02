# frozen_string_literal: true

module Api
  module V1
    class ShareTokensController < ApplicationController
      # 認証不要（誰でもアクセス可能）

      def show
        share_token = ShareToken.find_by!(token: params[:token])

        render json: {
          data: serialize_share_token(share_token)
        }
      rescue ActiveRecord::RecordNotFound
        render json: { error: { code: 'NOT_FOUND', message: '共有データが見つかりません' } }, status: :not_found
      end

      def create
        share_token = ShareToken.new(parts_data: share_token_params)

        if share_token.save
          render json: {
            data: {
              token: share_token.token,
              url: "/share/#{share_token.token}"
            }
          }, status: :created
        else
          render json: {
            error: { code: 'VALIDATION_ERROR', message: share_token.errors.full_messages.join(', ') }
          }, status: :unprocessable_entity
        end
      end

      private

      def share_token_params
        params.permit(:cpu_id, :gpu_id, :memory_id, :storage1_id, :storage2_id, :storage3_id,
                      :os_id, :motherboard_id, :psu_id, :case_id).to_h
      end

      def serialize_share_token(share_token)
        {
          token: share_token.token,
          total_price: share_token.total_price,
          parts: serialize_parts(share_token),
          created_at: share_token.created_at
        }
      end

      def serialize_parts(share_token)
        parts = []
        add_part(parts, 'cpu', share_token.cpu)
        add_part(parts, 'gpu', share_token.gpu)
        add_part(parts, 'memory', share_token.memory)
        add_part(parts, 'storage', share_token.storage1)
        add_part(parts, 'storage', share_token.storage2)
        add_part(parts, 'storage', share_token.storage3)
        add_part(parts, 'os', share_token.os)
        add_part(parts, 'motherboard', share_token.motherboard)
        add_part(parts, 'psu', share_token.psu)
        add_part(parts, 'case', share_token.case_part)
        parts
      end

      def add_part(parts, category, part)
        return unless part

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
    end
  end
end
