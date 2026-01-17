# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::Admin::Parts' do
  let(:admin_user) { create(:user, :admin) }
  let(:normal_user) { create(:user) }
  let(:admin_headers) { admin_user.create_new_auth_token }
  let(:user_headers) { normal_user.create_new_auth_token }

  describe 'POST /api/v1/admin/parts' do
    let(:valid_cpu_params) do
      {
        category: 'cpu',
        name: 'Intel Core i9-14900K',
        maker: 'Intel',
        price: 85_000,
        socket: 'LGA1700',
        tdp: 125,
        memory_type: 'DDR5',
        specs: { cores: 24, threads: 32 }
      }
    end

    let(:valid_gpu_params) do
      {
        category: 'gpu',
        name: 'GeForce RTX 4090',
        maker: 'NVIDIA',
        price: 280_000,
        tdp: 450,
        length_mm: 336,
        specs: { vram: 24, chip: 'AD102' }
      }
    end

    context '管理者として認証済みの場合' do
      it 'CPUパーツを作成できる' do
        expect {
          post '/api/v1/admin/parts', params: valid_cpu_params, headers: admin_headers
        }.to change(PartsCpu, :count).by(1)

        expect(response).to have_http_status(:created)
        json = response.parsed_body
        expect(json['data']['name']).to eq('Intel Core i9-14900K')
        expect(json['data']['category']).to eq('cpu')
      end

      it 'GPUパーツを作成できる' do
        expect {
          post '/api/v1/admin/parts', params: valid_gpu_params, headers: admin_headers
        }.to change(PartsGpu, :count).by(1)

        expect(response).to have_http_status(:created)
        json = response.parsed_body
        expect(json['data']['name']).to eq('GeForce RTX 4090')
        expect(json['data']['category']).to eq('gpu')
      end

      it '無効なカテゴリの場合は422を返す' do
        post '/api/v1/admin/parts', params: { category: 'invalid', name: 'Test' }, headers: admin_headers

        expect(response).to have_http_status(:unprocessable_entity)
        json = response.parsed_body
        expect(json['error']['code']).to eq('INVALID_CATEGORY')
      end

      it 'バリデーションエラーの場合は422を返す' do
        post '/api/v1/admin/parts', params: { category: 'cpu', name: '' }, headers: admin_headers

        expect(response).to have_http_status(:unprocessable_entity)
      end
    end

    context '一般ユーザーとして認証済みの場合' do
      it '403を返す' do
        post '/api/v1/admin/parts', params: valid_cpu_params, headers: user_headers

        expect(response).to have_http_status(:forbidden)
      end
    end

    context '未認証の場合' do
      it '401を返す' do
        post '/api/v1/admin/parts', params: valid_cpu_params

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'PATCH /api/v1/admin/parts/:id' do
    let!(:cpu) { create(:parts_cpu, name: 'Old CPU') }
    let(:update_params) { { category: 'cpu', name: 'Updated CPU', price: 60_000 } }

    context '管理者として認証済みの場合' do
      it 'パーツを更新できる' do
        patch "/api/v1/admin/parts/#{cpu.id}", params: update_params, headers: admin_headers

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json['data']['name']).to eq('Updated CPU')
        expect(json['data']['price']).to eq(60_000)
      end

      it '存在しないパーツの場合は404を返す' do
        patch '/api/v1/admin/parts/99999', params: update_params, headers: admin_headers

        expect(response).to have_http_status(:not_found)
      end

      it 'カテゴリが一致しない場合は404を返す' do
        patch "/api/v1/admin/parts/#{cpu.id}", params: { category: 'gpu', name: 'Test' }, headers: admin_headers

        expect(response).to have_http_status(:not_found)
      end
    end

    context '一般ユーザーとして認証済みの場合' do
      it '403を返す' do
        patch "/api/v1/admin/parts/#{cpu.id}", params: update_params, headers: user_headers

        expect(response).to have_http_status(:forbidden)
      end
    end

    context '未認証の場合' do
      it '401を返す' do
        patch "/api/v1/admin/parts/#{cpu.id}", params: update_params

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'DELETE /api/v1/admin/parts/:id' do
    let!(:cpu) { create(:parts_cpu) }

    context '管理者として認証済みの場合' do
      it 'パーツを削除できる' do
        expect {
          delete "/api/v1/admin/parts/#{cpu.id}", params: { category: 'cpu' }, headers: admin_headers
        }.to change(PartsCpu, :count).by(-1)

        expect(response).to have_http_status(:no_content)
      end

      it '存在しないパーツの場合は404を返す' do
        delete '/api/v1/admin/parts/99999', params: { category: 'cpu' }, headers: admin_headers

        expect(response).to have_http_status(:not_found)
      end
    end

    context '一般ユーザーとして認証済みの場合' do
      it '403を返す' do
        delete "/api/v1/admin/parts/#{cpu.id}", params: { category: 'cpu' }, headers: user_headers

        expect(response).to have_http_status(:forbidden)
      end
    end

    context '未認証の場合' do
      it '401を返す' do
        delete "/api/v1/admin/parts/#{cpu.id}", params: { category: 'cpu' }

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
