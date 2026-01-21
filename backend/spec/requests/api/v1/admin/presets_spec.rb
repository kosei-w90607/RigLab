# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::Admin::Presets' do
  let(:admin_user) { create(:user, :admin) }
  let(:normal_user) { create(:user) }
  let(:admin_headers) { jwt_auth_headers(admin_user) }
  let(:user_headers) { jwt_auth_headers(normal_user) }

  let(:cpu) { create(:parts_cpu) }
  let(:gpu) { create(:parts_gpu) }
  let(:memory) { create(:parts_memory) }
  let(:storage) { create(:parts_storage) }
  let(:os) { create(:parts_os) }

  describe 'POST /api/v1/admin/presets' do
    let(:valid_params) do
      {
        name: 'ゲーミングPC エントリー',
        description: '初めてのゲーミングPCにおすすめ',
        budget_range: 'entry',
        use_case: 'gaming',
        parts: {
          cpu_id: cpu.id,
          gpu_id: gpu.id,
          memory_id: memory.id,
          storage1_id: storage.id,
          os_id: os.id
        }
      }
    end

    context '管理者として認証済みの場合' do
      it 'プリセットを作成できる' do
        expect {
          post '/api/v1/admin/presets', params: valid_params, headers: admin_headers
        }.to change(PcEntrustSet, :count).by(1)

        expect(response).to have_http_status(:created)
        json = response.parsed_body
        expect(json['data']['name']).to eq('ゲーミングPC エントリー')
        expect(json['data']['budget_range']).to eq('entry')
        expect(json['data']['use_case']).to eq('gaming')
      end

      it '無効なbudget_rangeの場合は422を返す' do
        post '/api/v1/admin/presets',
             params: valid_params.merge(budget_range: 'invalid'),
             headers: admin_headers

        expect(response).to have_http_status(:unprocessable_entity)
      end

      it '無効なuse_caseの場合は422を返す' do
        post '/api/v1/admin/presets',
             params: valid_params.merge(use_case: 'invalid'),
             headers: admin_headers

        expect(response).to have_http_status(:unprocessable_entity)
      end

      it '名前がない場合は422を返す' do
        post '/api/v1/admin/presets',
             params: valid_params.merge(name: ''),
             headers: admin_headers

        expect(response).to have_http_status(:unprocessable_entity)
      end
    end

    context '一般ユーザーとして認証済みの場合' do
      it '403を返す' do
        post '/api/v1/admin/presets', params: valid_params, headers: user_headers

        expect(response).to have_http_status(:forbidden)
      end
    end

    context '未認証の場合' do
      it '401を返す' do
        post '/api/v1/admin/presets', params: valid_params

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'PATCH /api/v1/admin/presets/:id' do
    let!(:preset) { create(:pc_entrust_set, name: 'Old Preset') }
    let(:update_params) { { name: 'Updated Preset', description: '更新された説明' } }

    context '管理者として認証済みの場合' do
      it 'プリセットを更新できる' do
        patch "/api/v1/admin/presets/#{preset.id}", params: update_params, headers: admin_headers

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json['data']['name']).to eq('Updated Preset')
        expect(json['data']['description']).to eq('更新された説明')
      end

      it '存在しないプリセットの場合は404を返す' do
        patch '/api/v1/admin/presets/99999', params: update_params, headers: admin_headers

        expect(response).to have_http_status(:not_found)
      end
    end

    context '一般ユーザーとして認証済みの場合' do
      it '403を返す' do
        patch "/api/v1/admin/presets/#{preset.id}", params: update_params, headers: user_headers

        expect(response).to have_http_status(:forbidden)
      end
    end

    context '未認証の場合' do
      it '401を返す' do
        patch "/api/v1/admin/presets/#{preset.id}", params: update_params

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'DELETE /api/v1/admin/presets/:id' do
    let!(:preset) { create(:pc_entrust_set) }

    context '管理者として認証済みの場合' do
      it 'プリセットを削除できる' do
        expect {
          delete "/api/v1/admin/presets/#{preset.id}", headers: admin_headers
        }.to change(PcEntrustSet, :count).by(-1)

        expect(response).to have_http_status(:no_content)
      end

      it '存在しないプリセットの場合は404を返す' do
        delete '/api/v1/admin/presets/99999', headers: admin_headers

        expect(response).to have_http_status(:not_found)
      end
    end

    context '一般ユーザーとして認証済みの場合' do
      it '403を返す' do
        delete "/api/v1/admin/presets/#{preset.id}", headers: user_headers

        expect(response).to have_http_status(:forbidden)
      end
    end

    context '未認証の場合' do
      it '401を返す' do
        delete "/api/v1/admin/presets/#{preset.id}"

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
