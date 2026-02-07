# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::Admin::PriceFetch' do
  let(:admin_user) { create(:user, :admin) }
  let(:normal_user) { create(:user) }
  let(:admin_headers) { jwt_auth_headers(admin_user) }
  let(:user_headers) { jwt_auth_headers(normal_user) }
  let(:cpu) { create(:parts_cpu) }

  describe 'POST /api/v1/admin/price_fetch' do
    context '管理者として個別パーツ価格取得' do
      let(:service_result) do
        history = create(:parts_price_history, part_type: 'cpu', part_id: cpu.id, price: 48_000)
        PriceFetchService::Result.new(success?: true, price_history: history, error: nil)
      end

      before do
        allow(PriceFetchService).to receive(:new).and_return(
          instance_double(PriceFetchService, call: service_result)
        )
      end

      it '価格取得に成功する' do
        post '/api/v1/admin/price_fetch', params: { part_type: 'cpu', part_id: cpu.id }, headers: admin_headers

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json['data']['message']).to eq('価格を取得しました')
        expect(json['data']['price']).to eq(48_000)
      end
    end

    context '一般ユーザーの場合' do
      it '403を返す' do
        post '/api/v1/admin/price_fetch', params: { part_type: 'cpu', part_id: 1 }, headers: user_headers

        expect(response).to have_http_status(:forbidden)
      end
    end

    context '未認証の場合' do
      it '401を返す' do
        post '/api/v1/admin/price_fetch', params: { part_type: 'cpu', part_id: 1 }

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
