# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::Admin::RakutenSearch', type: :request do
  let(:admin_user) { create(:user, role: 'admin') }
  let(:regular_user) { create(:user, role: 'user') }

  let(:admin_token) { generate_jwt_token(admin_user) }
  let(:user_token) { generate_jwt_token(regular_user) }

  let(:search_result) do
    RakutenApiClient::Result.new(
      success?: true,
      items: [
        { name: 'Test CPU', price: 50000, url: 'https://example.com', image_url: 'https://example.com/img.jpg', shop_name: 'Shop', item_code: 'test-001', genre_id: '564500' }
      ],
      total_count: 1,
      error: nil
    )
  end

  describe 'GET /api/v1/admin/rakuten_search' do
    context '管理者ユーザー' do
      it '楽天APIの検索結果を返す' do
        allow(RakutenApiClient).to receive(:search).and_return(search_result)

        get '/api/v1/admin/rakuten_search',
            params: { keyword: 'Core i7', category: 'cpu' },
            headers: { 'Authorization' => "Bearer #{admin_token}" }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json['data']['items']).to be_an(Array)
        expect(json['data']['items'].length).to eq 1
        expect(json['data']['total_count']).to eq 1
      end

      it 'API検索エラー時はエラーレスポンスを返す' do
        error_result = RakutenApiClient::Result.new(
          success?: false, items: [], total_count: 0, error: 'APIエラー'
        )
        allow(RakutenApiClient).to receive(:search).and_return(error_result)

        get '/api/v1/admin/rakuten_search',
            params: { keyword: 'Core i7' },
            headers: { 'Authorization' => "Bearer #{admin_token}" }

        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json['error']['code']).to eq 'API_ERROR'
      end
    end

    context '一般ユーザー' do
      it '403を返す' do
        get '/api/v1/admin/rakuten_search',
            params: { keyword: 'Core i7' },
            headers: { 'Authorization' => "Bearer #{user_token}" }

        expect(response).to have_http_status(:forbidden)
      end
    end

    context '未認証' do
      it '401を返す' do
        get '/api/v1/admin/rakuten_search', params: { keyword: 'Core i7' }

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
