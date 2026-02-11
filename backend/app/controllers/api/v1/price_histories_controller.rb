# frozen_string_literal: true

module Api
  module V1
    class PriceHistoriesController < ApplicationController

      CATEGORY_MODELS = {
        'cpu' => PartsCpu, 'gpu' => PartsGpu, 'memory' => PartsMemory,
        'ssd' => PartsStorage, 'hdd' => PartsStorage,
        'storage' => PartsStorage, 'os' => PartsOs, 'motherboard' => PartsMotherboard,
        'psu' => PartsPsu, 'case' => PartsCase
      }.freeze

      def show
        part_type = params[:part_type]
        part_id = params[:part_id]
        days = (params[:days] || 30).to_i
        source = params[:source]

        model = CATEGORY_MODELS[part_type]
        return render_not_found('不正なパーツタイプ') unless model

        part = if %w[ssd hdd].include?(part_type)
                 model.public_send(part_type).find_by(id: part_id)
               else
                 model.find_by(id: part_id)
               end
        return render_not_found('パーツが見つかりません') unless part

        pt = BuyTimeAdvisorService.price_history_part_type(part_type)

        histories = PartsPriceHistory.for_part(pt, part_id).recent(days).order(fetched_at: :asc)
        histories = histories.by_source(source) if source.present?

        trend = calculate_trend(histories)
        initial_record = PartsPriceHistory.for_part(pt, part_id).order(fetched_at: :asc).first
        current_price = histories.last&.price || part.price

        price_7d_ago = PartsPriceHistory.for_part(pt, part_id)
                                        .where('fetched_at <= ?', 7.days.ago)
                                        .order(fetched_at: :desc).first&.price
        price_30d_ago = PartsPriceHistory.for_part(pt, part_id)
                                         .where('fetched_at <= ?', 30.days.ago)
                                         .order(fetched_at: :desc).first&.price

        render json: {
          data: {
            part_type: part_type,
            part_id: part_id.to_i,
            part_name: part.name,
            current_price: current_price,
            initial_price: initial_record&.price,
            price_since_launch: initial_record ? calculate_change_percent(initial_record.price, current_price) : nil,
            price_diff_7d: price_7d_ago ? current_price - price_7d_ago : nil,
            price_diff_30d: price_30d_ago ? current_price - price_30d_ago : nil,
            rakuten_url: part.try(:rakuten_url),
            rakuten_image_url: part.try(:rakuten_image_url),
            histories: histories.map { |h| { price: h.price, source: h.source, fetched_at: h.fetched_at.strftime('%Y-%m-%d') } },
            trend: trend
          }
        }
      end

      private

      def calculate_trend(histories)
        return nil if histories.empty?

        prices = histories.map(&:price)
        first_price = prices.first
        last_price = prices.last

        {
          direction: last_price < first_price ? 'down' : last_price > first_price ? 'up' : 'stable',
          change_percent: calculate_change_percent(first_price, last_price),
          min_price: prices.min,
          max_price: prices.max,
          avg_price: (prices.sum.to_f / prices.size).round
        }
      end

      def calculate_change_percent(old_price, new_price)
        return 0.0 if old_price.nil? || old_price.zero?
        ((new_price - old_price).to_f / old_price * 100).round(1)
      end

      def render_not_found(message)
        render json: { error: { code: 'NOT_FOUND', message: message } }, status: :not_found
      end
    end
  end
end
