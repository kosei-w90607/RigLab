# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::Rankings', type: :request do
  describe 'GET /api/v1/rankings' do
    context 'APIキーが設定されていない場合' do
      before do
        allow(ENV).to receive(:[]).and_call_original
        allow(ENV).to receive(:[]).with('RAKUTEN_APPLICATION_ID').and_return(nil)
        allow(ENV).to receive(:[]).with('RAKUTEN_ACCESS_KEY').and_return(nil)
      end

      it 'エラーを返す' do
        get '/api/v1/rankings', params: { category: 'cpu' }

        expect(response).to have_http_status(:unprocessable_entity)
        json = response.parsed_body
        expect(json['error']['code']).to eq('API_ERROR')
      end
    end

    context 'APIキーが設定されている場合' do
      let(:ranking_response) do
        {
          'Items' => [
            {
              'Item' => {
                'rank' => 1,
                'itemName' => 'Intel Core i7-14700K',
                'itemPrice' => 52000,
                'itemUrl' => 'https://item.rakuten.co.jp/example/i7-14700k',
                'mediumImageUrls' => [{ 'imageUrl' => 'https://example.com/image.jpg' }],
                'shopName' => 'PCショップ',
                'itemCode' => 'item-001',
                'reviewCount' => 120,
                'reviewAverage' => 4.5
              }
            }
          ]
        }.to_json
      end

      before do
        allow(ENV).to receive(:[]).and_call_original
        allow(ENV).to receive(:[]).with('RAKUTEN_APPLICATION_ID').and_return('test_app_id')
        allow(ENV).to receive(:[]).with('RAKUTEN_ACCESS_KEY').and_return('test_access_key')
        stub_request(:get, /openapi\.rakuten\.co\.jp\/ichibaranking\/api\/IchibaItem\/Ranking/)
          .to_return(status: 200, body: ranking_response, headers: { 'Content-Type' => 'application/json' })
      end

      it 'ランキングデータを返す' do
        get '/api/v1/rankings', params: { category: 'cpu' }

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        data = json['data']

        expect(data['items']).to be_an(Array)
        expect(data['items'].first['name']).to eq('Intel Core i7-14700K')
        expect(data['items'].first['rank']).to eq(1)
        expect(data['items'].first['price']).to eq(52000)
        expect(data['total_count']).to eq(1)
      end
    end
  end
end
