# frozen_string_literal: true

require 'rails_helper'

RSpec.describe JwtAuthenticatable, type: :controller do
  # concernをincludeしたテスト用コントローラーを作成
  controller(ApplicationController) do
    include JwtAuthenticatable

    skip_before_action :set_current_user_from_jwt, only: [:skip_auth_action]

    def index
      render json: { user_id: current_user&.id, signed_in: user_signed_in? }
    end

    def protected_action
      authenticate_user!
      return if performed?

      render json: { message: 'Success' }
    end

    def admin_action
      require_admin!
      return if performed?

      render json: { message: 'Admin success' }
    end

    def skip_auth_action
      render json: { message: 'No auth' }
    end
  end

  before do
    routes.draw do
      get 'index' => 'anonymous#index'
      get 'protected_action' => 'anonymous#protected_action'
      get 'admin_action' => 'anonymous#admin_action'
      get 'skip_auth_action' => 'anonymous#skip_auth_action'
    end
  end

  let(:user) { create(:user) }
  let(:admin_user) { create(:user, :admin) }
  let(:jwt_secret) { 'test-secret-key' }

  def generate_jwt(user, secret: jwt_secret, exp: 1.hour.from_now)
    payload = {
      sub: user.id.to_s,
      email: user.email,
      exp: exp.to_i
    }
    JWT.encode(payload, secret, 'HS256')
  end

  before do
    allow(ENV).to receive(:fetch).with('NEXTAUTH_SECRET', nil).and_return(jwt_secret)
  end

  describe '#current_user' do
    context '有効なJWTがある場合' do
      it 'トークンからcurrent_userを設定する' do
        token = generate_jwt(user)
        request.headers['Authorization'] = "Bearer #{token}"

        get :index

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json['user_id']).to eq(user.id)
        expect(json['signed_in']).to be true
      end
    end

    context 'JWTがない場合' do
      it 'current_userはnilになる' do
        get :index

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json['user_id']).to be_nil
        expect(json['signed_in']).to be false
      end
    end

    context '無効なJWTの場合' do
      it 'current_userはnilになる' do
        request.headers['Authorization'] = 'Bearer invalid-token'

        get :index

        json = JSON.parse(response.body)
        expect(json['user_id']).to be_nil
        expect(json['signed_in']).to be false
      end
    end

    context '期限切れのJWTの場合' do
      it 'current_userはnilになる' do
        token = generate_jwt(user, exp: 1.hour.ago)
        request.headers['Authorization'] = "Bearer #{token}"

        get :index

        json = JSON.parse(response.body)
        expect(json['user_id']).to be_nil
      end
    end

    context '間違ったシークレットで署名されたJWTの場合' do
      it 'current_userはnilになる' do
        token = generate_jwt(user, secret: 'wrong-secret')
        request.headers['Authorization'] = "Bearer #{token}"

        get :index

        json = JSON.parse(response.body)
        expect(json['user_id']).to be_nil
      end
    end
  end

  describe '#authenticate_user!' do
    context '認証済みの場合' do
      it 'アクセスを許可する' do
        token = generate_jwt(user)
        request.headers['Authorization'] = "Bearer #{token}"

        get :protected_action

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json['message']).to eq('Success')
      end
    end

    context '未認証の場合' do
      it '401を返す' do
        get :protected_action

        expect(response).to have_http_status(:unauthorized)
        json = JSON.parse(response.body)
        expect(json['error']).to eq('Unauthorized')
      end
    end
  end

  describe '#require_admin!' do
    context '管理者ユーザーの場合' do
      it 'アクセスを許可する' do
        token = generate_jwt(admin_user)
        request.headers['Authorization'] = "Bearer #{token}"

        get :admin_action

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json['message']).to eq('Admin success')
      end
    end

    context '一般ユーザーの場合' do
      it '403を返す' do
        token = generate_jwt(user)
        request.headers['Authorization'] = "Bearer #{token}"

        get :admin_action

        expect(response).to have_http_status(:forbidden)
        json = JSON.parse(response.body)
        expect(json['error']).to eq('Forbidden')
      end
    end

    context '未認証の場合' do
      it '401を返す' do
        get :admin_action

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
