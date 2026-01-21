# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::Builds' do
  let(:user) { create(:user) }
  let(:other_user) { create(:user) }
  let(:auth_headers) { jwt_auth_headers(user) }

  describe 'GET /api/v1/builds' do
    context '認証済みユーザーの場合' do
      before do
        create_list(:pc_custom_set, 3, user: user)
        create_list(:pc_custom_set, 2, user: other_user)
      end

      it '自分の構成一覧のみを返す' do
        get '/api/v1/builds', headers: auth_headers

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json['data'].length).to eq(3)
        expect(json['meta']).to include('total', 'page', 'per_page')
      end
    end

    context '未認証の場合' do
      it '401を返す' do
        get '/api/v1/builds'

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'GET /api/v1/builds/:id' do
    let(:build) { create(:pc_custom_set, :with_parts, user: user) }

    context '認証済みで自分の構成の場合' do
      it '構成詳細を返す' do
        get "/api/v1/builds/#{build.id}", headers: auth_headers

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json['data']['id']).to eq(build.id)
        expect(json['data']['name']).to eq(build.name)
        expect(json['data']['share_token']).to be_present
        expect(json['data']['parts']).to be_present
      end
    end

    context '認証済みで他人の構成の場合' do
      let(:other_build) { create(:pc_custom_set, user: other_user) }

      it '404を返す' do
        get "/api/v1/builds/#{other_build.id}", headers: auth_headers

        expect(response).to have_http_status(:not_found)
      end
    end

    context '未認証の場合' do
      it '401を返す' do
        get "/api/v1/builds/#{build.id}"

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'GET /api/v1/builds/shared/:share_token' do
    let(:build) { create(:pc_custom_set, :with_parts, user: user) }

    context '有効なshare_tokenの場合' do
      it '認証なしで構成詳細を返す' do
        get "/api/v1/builds/shared/#{build.share_token}"

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json['data']['id']).to eq(build.id)
        expect(json['data']['name']).to eq(build.name)
      end
    end

    context '無効なshare_tokenの場合' do
      it '404を返す' do
        get '/api/v1/builds/shared/invalid_token'

        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe 'POST /api/v1/builds' do
    let(:cpu) { create(:parts_cpu) }
    let(:gpu) { create(:parts_gpu) }
    let(:memory) { create(:parts_memory) }
    let(:storage) { create(:parts_storage) }
    let(:os) { create(:parts_os) }

    let(:valid_params) do
      {
        name: '新しいPC構成',
        parts: {
          cpu_id: cpu.id,
          gpu_id: gpu.id,
          memory_id: memory.id,
          storage1_id: storage.id,
          os_id: os.id
        }
      }
    end

    context '認証済みで有効なパラメータの場合' do
      it '構成を作成して201を返す' do
        expect {
          post '/api/v1/builds', params: valid_params, headers: auth_headers
        }.to change(PcCustomSet, :count).by(1)

        expect(response).to have_http_status(:created)
        json = response.parsed_body
        expect(json['data']['name']).to eq('新しいPC構成')
        expect(json['data']['share_token']).to be_present
        expect(json['data']['total_price']).to be_present
      end
    end

    context '認証済みで名前がない場合' do
      it '422を返す' do
        post '/api/v1/builds', params: { name: '', parts: {} }, headers: auth_headers

        expect(response).to have_http_status(:unprocessable_entity)
      end
    end

    context '未認証の場合' do
      it '401を返す' do
        post '/api/v1/builds', params: valid_params

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'PATCH /api/v1/builds/:id' do
    let(:build) { create(:pc_custom_set, :with_parts, user: user) }
    let(:new_cpu) { create(:parts_cpu, name: 'New CPU') }

    context '認証済みで自分の構成の場合' do
      it '構成を更新して200を返す' do
        patch "/api/v1/builds/#{build.id}",
              params: { name: '更新した構成', parts: { cpu_id: new_cpu.id } },
              headers: auth_headers

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json['data']['name']).to eq('更新した構成')
      end
    end

    context '認証済みで他人の構成の場合' do
      let(:other_build) { create(:pc_custom_set, user: other_user) }

      it '404を返す' do
        patch "/api/v1/builds/#{other_build.id}",
              params: { name: '更新' },
              headers: auth_headers

        expect(response).to have_http_status(:not_found)
      end
    end

    context '未認証の場合' do
      it '401を返す' do
        patch "/api/v1/builds/#{build.id}", params: { name: '更新' }

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'DELETE /api/v1/builds/:id' do
    let!(:build) { create(:pc_custom_set, user: user) }

    context '認証済みで自分の構成の場合' do
      it '構成を削除して204を返す' do
        expect {
          delete "/api/v1/builds/#{build.id}", headers: auth_headers
        }.to change(PcCustomSet, :count).by(-1)

        expect(response).to have_http_status(:no_content)
      end
    end

    context '認証済みで他人の構成の場合' do
      let!(:other_build) { create(:pc_custom_set, user: other_user) }

      it '404を返す' do
        expect {
          delete "/api/v1/builds/#{other_build.id}", headers: auth_headers
        }.not_to change(PcCustomSet, :count)

        expect(response).to have_http_status(:not_found)
      end
    end

    context '未認証の場合' do
      it '401を返す' do
        delete "/api/v1/builds/#{build.id}"

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
