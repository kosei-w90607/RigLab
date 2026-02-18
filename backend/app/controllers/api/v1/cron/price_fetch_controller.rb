# frozen_string_literal: true

module Api
  module V1
    module Cron
      class PriceFetchController < ApplicationController

        def create
          cron_secret = ENV['CRON_SECRET']
          unless cron_secret.present? && ActiveSupport::SecurityUtils.secure_compare(
            request.headers['Authorization'].to_s, "Bearer #{cron_secret}"
          )
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
