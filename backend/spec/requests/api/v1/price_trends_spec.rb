# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::PriceTrends', type: :request do
  let(:cpu) { create(:parts_cpu, name: 'Intel Core i7-14700K', maker: 'Intel', price: 52_000) }
  let(:gpu) { create(:parts_gpu, name: 'RTX 4070', maker: 'NVIDIA', price: 80_000) }

  describe 'GET /api/v1/price_trends/categories' do
    context '価格履歴が存在する場合' do
      before do
        create(:parts_price_history, part_type: 'cpu', part_id: cpu.id, price: 55_000, fetched_at: 20.days.ago)
        create(:parts_price_history, part_type: 'cpu', part_id: cpu.id, price: 52_000, fetched_at: 1.day.ago)
      end

      it 'カテゴリサマリーを返す' do
        get '/api/v1/price_trends/categories'

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        data = json['data']

        expect(data).to be_an(Array)
        cpu_summary = data.find { |c| c['category'] == 'cpu' }
        expect(cpu_summary).to be_present
        expect(cpu_summary['label']).to eq('CPU')
        expect(cpu_summary['direction']).to be_present
        expect(cpu_summary).to have_key('avg_price')
        expect(cpu_summary).to have_key('daily_averages')
      end
    end

    context '価格履歴が存在しない場合' do
      it '空の配列を返す' do
        get '/api/v1/price_trends/categories'

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json['data']).to eq([])
      end
    end
  end

  describe 'GET /api/v1/price_trends/categories/:category' do
    before do
      create(:parts_price_history, part_type: 'cpu', part_id: cpu.id, price: 55_000, fetched_at: 20.days.ago)
      create(:parts_price_history, part_type: 'cpu', part_id: cpu.id, price: 52_000, fetched_at: 1.day.ago)
    end

    it 'カテゴリ内のパーツ一覧を返す' do
      get '/api/v1/price_trends/categories/cpu'

      expect(response).to have_http_status(:ok)
      json = response.parsed_body
      data = json['data']

      expect(data['category']).to eq('cpu')
      expect(data['label']).to eq('CPU')
      expect(data['parts']).to be_an(Array)
      expect(data['parts'].first['name']).to eq('Intel Core i7-14700K')
      expect(data['parts'].first).to have_key('current_price')
      expect(data['parts'].first).to have_key('price_diff_7d')
      expect(data['parts'].first).to have_key('change_percent_30d')
    end

    it 'ソートパラメータをサポートする' do
      get '/api/v1/price_trends/categories/cpu', params: { sort_by: 'price', sort_order: 'desc' }

      expect(response).to have_http_status(:ok)
    end

    it '不正なカテゴリで404を返す' do
      get '/api/v1/price_trends/categories/invalid'

      expect(response).to have_http_status(:not_found)
      json = response.parsed_body
      expect(json['error']['code']).to eq('NOT_FOUND')
    end
  end
end
