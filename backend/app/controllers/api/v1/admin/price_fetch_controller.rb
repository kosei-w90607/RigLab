# frozen_string_literal: true

module Api
  module V1
    module Admin
      class PriceFetchController < ApplicationController
        before_action :require_admin!

        CATEGORY_MODELS = {
          'cpu' => PartsCpu, 'gpu' => PartsGpu, 'memory' => PartsMemory,
          'storage' => PartsStorage, 'os' => PartsOs, 'motherboard' => PartsMotherboard,
          'psu' => PartsPsu, 'case' => PartsCase
        }.freeze

        def create
          part_type = params[:part_type]
          part_id = params[:part_id]

          if part_id.present?
            result = PriceFetchService.new(part_type: part_type, part_id: part_id).call
            if result.success?
              render json: { data: { message: '価格を取得しました', price: result.price_history.price } }
            else
              render json: { error: { code: 'FETCH_ERROR', message: result.error } }, status: :unprocessable_entity
            end
          else
            model = CATEGORY_MODELS[part_type]
            return render json: { error: { code: 'INVALID', message: '不正なパーツタイプ' } }, status: :unprocessable_entity unless model

            count = 0
            model.find_each do |part|
              result = PriceFetchService.new(part_type: part_type, part_id: part.id).call
              count += 1 if result.success?
            end

            render json: { data: { message: "#{count}件の価格を取得しました" } }
          end
        end

        private


      end
    end
  end
end
