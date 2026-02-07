# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::BuyAdvice', type: :request do
  let(:cpu) { create(:parts_cpu, name: 'Intel Core i7-14700K', maker: 'Intel', price: 52000) }

  describe 'GET /api/v1/parts/:part_type/:part_id/buy_advice' do
    before do
      create(:parts_price_history, part_type: 'cpu', part_id: cpu.id, price: 55000, fetched_at: 20.days.ago)
      create(:parts_price_history, part_type: 'cpu', part_id: cpu.id, price: 52000, fetched_at: 1.day.ago)
    end

    it 'returns buy advice for a part' do
      get "/api/v1/parts/cpu/#{cpu.id}/buy_advice"

      expect(response).to have_http_status(:ok)
      data = JSON.parse(response.body)['data']
      expect(data['verdict']).to be_present
      expect(data['message']).to be_present
      expect(data['confidence']).to be_a(Numeric)
    end

    it 'returns 404 for invalid part type' do
      get '/api/v1/parts/invalid/1/buy_advice'

      expect(response).to have_http_status(:not_found)
    end

    it 'returns 404 for non-existent part' do
      get '/api/v1/parts/cpu/99999/buy_advice'

      expect(response).to have_http_status(:not_found)
    end
  end

  describe 'GET /api/v1/buy_advice/summary' do
    it 'returns summary data' do
      get '/api/v1/buy_advice/summary'

      expect(response).to have_http_status(:ok)
      data = JSON.parse(response.body)['data']
      expect(data).to have_key('best_deals')
      expect(data).to have_key('category_trends')
      expect(data).to have_key('biggest_drops')
      expect(data).to have_key('biggest_rises')
    end
  end
end
