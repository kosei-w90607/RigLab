# frozen_string_literal: true

module Api
  module V1
    module Cron
      class PriceFetchController < ApplicationController
        skip_before_action :authenticate_user!, only: [:create]

        def create
          unless request.headers['Authorization'] == "Bearer #{ENV['CRON_SECRET']}"
            return head :unauthorized
          end

          PriceFetchAllJob.perform_now
          render json: { data: { message: '価格取得完了' } }
        end
      end
    end
  end
end
