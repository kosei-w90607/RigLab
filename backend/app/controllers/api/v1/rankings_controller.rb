# frozen_string_literal: true

module Api
  module V1
    class RankingsController < ApplicationController

      def index
        category = params[:category]

        result = RakutenApiClient.ranking(category: category, page: 1)

        if result.success?
          render json: { data: { items: result.items, total_count: result.total_count } }
        else
          render json: { error: { code: 'API_ERROR', message: result.error } }, status: :unprocessable_entity
        end
      end
    end
  end
end
