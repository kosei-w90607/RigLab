# frozen_string_literal: true

module Api
  module V1
    module Admin
      class RakutenSearchController < ApplicationController
        before_action :authenticate_user!
        before_action :require_admin!

        def index
          result = RakutenApiClient.search(
            keyword: params[:keyword],
            category: params[:category],
            page: params[:page] || 1,
            hits: params[:hits] || 20
          )

          if result.success?
            items = RakutenApiClient.filter_noise(result.items, params[:category])
            items = RakutenApiClient.filter_results(
              items,
              trusted_only: params[:trusted_only] == 'true'
            )
            render json: {
              data: {
                items: items,
                total_count: result.total_count
              }
            }
          else
            render json: { error: { code: 'API_ERROR', message: result.error } }, status: :unprocessable_entity
          end
        end

        private

        def require_admin!
          return if current_user.admin?

          render json: { error: { code: 'FORBIDDEN', message: '管理者権限が必要です' } }, status: :forbidden
        end
      end
    end
  end
end
