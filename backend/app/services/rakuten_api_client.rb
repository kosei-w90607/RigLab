# frozen_string_literal: true

class RakutenApiClient
  BASE_URL = 'https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20220601'
  RANKING_URL = 'https://openapi.rakuten.co.jp/ichibaranking/api/IchibaItem/Ranking/20220601'
  ALLOWED_WEBSITE = 'https://rig-lab.vercel.app'

  Result = Struct.new(:success?, :items, :total_count, :error, keyword_init: true)

  class << self
    def search(keyword:, category: nil, page: 1, hits: 20)
      return Result.new(success?: false, items: [], total_count: 0, error: 'RAKUTEN_APPLICATION_ID が設定されていません') unless application_id.present?
      return Result.new(success?: false, items: [], total_count: 0, error: 'RAKUTEN_ACCESS_KEY が設定されていません') unless access_key.present?
      return Result.new(success?: false, items: [], total_count: 0, error: 'キーワードを入力してください') if keyword.blank?

      enforce_rate_limit

      params = build_params(keyword: keyword, page: page, hits: hits)
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

    private

    def application_id
      ENV['RAKUTEN_APPLICATION_ID']
    end

    def access_key
      ENV['RAKUTEN_ACCESS_KEY']
    end

    def get_with_headers(url)
      uri = URI(url)
      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = true
      req = Net::HTTP::Get.new(uri)
      req['Referer'] = "#{ALLOWED_WEBSITE}/"
      req['Origin'] = ALLOWED_WEBSITE
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

    def build_params(keyword:, page:, hits:)
      {
        applicationId: application_id,
        accessKey: access_key,
        keyword: keyword,
        page: page,
        hits: hits,
        format: 'json'
      }
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
