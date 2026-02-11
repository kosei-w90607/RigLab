# frozen_string_literal: true

module Api
  module V1
    module Cron
      class PriceFetchController < ApplicationController

        def create
          unless request.headers['Authorization'] == "Bearer #{ENV['CRON_SECRET']}"
            return head :unauthorized
          end

          results = PriceFetchAllJob.perform_now
          render json: {
            data: {
              message: '価格取得完了',
              total: results[:total],
              success: results[:success],
              failed: results[:failed],
              errors: results[:errors]
            }
          }
        end
      end
    end
  end
end
