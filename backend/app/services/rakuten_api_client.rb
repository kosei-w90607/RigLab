# frozen_string_literal: true

class RakutenApiClient
  BASE_URL = 'https://app.rakuten.co.jp/services/api/IchibaItem/Search/20220601'
  PC_PARTS_GENRE_ID = '100087'

  Result = Struct.new(:success?, :items, :total_count, :error, keyword_init: true)

  CATEGORY_GENRE_MAP = {
    'cpu' => '564500',
    'gpu' => '564498',
    'memory' => '564504',
    'storage' => '564506',
    'motherboard' => '564496',
    'psu' => '564508',
    'case' => '564494',
    'os' => '553888'
  }.freeze

  class << self
    def search(keyword:, category: nil, page: 1, hits: 20)
      return Result.new(success?: false, items: [], total_count: 0, error: 'RAKUTEN_APPLICATION_ID が設定されていません') unless application_id.present?
      return Result.new(success?: false, items: [], total_count: 0, error: 'キーワードを入力してください') if keyword.blank?

      enforce_rate_limit

      params = build_params(keyword: keyword, category: category, page: page, hits: hits)
      uri = URI("#{BASE_URL}?#{URI.encode_www_form(params)}")

      response = Net::HTTP.get_response(uri)

      if response.is_a?(Net::HTTPSuccess)
        data = JSON.parse(response.body)
        items = data['Items']&.map { |item| parse_item(item['Item']) } || []
        Result.new(success?: true, items: items, total_count: data['count'] || 0, error: nil)
      else
        error_data = JSON.parse(response.body) rescue {}
        error_msg = error_data.dig('error_description') || "楽天API エラー: #{response.code}"
        Result.new(success?: false, items: [], total_count: 0, error: error_msg)
      end
    rescue StandardError => e
      Result.new(success?: false, items: [], total_count: 0, error: "API接続エラー: #{e.message}")
    end

    private

    def application_id
      ENV['RAKUTEN_APPLICATION_ID']
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

    def build_params(keyword:, category:, page:, hits:)
      params = {
        applicationId: application_id,
        keyword: keyword,
        page: page,
        hits: hits,
        format: 'json'
      }

      genre_id = CATEGORY_GENRE_MAP[category] || PC_PARTS_GENRE_ID
      params[:genreId] = genre_id

      params
    end

    def parse_item(item)
      {
        name: item['itemName'],
        price: item['itemPrice'],
        url: item['itemUrl'],
        image_url: item['mediumImageUrls']&.first&.dig('imageUrl'),
        shop_name: item['shopName'],
        item_code: item['itemCode'],
        genre_id: item['genreId']
      }
    end
  end
end
