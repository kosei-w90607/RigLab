# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::ShareTokens', type: :request do
  describe 'POST /api/v1/share_tokens' do
    let!(:cpu) { PartsCpu.create!(name: 'Test CPU', maker: 'Intel', price: 30000, socket: 'LGA1700', tdp: 65, memory_type: 'DDR5') }
    let!(:gpu) { PartsGpu.create!(name: 'Test GPU', maker: 'NVIDIA', price: 50000, length_mm: 300) }

    context '有効なパーツIDを指定した場合' do
      it '共有トークンを生成できる' do
        post '/api/v1/share_tokens', params: { cpu_id: cpu.id, gpu_id: gpu.id }

        expect(response).to have_http_status(:created)
        json = JSON.parse(response.body)
        expect(json['data']['token']).to be_present
        expect(json['data']['url']).to start_with('/share/')
      end
    end

    context '一部のパーツIDのみ指定した場合' do
      it '共有トークンを生成できる' do
        post '/api/v1/share_tokens', params: { cpu_id: cpu.id }

        expect(response).to have_http_status(:created)
        json = JSON.parse(response.body)
        expect(json['data']['token']).to be_present
      end
    end
  end

  describe 'GET /api/v1/share_tokens/:token' do
    let!(:cpu) { PartsCpu.create!(name: 'Test CPU', maker: 'Intel', price: 30000, socket: 'LGA1700', tdp: 65, memory_type: 'DDR5') }
    let!(:share_token) { ShareToken.create!(parts_data: { 'cpu_id' => cpu.id }) }

    context '有効なトークンの場合' do
      it '共有データを取得できる' do
        get "/api/v1/share_tokens/#{share_token.token}"

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json['data']['token']).to eq(share_token.token)
        expect(json['data']['total_price']).to eq(30000)
        expect(json['data']['parts'].length).to eq(1)
        expect(json['data']['parts'][0]['category']).to eq('cpu')
        expect(json['data']['parts'][0]['part']['name']).to eq('Test CPU')
      end
    end

    context '無効なトークンの場合' do
      it '404を返す' do
        get '/api/v1/share_tokens/invalid_token'

        expect(response).to have_http_status(:not_found)
        json = JSON.parse(response.body)
        expect(json['error']['code']).to eq('NOT_FOUND')
      end
    end
  end
end
