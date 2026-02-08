# frozen_string_literal: true

class RakutenApiClient
  BASE_URL = 'https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20220601'
  RANKING_URL = 'https://openapi.rakuten.co.jp/ichibaranking/api/IchibaItem/Ranking/20220601'

  Result = Struct.new(:success?, :items, :total_count, :error, keyword_init: true)

  # PCパーツ親ジャンル
  PC_PARTS_GENRE_ID = 100087

  # 楽天ジャンルID（PCパーツサブカテゴリ）
  # https://www.rakuten.co.jp/category/100087/ で確認
  GENRE_IDS = {
    'cpu'         => 211582,
    'gpu'         => 100081,
    'memory'      => 565174,
    'storage'     => 408515,
    'motherboard' => 211607,
    'psu'         => 565175,
    'case'        => 211592
  }.freeze

  GENRE_TO_CATEGORY = GENRE_IDS.invert.transform_keys(&:to_s).freeze

  TRUSTED_SHOP_NAMES = %w[
    パソコン工房 ツクモ TSUKUMO ドスパラ Dospara
    アーク ark ソフマップ Sofmap コジマ Joshin
    ビックカメラ ヨドバシ PCワンズ FRONTIER フロンティア
    NTT-X
  ].freeze

  class << self
    def search(keyword:, category: nil, page: 1, hits: 20)
      return Result.new(success?: false, items: [], total_count: 0, error: 'RAKUTEN_APPLICATION_ID が設定されていません') unless application_id.present?
      return Result.new(success?: false, items: [], total_count: 0, error: 'RAKUTEN_ACCESS_KEY が設定されていません') unless access_key.present?
      return Result.new(success?: false, items: [], total_count: 0, error: 'キーワードを入力してください') if keyword.blank?

      enforce_rate_limit

      # カテゴリ固有 or PCパーツ親ジャンルで常に絞る
      genre_id = category.present? ? GENRE_IDS[category] : nil
      genre_id ||= PC_PARTS_GENRE_ID
      params = build_params(keyword: keyword, page: page, hits: hits, genre_id: genre_id)
      response = get_with_headers("#{BASE_URL}?#{URI.encode_www_form(params)}")

      if response.is_a?(Net::HTTPSuccess)
        data = JSON.parse(response.body)
        items = data['Items']&.map { |item| parse_item(item['Item']) } || []
        Result.new(success?: true, items: items, total_count: data['count'] || 0, error: nil)
      else
        error_data = JSON.parse(response.body) rescue {}
        error_msg = error_data.dig('error_description') || error_data.dig('errors', 'errorMessage') || "楽天API エラー: #{response.code}"
        Result.new(success?: false, items: [], total_count: 0, error: error_msg)
      end
    rescue StandardError => e
      Result.new(success?: false, items: [], total_count: 0, error: "API接続エラー: #{e.message}")
    end

    def ranking(category:, page: 1)
      return Result.new(success?: false, items: [], total_count: 0, error: 'RAKUTEN_APPLICATION_ID が設定されていません') unless application_id.present?
      return Result.new(success?: false, items: [], total_count: 0, error: 'RAKUTEN_ACCESS_KEY が設定されていません') unless access_key.present?

      enforce_rate_limit

      params = {
        applicationId: application_id,
        accessKey: access_key,
        page: page,
        format: 'json'
      }
      # カテゴリ固有ジャンル → PCパーツ親ジャンル → フォールバックなし
      genre_id = GENRE_IDS[category] || PC_PARTS_GENRE_ID
      params[:genreId] = genre_id

      response = get_with_headers("#{RANKING_URL}?#{URI.encode_www_form(params)}")

      if response.is_a?(Net::HTTPSuccess)
        data = JSON.parse(response.body)
        items = data['Items']&.each_with_index&.map do |item_wrapper, idx|
          item = item_wrapper['Item']
          {
            rank: item['rank'] || idx + 1,
            name: item['itemName'],
            price: item['itemPrice'],
            url: item['itemUrl'],
            image_url: item['mediumImageUrls']&.first&.dig('imageUrl'),
            shop_name: item['shopName'],
            item_code: item['itemCode'],
            review_count: item['reviewCount'] || 0,
            review_average: item['reviewAverage'] || 0.0
          }
        end || []
        Result.new(success?: true, items: items, total_count: items.size, error: nil)
      else
        error_data = JSON.parse(response.body) rescue {}
        error_msg = error_data.dig('error_description') || error_data.dig('errors', 'errorMessage') || "楽天API エラー: #{response.code}"
        Result.new(success?: false, items: [], total_count: 0, error: error_msg)
      end
    rescue StandardError => e
      Result.new(success?: false, items: [], total_count: 0, error: "API接続エラー: #{e.message}")
    end

    def detect_category(genre_id)
      return nil if genre_id.blank?
      GENRE_TO_CATEGORY[genre_id.to_s]
    end

    def filter_results(items, trusted_only: false)
      results = trusted_only ? items.select { |i| trusted_shop?(i[:shop_name]) } : items
      results.sort_by { |i| [trusted_shop?(i[:shop_name]) ? 0 : 1, i[:price]] }
    end

    def trusted_shop?(shop_name)
      return false if shop_name.blank?
      TRUSTED_SHOP_NAMES.any? { |name| shop_name.include?(name) }
    end

    private

    def application_id
      ENV['RAKUTEN_APPLICATION_ID']
    end

    def access_key
      ENV['RAKUTEN_ACCESS_KEY']
    end

    def allowed_website
      ENV.fetch('RAKUTEN_ALLOWED_WEBSITE', 'https://rig-lab.vercel.app')
    end

    def get_with_headers(url)
      uri = URI(url)
      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = true
      req = Net::HTTP::Get.new(uri)
      req['Referer'] = "#{allowed_website}/"
      req['Origin'] = allowed_website
      http.request(req)
    end

    def enforce_rate_limit
      @mutex ||= Mutex.new
      @mutex.synchronize do
        if @last_request_time
          elapsed = Time.current - @last_request_time
          sleep(1.0 - elapsed) if elapsed < 1.0
        end
        @last_request_time = Time.current
      end
    end

    def build_params(keyword:, page:, hits:, genre_id: nil)
      params = {
        applicationId: application_id,
        accessKey: access_key,
        keyword: keyword,
        page: page,
        hits: hits,
        format: 'json'
      }
      params[:genreId] = genre_id if genre_id
      params
    end

    def parse_item(item)
      genre_id = item['genreId']
      {
        name: item['itemName'],
        price: item['itemPrice'],
        url: item['itemUrl'],
        image_url: item['mediumImageUrls']&.first&.dig('imageUrl'),
        shop_name: item['shopName'],
        item_code: item['itemCode'],
        genre_id: genre_id,
        detected_category: detect_category(genre_id)
      }
    end
  end
end
