# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::PriceHistories' do
  let(:cpu) { create(:parts_cpu, name: 'Intel Core i7-14700K', maker: 'Intel', price: 52_000) }

  describe 'GET /api/v1/parts/:part_type/:part_id/price_histories' do
    context '価格履歴が存在する場合' do
      before do
        create(:parts_price_history, part_type: 'cpu', part_id: cpu.id, price: 55_000, fetched_at: 20.days.ago)
        create(:parts_price_history, part_type: 'cpu', part_id: cpu.id, price: 52_000, fetched_at: 10.days.ago)
        create(:parts_price_history, part_type: 'cpu', part_id: cpu.id, price: 48_000, fetched_at: 1.day.ago)
      end

      it '価格履歴とトレンドを返す' do
        get "/api/v1/parts/cpu/#{cpu.id}/price_histories"

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        data = json['data']

        expect(data['part_type']).to eq('cpu')
        expect(data['part_id']).to eq(cpu.id)
        expect(data['part_name']).to eq('Intel Core i7-14700K')
        expect(data['current_price']).to eq(48_000)
        expect(data['histories'].size).to eq(3)

        trend = data['trend']
        expect(trend['direction']).to eq('down')
        expect(trend['min_price']).to eq(48_000)
        expect(trend['max_price']).to eq(55_000)
      end
    end

    context '価格履歴が存在しない場合' do
      it 'パーツの価格をcurrent_priceとして返す' do
        get "/api/v1/parts/cpu/#{cpu.id}/price_histories"

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        data = json['data']

        expect(data['current_price']).to eq(52_000)
        expect(data['histories']).to be_empty
        expect(data['trend']).to be_nil
      end
    end

    context '不正なパーツタイプの場合' do
      it '404を返す' do
        get '/api/v1/parts/invalid/1/price_histories'

        expect(response).to have_http_status(:not_found)
        json = response.parsed_body
        expect(json['error']['code']).to eq('NOT_FOUND')
      end
    end

    context 'パーツが存在しない場合' do
      it '404を返す' do
        get '/api/v1/parts/cpu/999999/price_histories'

        expect(response).to have_http_status(:not_found)
        json = response.parsed_body
        expect(json['error']['code']).to eq('NOT_FOUND')
      end
    end
  end
end
