# frozen_string_literal: true

module Api
  module V1
    module Admin
      class PartsController < ApplicationController
        before_action :authenticate_user!
        before_action :require_admin!
        before_action :set_part, only: %i[update destroy]

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

        private

        def require_admin!
          return if current_user.admin?

          render json: { error: { code: 'FORBIDDEN', message: '管理者権限が必要です' } }, status: :forbidden
        end

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
            # Memory (memory_type is already included)
            # Storage
            :capacity_gb, :interface, :storage_type,
            # OS
            :version, :edition,
            # Motherboard (socket, memory_type already included)
            :form_factor,
            # PSU (form_factor already included)
            :wattage,
            # Case (form_factor already included)
            :max_gpu_length_mm,
            # specs as JSON
            specs: {}
          )

          # specsパラメータがない場合はparamsから直接取得を試みる
          if params[:specs].present? && params[:specs].is_a?(ActionController::Parameters)
            permitted[:specs] = params[:specs].to_unsafe_h
          elsif params[:specs].present? && params[:specs].is_a?(Hash)
            permitted[:specs] = params[:specs]
          end

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
