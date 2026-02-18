# frozen_string_literal: true

module Api
  module V1
    module Admin
      class PartsController < ApplicationController
        before_action :require_admin!
        before_action :set_part, only: %i[update destroy link_rakuten]

        CATEGORY_MODEL_MAP = {
          'cpu' => PartsCpu,
          'gpu' => PartsGpu,
          'memory' => PartsMemory,
          'storage' => PartsStorage,
          'os' => PartsOs,
          'motherboard' => PartsMotherboard,
          'psu' => PartsPsu,
          'case' => PartsCase
        }.freeze

        def create
          model_class = find_model_class
          return render_invalid_category if model_class.nil?

          part = model_class.new(part_params)

          if part.save
            render json: { data: serialize_part(part) }, status: :created
          else
            render json: { error: { code: 'VALIDATION_ERROR', message: part.errors.full_messages.join(', ') } },
                   status: :unprocessable_entity
          end
        end

        def update
          if @part.update(part_params)
            render json: { data: serialize_part(@part) }
          else
            render json: { error: { code: 'VALIDATION_ERROR', message: @part.errors.full_messages.join(', ') } },
                   status: :unprocessable_entity
          end
        end

        def destroy
          @part.destroy
          head :no_content
        end

        def link_rakuten
          permitted = params.permit(:rakuten_url, :rakuten_image_url, :item_price, :category)

          @part.update!(
            rakuten_url: permitted[:rakuten_url],
            rakuten_image_url: permitted[:rakuten_image_url]
          )

          if permitted[:item_price].present?
            PartsPriceHistory.create!(
              part_id: @part.id,
              part_type: permitted[:category],
              price: permitted[:item_price].to_i,
              source: 'rakuten',
              external_url: permitted[:rakuten_url],
              product_name: @part.name,
              fetched_at: Time.current
            )
          end

          render json: { data: { message: '楽天情報を紐付けました' } }
        rescue ActiveRecord::RecordInvalid => e
          render json: { error: { code: 'VALIDATION_ERROR', message: e.message } }, status: :unprocessable_entity
        end

        private

        def find_model_class
          CATEGORY_MODEL_MAP[params[:category]]
        end

        def set_part
          model_class = find_model_class
          return render_invalid_category if model_class.nil?

          @part = model_class.find(params[:id])
        rescue ActiveRecord::RecordNotFound
          render json: { error: { code: 'NOT_FOUND', message: 'パーツが見つかりません' } }, status: :not_found
        end

        def render_invalid_category
          render json: { error: { code: 'INVALID_CATEGORY', message: '無効なカテゴリです' } },
                 status: :unprocessable_entity
        end

        def part_params
          # 基本パラメータ + カテゴリ固有のカラム
          permitted = params.permit(
            :name, :maker, :price,
            # CPU
            :socket, :tdp, :memory_type,
            # GPU
            :length_mm,
            # メモリ（memory_typeは上で既に含む）
            # ストレージ
            :capacity_gb, :interface, :storage_type,
            # OS
            :version, :edition,
            # マザーボード（socket, memory_typeは上で既に含む）
            :form_factor,
            # 電源（form_factorは上で既に含む）
            :wattage,
            # ケース（form_factorは上で既に含む）
            :max_gpu_length_mm,
            # specsはJSON
            specs: {}
          )

          permitted
        end

        def serialize_part(part)
          {
            id: part.id,
            category: params[:category],
            name: part.name,
            maker: part.maker,
            price: part.price,
            specs: part.specs,
            created_at: part.created_at,
            updated_at: part.updated_at
          }
        end
      end
    end
  end
end
