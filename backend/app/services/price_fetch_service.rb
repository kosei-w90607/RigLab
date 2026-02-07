# frozen_string_literal: true

class PriceFetchService
  Result = Struct.new(:success?, :price_history, :error, keyword_init: true)

  CATEGORY_MODELS = {
    'cpu' => PartsCpu, 'gpu' => PartsGpu, 'memory' => PartsMemory,
    'storage' => PartsStorage, 'os' => PartsOs, 'motherboard' => PartsMotherboard,
    'psu' => PartsPsu, 'case' => PartsCase
  }.freeze

  def initialize(part_type:, part_id:)
    @part_type = part_type
    @part_id = part_id
  end

  def call
    model = CATEGORY_MODELS[@part_type]
    return Result.new(success?: false, error: "不正なパーツタイプ: #{@part_type}") unless model

    part = model.find_by(id: @part_id)
    return Result.new(success?: false, error: 'パーツが見つかりません') unless part

    # 楽天APIで検索
    search_keyword = "#{part.maker} #{part.name}"
    api_result = RakutenApiClient.search(keyword: search_keyword, category: @part_type)
    return Result.new(success?: false, error: api_result.error) unless api_result.success?
    return Result.new(success?: false, error: '検索結果がありません') if api_result.items.empty?

    # ベストマッチ選定（名前類似度）
    best_item = find_best_match(part.name, api_result.items)

    # 価格履歴に保存
    history = PartsPriceHistory.create!(
      part_id: @part_id,
      part_type: @part_type,
      price: best_item[:price],
      source: 'rakuten',
      external_url: best_item[:url],
      product_name: best_item[:name],
      fetched_at: Time.current
    )

    # パーツの楽天情報を更新
    part.update!(
      rakuten_url: best_item[:url],
      rakuten_image_url: best_item[:image_url],
      last_price_checked_at: Time.current
    )

    Result.new(success?: true, price_history: history, error: nil)
  rescue StandardError => e
    Result.new(success?: false, error: e.message)
  end

  private

  def find_best_match(part_name, items)
    part_words = part_name.downcase.split(/[\s\-\/]+/)

    items.max_by do |item|
      item_words = item[:name].downcase.split(/[\s\-\/]+/)
      (part_words & item_words).size
    end
  end
end
