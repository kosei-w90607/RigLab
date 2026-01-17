# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::Parts' do
  describe 'GET /api/v1/parts' do
    context 'パーツが存在する場合' do
      before do
        create_list(:parts_cpu, 3)
        create_list(:parts_gpu, 2)
      end

      it '全パーツ一覧を返す' do
        get '/api/v1/parts'

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json['data'].length).to eq(5)
        expect(json['meta']).to include('total', 'page', 'per_page')
      end
    end

    context 'categoryでフィルタリングする場合' do
      before do
        create_list(:parts_cpu, 2)
        create_list(:parts_gpu, 3)
      end

      it 'CPUのみを返す' do
        get '/api/v1/parts', params: { category: 'cpu' }

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json['data'].length).to eq(2)
        expect(json['data'].all? { |p| p['category'] == 'cpu' }).to be true
      end

      it 'GPUのみを返す' do
        get '/api/v1/parts', params: { category: 'gpu' }

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json['data'].length).to eq(3)
        expect(json['data'].all? { |p| p['category'] == 'gpu' }).to be true
      end
    end

    context 'keywordで検索する場合' do
      before do
        create(:parts_cpu, name: 'Intel Core i7-14700K')
        create(:parts_cpu, name: 'AMD Ryzen 7 7800X3D')
        create(:parts_gpu, name: 'GeForce RTX 4070')
      end

      it '名前にキーワードを含むパーツを返す' do
        get '/api/v1/parts', params: { keyword: 'Intel' }

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json['data'].length).to eq(1)
        expect(json['data'].first['name']).to include('Intel')
      end
    end

    context '価格でフィルタリングする場合' do
      before do
        create(:parts_cpu, price: 30_000)
        create(:parts_cpu, price: 50_000)
        create(:parts_gpu, price: 80_000)
      end

      it '最小価格以上のパーツを返す' do
        get '/api/v1/parts', params: { min_price: 40_000 }

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json['data'].length).to eq(2)
        expect(json['data'].all? { |p| p['price'] >= 40_000 }).to be true
      end

      it '最大価格以下のパーツを返す' do
        get '/api/v1/parts', params: { max_price: 60_000 }

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json['data'].length).to eq(2)
        expect(json['data'].all? { |p| p['price'] <= 60_000 }).to be true
      end

      it '価格範囲内のパーツを返す' do
        get '/api/v1/parts', params: { min_price: 40_000, max_price: 60_000 }

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json['data'].length).to eq(1)
        expect(json['data'].first['price']).to eq(50_000)
      end
    end

    context 'ページネーション' do
      before do
        create_list(:parts_cpu, 25)
      end

      it 'デフォルトで20件を返す' do
        get '/api/v1/parts'

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json['data'].length).to eq(20)
        expect(json['meta']['total']).to eq(25)
        expect(json['meta']['page']).to eq(1)
        expect(json['meta']['per_page']).to eq(20)
      end

      it 'ページ指定で取得できる' do
        get '/api/v1/parts', params: { page: 2 }

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json['data'].length).to eq(5)
        expect(json['meta']['page']).to eq(2)
      end

      it 'per_pageで件数を指定できる' do
        get '/api/v1/parts', params: { per_page: 10 }

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json['data'].length).to eq(10)
        expect(json['meta']['per_page']).to eq(10)
      end
    end

    context 'パーツが存在しない場合' do
      it '空の配列を返す' do
        get '/api/v1/parts'

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json['data']).to eq([])
        expect(json['meta']['total']).to eq(0)
      end
    end
  end

  describe 'GET /api/v1/parts/:id' do
    context 'パーツが存在する場合' do
      let(:cpu) { create(:parts_cpu) }

      it 'パーツ詳細を返す' do
        get "/api/v1/parts/#{cpu.id}", params: { category: 'cpu' }

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json['data']['id']).to eq(cpu.id)
        expect(json['data']['category']).to eq('cpu')
        expect(json['data']['name']).to eq(cpu.name)
        expect(json['data']['maker']).to eq(cpu.maker)
        expect(json['data']['price']).to eq(cpu.price)
        expect(json['data']['specs']).to be_present
      end
    end

    context 'パーツが存在しない場合' do
      it '404を返す' do
        get '/api/v1/parts/99999', params: { category: 'cpu' }

        expect(response).to have_http_status(:not_found)
        json = response.parsed_body
        expect(json['error']).to be_present
      end
    end
  end
end
