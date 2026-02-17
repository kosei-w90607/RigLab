# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::Auth::Sessions' do
  describe 'POST /api/v1/auth/login' do
    let!(:user) { create(:user, email: 'test@example.com', password: 'password123') }

    context 'when credentials are valid' do
      it 'returns user information' do
        post '/api/v1/auth/login', params: { user: { email: 'test@example.com', password: 'password123' } }

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json['email']).to eq('test@example.com')
        expect(json['id']).to eq(user.id.to_s)
      end
    end

    context 'when credentials are invalid' do
      it 'returns unauthorized' do
        post '/api/v1/auth/login', params: { user: { email: 'test@example.com', password: 'wrong' } }

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when user is unconfirmed' do
      let!(:unconfirmed_user) { create(:user, email: 'unconfirmed@example.com', password: 'password123', confirmed_at: nil) }

      it 'returns 403 with email_not_confirmed error' do
        post '/api/v1/auth/login', params: { user: { email: 'unconfirmed@example.com', password: 'password123' } }

        expect(response).to have_http_status(:forbidden)
        expect(response.parsed_body['error']).to eq('email_not_confirmed')
      end
    end

    context 'when user has no password (Google-only user)' do
      let!(:google_user) { create(:user, email: 'google@example.com', password: nil, encrypted_password: '', provider: 'google') }

      it 'returns 403 with password_not_set error' do
        post '/api/v1/auth/login', params: { user: { email: 'google@example.com', password: 'anything' } }

        expect(response).to have_http_status(:forbidden)
        expect(response.parsed_body['error']).to eq('password_not_set')
      end
    end

    context 'when email does not exist' do
      it 'returns unauthorized' do
        post '/api/v1/auth/login', params: { user: { email: 'nonexistent@example.com', password: 'password123' } }

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'GET /api/v1/auth/me' do
    let!(:user) { create(:user) }
    let(:auth_headers) { jwt_auth_headers(user) }

    context 'when authenticated' do
      it 'returns current user information' do
        get '/api/v1/auth/me', headers: auth_headers

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json['id']).to eq(user.id.to_s)
        expect(json['email']).to eq(user.email)
      end
    end

    context 'when not authenticated' do
      it 'returns unauthorized' do
        get '/api/v1/auth/me'

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'DELETE /api/v1/auth/sign_out' do
    let!(:user) { create(:user) }
    let(:auth_headers) { jwt_auth_headers(user) }

    context 'when authenticated' do
      it 'returns success message' do
        delete '/api/v1/auth/sign_out', headers: auth_headers

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json['message']).to eq('サインアウトしました')
      end
    end

    context 'when not authenticated' do
      it 'returns unauthorized' do
        delete '/api/v1/auth/sign_out'

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
