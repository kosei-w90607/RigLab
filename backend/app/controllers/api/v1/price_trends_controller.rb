# frozen_string_literal: true

module Api
  module V1
    class PriceTrendsController < ApplicationController
      skip_before_action :authenticate_user!, raise: false

      CATEGORY_MODELS = BuyTimeAdvisorService::CATEGORY_MODELS
      CATEGORY_LABELS = BuyTimeAdvisorService::CATEGORY_LABELS

      def categories
        summaries = BuyTimeAdvisorService::DISPLAY_CATEGORIES.map do |part_type|
          model = CATEGORY_MODELS[part_type]
          next nil unless model

          pt = BuyTimeAdvisorService.price_history_part_type(part_type)
          scope = model.all
          scope = scope.public_send(part_type) if %w[ssd hdd].include?(part_type)

          histories = PartsPriceHistory.where(part_type: pt).recent(30)
          if %w[ssd hdd].include?(part_type)
            histories = histories.where(part_id: scope.pluck(:id))
          end
          next nil if histories.empty?

          prices = histories.pluck(:price)
          first_avg = histories.order(fetched_at: :asc).limit(5).pluck(:price).then { |p| p.empty? ? 0 : (p.sum.to_f / p.size).round }
          last_avg = histories.order(fetched_at: :desc).limit(5).pluck(:price).then { |p| p.empty? ? 0 : (p.sum.to_f / p.size).round }
          change = first_avg.zero? ? 0.0 : ((last_avg - first_avg).to_f / first_avg * 100).round(1)

          daily_averages = BuyTimeAdvisorService.category_daily_averages(category: part_type, days: 30)

          {
            category: part_type,
            label: CATEGORY_LABELS[part_type],
            avg_change_percent: change,
            direction: change < 0 ? 'down' : change > 0 ? 'up' : 'stable',
            part_count: scope.count,
            avg_price: (prices.sum.to_f / prices.size).round,
            daily_averages: daily_averages
          }
        end.compact

        render json: { data: summaries }
      end

      def category_detail
        category = params[:category]
        model = CATEGORY_MODELS[category]
        return render json: { error: { code: 'NOT_FOUND', message: '不正なカテゴリ' } }, status: :not_found unless model

        sort_by = params[:sort_by] || 'price'
        sort_order = params[:sort_order] || 'asc'

        pt = BuyTimeAdvisorService.price_history_part_type(category)
        scope = model.all
        scope = scope.public_send(category) if %w[ssd hdd].include?(category)

        parts = scope.map do |part|
          current_price = part.price

          price_7d_ago = PartsPriceHistory.for_part(pt, part.id)
                                          .where('fetched_at <= ?', 7.days.ago)
                                          .order(fetched_at: :desc).first&.price
          price_30d_ago = PartsPriceHistory.for_part(pt, part.id)
                                           .where('fetched_at <= ?', 30.days.ago)
                                           .order(fetched_at: :desc).first&.price

          price_diff_7d = price_7d_ago ? current_price - price_7d_ago : nil
          price_diff_30d = price_30d_ago ? current_price - price_30d_ago : nil
          change_percent_7d = price_7d_ago && price_7d_ago > 0 ? ((current_price - price_7d_ago).to_f / price_7d_ago * 100).round(1) : nil
          change_percent_30d = price_30d_ago && price_30d_ago > 0 ? ((current_price - price_30d_ago).to_f / price_30d_ago * 100).round(1) : nil

          {
            id: part.id,
            name: part.name,
            maker: part.try(:maker),
            current_price: current_price,
            price_diff_7d: price_diff_7d,
            price_diff_30d: price_diff_30d,
            change_percent_7d: change_percent_7d,
            change_percent_30d: change_percent_30d,
            rakuten_image_url: part.try(:rakuten_image_url),
            rakuten_url: part.try(:rakuten_url)
          }
        end

        parts = sort_parts(parts, sort_by, sort_order)

        daily_averages = BuyTimeAdvisorService.category_daily_averages(category: category, days: 30)

        render json: {
          data: {
            category: category,
            label: CATEGORY_LABELS[category],
            parts: parts,
            daily_averages: daily_averages
          }
        }
      end

      private

      def sort_parts(parts, sort_by, sort_order)
        sort_key = case sort_by
                   when 'price' then :current_price
                   when 'change_7d' then :change_percent_7d
                   when 'change_30d' then :change_percent_30d
                   else :current_price
                   end

        sorted = parts.sort_by { |p| p[sort_key] || 0 }
        sort_order == 'desc' ? sorted.reverse : sorted
      end
    end
  end
end
