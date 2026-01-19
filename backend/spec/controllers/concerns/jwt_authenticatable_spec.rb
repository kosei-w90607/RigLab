# frozen_string_literal: true

require 'rails_helper'

RSpec.describe JwtAuthenticatable, type: :controller do
  # Create a test controller that includes the concern
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
    context 'with valid JWT' do
      it 'sets current_user from token' do
        token = generate_jwt(user)
        request.headers['Authorization'] = "Bearer #{token}"

        get :index

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json['user_id']).to eq(user.id)
        expect(json['signed_in']).to be true
      end
    end

    context 'without JWT' do
      it 'current_user is nil' do
        get :index

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json['user_id']).to be_nil
        expect(json['signed_in']).to be false
      end
    end

    context 'with invalid JWT' do
      it 'current_user is nil' do
        request.headers['Authorization'] = 'Bearer invalid-token'

        get :index

        json = JSON.parse(response.body)
        expect(json['user_id']).to be_nil
        expect(json['signed_in']).to be false
      end
    end

    context 'with expired JWT' do
      it 'current_user is nil' do
        token = generate_jwt(user, exp: 1.hour.ago)
        request.headers['Authorization'] = "Bearer #{token}"

        get :index

        json = JSON.parse(response.body)
        expect(json['user_id']).to be_nil
      end
    end

    context 'with wrong secret' do
      it 'current_user is nil' do
        token = generate_jwt(user, secret: 'wrong-secret')
        request.headers['Authorization'] = "Bearer #{token}"

        get :index

        json = JSON.parse(response.body)
        expect(json['user_id']).to be_nil
      end
    end
  end

  describe '#authenticate_user!' do
    context 'when authenticated' do
      it 'allows access' do
        token = generate_jwt(user)
        request.headers['Authorization'] = "Bearer #{token}"

        get :protected_action

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json['message']).to eq('Success')
      end
    end

    context 'when not authenticated' do
      it 'returns 401' do
        get :protected_action

        expect(response).to have_http_status(:unauthorized)
        json = JSON.parse(response.body)
        expect(json['error']).to eq('Unauthorized')
      end
    end
  end

  describe '#require_admin!' do
    context 'when admin user' do
      it 'allows access' do
        token = generate_jwt(admin_user)
        request.headers['Authorization'] = "Bearer #{token}"

        get :admin_action

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json['message']).to eq('Admin success')
      end
    end

    context 'when regular user' do
      it 'returns 403' do
        token = generate_jwt(user)
        request.headers['Authorization'] = "Bearer #{token}"

        get :admin_action

        expect(response).to have_http_status(:forbidden)
        json = JSON.parse(response.body)
        expect(json['error']).to eq('Forbidden')
      end
    end

    context 'when not authenticated' do
      it 'returns 401' do
        get :admin_action

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
