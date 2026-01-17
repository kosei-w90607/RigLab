# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::Presets' do
  describe 'GET /api/v1/presets' do
    context 'プリセットが存在する場合' do
      before do
        create_list(:pc_entrust_set, 3)
      end

      it 'プリセット一覧を返す' do
        get '/api/v1/presets'

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json['data'].length).to eq(3)
        expect(json['meta']).to include('total', 'page', 'per_page')
      end
    end

    context 'budgetでフィルタリングする場合' do
      before do
        create_list(:pc_entrust_set, 2, :entry)
        create_list(:pc_entrust_set, 3)
      end

      it 'entry予算帯のみを返す' do
        get '/api/v1/presets', params: { budget: 'entry' }

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json['data'].length).to eq(2)
        expect(json['data'].all? { |p| p['budget_range'] == 'entry' }).to be true
      end
    end

    context 'use_caseでフィルタリングする場合' do
      before do
        create_list(:pc_entrust_set, 2, :creative)
        create_list(:pc_entrust_set, 1) # gaming
      end

      it 'creative用途のみを返す' do
        get '/api/v1/presets', params: { use_case: 'creative' }

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json['data'].length).to eq(2)
        expect(json['data'].all? { |p| p['use_case'] == 'creative' }).to be true
      end
    end

    context 'budgetとuse_caseを組み合わせてフィルタリングする場合' do
      before do
        create(:pc_entrust_set, budget_range: 'middle', use_case: 'gaming')
        create(:pc_entrust_set, budget_range: 'middle', use_case: 'creative')
        create(:pc_entrust_set, budget_range: 'high', use_case: 'gaming')
      end

      it 'middle予算帯のgaming用途のみを返す' do
        get '/api/v1/presets', params: { budget: 'middle', use_case: 'gaming' }

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json['data'].length).to eq(1)
        expect(json['data'].first['budget_range']).to eq('middle')
        expect(json['data'].first['use_case']).to eq('gaming')
      end
    end

    context 'プリセットが存在しない場合' do
      it '空の配列を返す' do
        get '/api/v1/presets'

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json['data']).to eq([])
        expect(json['meta']['total']).to eq(0)
      end
    end
  end

  describe 'GET /api/v1/presets/:id' do
    context 'プリセットが存在する場合' do
      let(:preset) { create(:pc_entrust_set) }

      it 'プリセット詳細を返す' do
        get "/api/v1/presets/#{preset.id}"

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json['data']['id']).to eq(preset.id)
        expect(json['data']['name']).to eq(preset.name)
        expect(json['data']['budget_range']).to eq(preset.budget_range)
        expect(json['data']['use_case']).to eq(preset.use_case)
        expect(json['data']['total_price']).to be_present
        expect(json['data']['parts']).to be_present
      end

      it 'パーツ情報を含む' do
        get "/api/v1/presets/#{preset.id}"

        json = response.parsed_body
        parts = json['data']['parts']
        expect(parts).to include(
          hash_including('category' => 'cpu'),
          hash_including('category' => 'gpu'),
          hash_including('category' => 'memory'),
          hash_including('category' => 'storage'),
          hash_including('category' => 'os')
        )
      end
    end

    context 'プリセットが存在しない場合' do
      it '404を返す' do
        get '/api/v1/presets/99999'

        expect(response).to have_http_status(:not_found)
        json = response.parsed_body
        expect(json['error']).to be_present
      end
    end
  end
end
