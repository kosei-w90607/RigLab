# frozen_string_literal: true

class BuyTimeAdvisorService
  Result = Struct.new(:verdict, :message, :confidence, :trend_summary, keyword_init: true)

  CATEGORY_MODELS = {
    'cpu' => PartsCpu, 'gpu' => PartsGpu, 'memory' => PartsMemory,
    'ssd' => PartsStorage, 'hdd' => PartsStorage,
    'storage' => PartsStorage, 'os' => PartsOs, 'motherboard' => PartsMotherboard,
    'psu' => PartsPsu, 'case' => PartsCase
  }.freeze

  CATEGORY_LABELS = {
    'cpu' => 'CPU', 'gpu' => 'グラフィックボード', 'memory' => 'メモリ',
    'ssd' => 'SSD', 'hdd' => 'HDD', 'storage' => 'ストレージ',
    'os' => 'OS', 'motherboard' => 'マザーボード', 'psu' => '電源', 'case' => 'ケース'
  }.freeze

  # 価格動向画面に表示するカテゴリ（storageとosを除外）
  DISPLAY_CATEGORIES = %w[cpu gpu memory ssd hdd motherboard psu case].freeze

  # ssd/hdd → storage マッピング（price history検索用）
  def self.price_history_part_type(category)
    case category
    when 'ssd', 'hdd' then 'storage'
    else category
    end
  end

  def initialize(part_type:, part_id:, days: 30)
    @part_type = part_type
    @part_id = part_id
    @days = days
  end

  def call
    histories = PartsPriceHistory.for_part(@part_type, @part_id).recent(@days).order(fetched_at: :asc)

    return no_data_result if histories.empty?

    prices = histories.map(&:price)
    first_price = prices.first
    last_price = prices.last
    avg_price = (prices.sum.to_f / prices.size).round
    change_percent = calculate_change_percent(first_price, last_price)

    trend_summary = {
      direction: change_percent < 0 ? 'down' : change_percent > 0 ? 'up' : 'stable',
      change_percent: change_percent,
      avg_price: avg_price,
      min_price: prices.min,
      max_price: prices.max
    }

    verdict, message, confidence = determine_advice(change_percent, last_price, avg_price)

    Result.new(verdict: verdict, message: message, confidence: confidence, trend_summary: trend_summary)
  end

  # カテゴリ別トレンドサマリー
  def self.category_trends
    CATEGORY_MODELS.map do |part_type, model|
      histories = PartsPriceHistory.where(part_type: part_type).recent(30)
      next nil if histories.empty?

      prices = histories.pluck(:price)
      first_avg = histories.order(fetched_at: :asc).limit(5).pluck(:price).then { |p| p.empty? ? 0 : (p.sum.to_f / p.size).round }
      last_avg = histories.order(fetched_at: :desc).limit(5).pluck(:price).then { |p| p.empty? ? 0 : (p.sum.to_f / p.size).round }
      change = first_avg.zero? ? 0.0 : ((last_avg - first_avg).to_f / first_avg * 100).round(1)

      {
        category: part_type,
        label: CATEGORY_LABELS[part_type],
        avg_change_percent: change,
        direction: change < 0 ? 'down' : change > 0 ? 'up' : 'stable',
        part_count: model.count
      }
    end.compact
  end

  # ベストディール（値下がりパーツ上位）
  def self.best_deals(limit: 5)
    deals = []

    CATEGORY_MODELS.each do |part_type, model|
      model.find_each do |part|
        advisor = new(part_type: part_type, part_id: part.id)
        result = advisor.call
        next if result.trend_summary.nil?
        next unless result.verdict == 'buy_now'

        price_7d_ago = PartsPriceHistory.for_part(part_type, part.id)
                                        .where('fetched_at <= ?', 7.days.ago)
                                        .order(fetched_at: :desc).first&.price
        price_diff = price_7d_ago ? part.price - price_7d_ago : nil

        deals << {
          part_type: part_type,
          part_id: part.id,
          part_name: part.name,
          current_price: part.price,
          change_percent: result.trend_summary[:change_percent],
          price_diff: price_diff,
          verdict: result.verdict,
          message: result.message
        }
      end
    end

    deals.sort_by { |d| d[:change_percent] }.first(limit)
  end

  # 最大値下がり/値上がりパーツ（カテゴリ多様性付き）
  def self.biggest_changes(direction: :down, limit: 5)
    changes = []

    CATEGORY_MODELS.each do |part_type, model|
      model.find_each do |part|
        histories = PartsPriceHistory.for_part(part_type, part.id).recent(30).order(fetched_at: :asc)
        next if histories.size < 2

        prices = histories.map(&:price)
        change = ((prices.last - prices.first).to_f / prices.first * 100).round(1)

        changes << {
          part_type: part_type,
          part_id: part.id,
          part_name: part.name,
          current_price: part.price,
          change_percent: change
        }
      end
    end

    sorted = if direction == :down
               changes.sort_by { |c| c[:change_percent] }
             else
               changes.sort_by { |c| -c[:change_percent] }
             end

    # カテゴリ多様性: 1カテゴリあたり最大2件
    category_counts = Hash.new(0)
    sorted.select do |c|
      if category_counts[c[:part_type]] < 2
        category_counts[c[:part_type]] += 1
        true
      else
        false
      end
    end.first(limit)
  end

  # カテゴリ別日次平均価格（スパークラインチャート用）
  def self.category_daily_averages(category:, days: 30)
    pt = price_history_part_type(category)
    histories = PartsPriceHistory.where(part_type: pt)
                                 .where('fetched_at >= ?', days.days.ago)

    # ssd/hdd の場合は該当パーツIDに絞り込み
    if %w[ssd hdd].include?(category)
      part_ids = CATEGORY_MODELS[category].public_send(category).pluck(:id)
      histories = histories.where(part_id: part_ids)
    end

    histories.order(fetched_at: :asc).group_by { |h| h.fetched_at.to_date }.map do |date, records|
      prices = records.map(&:price)
      { date: date.to_s, avg_price: (prices.sum.to_f / prices.size).round }
    end
  end

  private

  def determine_advice(change_percent, current_price, avg_price)
    if change_percent <= -5
      ['buy_now', "おっ、今がチャンスだぞ！#{change_percent.abs}%も値下がりしてる。買い時じゃ！", 0.85]
    elsif change_percent >= 5
      ['wait', "うーむ、今は高値圏じゃな。もう少し待つのが賢明じゃ。", 0.8]
    elsif current_price <= avg_price
      ['buy_now', "平均価格より安いぞ！悪くないタイミングじゃ。", 0.65]
    else
      ['neutral', "価格は安定しとるな。急ぎでなければ様子見もアリじゃ。", 0.5]
    end
  end

  def no_data_result
    Result.new(
      verdict: 'neutral',
      message: 'まだ価格データが集まっとらんな。もう少し待ってくれ。',
      confidence: 0.0,
      trend_summary: nil
    )
  end

  def calculate_change_percent(old_price, new_price)
    return 0.0 if old_price.nil? || old_price.zero?
    ((new_price - old_price).to_f / old_price * 100).round(1)
  end
end
