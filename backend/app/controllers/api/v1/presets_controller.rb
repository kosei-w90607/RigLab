# frozen_string_literal: true

module Api
  module V1
    class PresetsController < ApplicationController
      before_action :set_preset, only: [:show]

      def index
        presets = PcEntrustSet.all
        presets = apply_filters(presets)
        presets = presets.page(page_param).per(per_page_param)

        render json: {
          data: presets.map { |preset| serialize_preset(preset) },
          meta: {
            total: presets.total_count,
            page: presets.current_page,
            per_page: presets.limit_value
          }
        }
      end

      def show
        render json: {
          data: serialize_preset_detail(@preset)
        }
      end

      private

      def apply_filters(presets)
        presets = presets.where(budget_range: params[:budget]) if params[:budget].present?
        presets = presets.where(use_case: params[:use_case]) if params[:use_case].present?
        presets
      end

      def set_preset
        @preset = PcEntrustSet.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: { code: 'NOT_FOUND', message: 'プリセットが見つかりません' } }, status: :not_found
      end

      def serialize_preset(preset)
        {
          id: preset.id,
          name: preset.name,
          budget_range: preset.budget_range,
          use_case: preset.use_case,
          total_price: preset.total_price,
          cpu: serialize_part(preset.cpu),
          gpu: serialize_part(preset.gpu),
          memory: serialize_part(preset.memory),
          storage1: serialize_part(preset.storage1),
          os: serialize_part(preset.os),
          motherboard: serialize_part(preset.motherboard),
          psu: serialize_part(preset.psu),
          case: serialize_part(preset.case)
        }
      end

      def serialize_preset_detail(preset)
        {
          id: preset.id,
          name: preset.name,
          description: preset.description,
          budget_range: preset.budget_range,
          use_case: preset.use_case,
          total_price: preset.total_price,
          parts: serialize_parts(preset),
          created_at: preset.created_at,
          updated_at: preset.updated_at
        }
      end

      def serialize_parts_summary(preset)
        parts = []
        add_part(parts, 'cpu', preset.cpu)
        add_part(parts, 'gpu', preset.gpu)
        parts
      end

      def serialize_parts(preset)
        parts = []
        add_part(parts, 'cpu', preset.cpu)
        add_part(parts, 'gpu', preset.gpu)
        add_part(parts, 'memory', preset.memory)
        add_part(parts, 'storage', preset.storage1)
        add_part(parts, 'storage', preset.storage2)
        add_part(parts, 'storage', preset.storage3)
        add_part(parts, 'os', preset.os)
        add_part(parts, 'motherboard', preset.motherboard)
        add_part(parts, 'psu', preset.psu)
        add_part(parts, 'case', preset.case)
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

      def serialize_part(part)
        return nil unless part

        {
          id: part.id,
          name: part.name,
          maker: part.maker,
          price: part.price
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
