# frozen_string_literal: true

module Api
  module V1
    class BuildsController < ApplicationController
      before_action :authenticate_user!, except: [:shared]
      before_action :set_build, only: %i[show update destroy]

      def index
        builds = current_user.pc_custom_sets.page(page_param).per(per_page_param)

        render json: {
          data: builds.map { |build| serialize_build_summary(build) },
          meta: {
            total: builds.total_count,
            page: builds.current_page,
            per_page: builds.limit_value
          }
        }
      end

      def show
        render json: {
          data: serialize_build_detail(@build)
        }
      end

      def shared
        build = PcCustomSet.find_by!(share_token: params[:share_token])

        render json: {
          data: serialize_build_detail(build)
        }
      rescue ActiveRecord::RecordNotFound
        render json: { error: { code: 'NOT_FOUND', message: '構成が見つかりません' } }, status: :not_found
      end

      def create
        build = current_user.pc_custom_sets.new(build_params)

        if build.save
          render json: { data: serialize_build_detail(build) }, status: :created
        else
          render json: { error: { code: 'VALIDATION_ERROR', message: build.errors.full_messages.join(', ') } },
                 status: :unprocessable_entity
        end
      end

      def update
        if @build.update(build_params)
          render json: { data: serialize_build_detail(@build) }
        else
          render json: { error: { code: 'VALIDATION_ERROR', message: @build.errors.full_messages.join(', ') } },
                 status: :unprocessable_entity
        end
      end

      def destroy
        @build.destroy
        head :no_content
      end

      private

      def set_build
        @build = current_user.pc_custom_sets.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: { code: 'NOT_FOUND', message: '構成が見つかりません' } }, status: :not_found
      end

      def build_params
        permitted = params.permit(:name, parts: %i[cpu_id gpu_id memory_id storage1_id storage2_id storage3_id os_id motherboard_id psu_id case_id])

        result = { name: permitted[:name] }
        result.merge!(permitted[:parts].to_h) if permitted[:parts].present?
        result
      end

      def serialize_build_summary(build)
        {
          id: build.id,
          name: build.name,
          total_price: build.total_price,
          share_token: build.share_token,
          created_at: build.created_at,
          updated_at: build.updated_at
        }
      end

      def serialize_build_detail(build)
        {
          id: build.id,
          name: build.name,
          total_price: build.total_price,
          share_token: build.share_token,
          parts: serialize_parts(build),
          user: build.user ? { id: build.user.id, name: build.user.name } : nil,
          created_at: build.created_at,
          updated_at: build.updated_at
        }
      end

      def serialize_parts(build)
        parts = []
        add_part(parts, 'cpu', build.cpu)
        add_part(parts, 'gpu', build.gpu)
        add_part(parts, 'memory', build.memory)
        add_part(parts, 'storage', build.storage1)
        add_part(parts, 'storage', build.storage2)
        add_part(parts, 'storage', build.storage3)
        add_part(parts, 'os', build.os)
        add_part(parts, 'motherboard', build.motherboard)
        add_part(parts, 'psu', build.psu)
        add_part(parts, 'case', build.case)
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

      def page_param
        params[:page] || 1
      end

      def per_page_param
        params[:per_page] || 20
      end
    end
  end
end
