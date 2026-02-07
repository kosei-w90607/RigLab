# frozen_string_literal: true

module Api
  module V1
    class BuyAdviceController < ApplicationController
      skip_before_action :authenticate_user!, raise: false

      CATEGORY_MODELS = {
        'cpu' => PartsCpu, 'gpu' => PartsGpu, 'memory' => PartsMemory,
        'storage' => PartsStorage, 'os' => PartsOs, 'motherboard' => PartsMotherboard,
        'psu' => PartsPsu, 'case' => PartsCase
      }.freeze

      def show
        part_type = params[:part_type]
        part_id = params[:part_id]

        model = CATEGORY_MODELS[part_type]
        return render_not_found('不正なパーツタイプ') unless model

        part = model.find_by(id: part_id)
        return render_not_found('パーツが見つかりません') unless part

        result = BuyTimeAdvisorService.new(part_type: part_type, part_id: part_id).call

        render json: {
          data: {
            verdict: result.verdict,
            message: result.message,
            confidence: result.confidence,
            trend_summary: result.trend_summary
          }
        }
      end

      def summary
        render json: {
          data: {
            best_deals: BuyTimeAdvisorService.best_deals(limit: 4),
            category_trends: BuyTimeAdvisorService.category_trends,
            biggest_drops: BuyTimeAdvisorService.biggest_changes(direction: :down, limit: 5),
            biggest_rises: BuyTimeAdvisorService.biggest_changes(direction: :up, limit: 5)
          }
        }
      end

      private

      def render_not_found(message)
        render json: { error: { code: 'NOT_FOUND', message: message } }, status: :not_found
      end
    end
  end
end
