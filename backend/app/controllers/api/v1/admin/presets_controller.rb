# frozen_string_literal: true

module Api
  module V1
    module Admin
      class PresetsController < ApplicationController
        before_action :authenticate_user!
        before_action :require_admin!
        before_action :set_preset, only: %i[update destroy]

        def create
          preset = PcEntrustSet.new(preset_params)

          if preset.save
            render json: { data: serialize_preset(preset) }, status: :created
          else
            render json: { error: { code: 'VALIDATION_ERROR', message: preset.errors.full_messages.join(', ') } },
                   status: :unprocessable_entity
          end
        end

        def update
          if @preset.update(preset_params)
            render json: { data: serialize_preset(@preset) }
          else
            render json: { error: { code: 'VALIDATION_ERROR', message: @preset.errors.full_messages.join(', ') } },
                   status: :unprocessable_entity
          end
        end

        def destroy
          @preset.destroy
          head :no_content
        end

        private

        def require_admin!
          return if current_user.admin?

          render json: { error: { code: 'FORBIDDEN', message: '管理者権限が必要です' } }, status: :forbidden
        end

        def set_preset
          @preset = PcEntrustSet.find(params[:id])
        rescue ActiveRecord::RecordNotFound
          render json: { error: { code: 'NOT_FOUND', message: 'プリセットが見つかりません' } }, status: :not_found
        end

        def preset_params
          permitted = params.permit(
            :name, :description, :budget_range, :use_case,
            parts: %i[cpu_id gpu_id memory_id storage1_id storage2_id storage3_id os_id motherboard_id psu_id case_id]
          )

          # partsパラメータをフラット化
          result = permitted.except(:parts).to_h
          if permitted[:parts].present?
            permitted[:parts].each do |key, value|
              result[key] = value
            end
          end
          result
        end

        def serialize_preset(preset)
          {
            id: preset.id,
            name: preset.name,
            description: preset.description,
            budget_range: preset.budget_range,
            use_case: preset.use_case,
            parts: {
              cpu_id: preset.cpu_id,
              gpu_id: preset.gpu_id,
              memory_id: preset.memory_id,
              storage1_id: preset.storage1_id,
              storage2_id: preset.storage2_id,
              storage3_id: preset.storage3_id,
              os_id: preset.os_id,
              motherboard_id: preset.motherboard_id,
              psu_id: preset.psu_id,
              case_id: preset.case_id
            },
            created_at: preset.created_at,
            updated_at: preset.updated_at
          }
        end
      end
    end
  end
end
