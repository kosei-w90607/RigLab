# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::Auth::PasswordResets' do
  describe 'POST /api/v1/auth/password/forgot' do
    let!(:user) { create(:user, email: 'test@example.com') }

    context 'when email exists' do
      it 'returns 200 with generic message' do
        post '/api/v1/auth/password/forgot', params: { email: 'test@example.com' }

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body['message']).to eq('メールアドレスが登録されている場合、リセット手順をお送りしました')
      end

      it 'sends a password reset email' do
        expect {
          post '/api/v1/auth/password/forgot', params: { email: 'test@example.com' }
        }.to change { ActionMailer::Base.deliveries.count }.by(1)
      end

      it 'sets reset_password_token and reset_password_sent_at on user' do
        post '/api/v1/auth/password/forgot', params: { email: 'test@example.com' }

        user.reload
        expect(user.reset_password_token).to be_present
        expect(user.reset_password_sent_at).to be_present
      end
    end

    context 'when email does not exist' do
      it 'returns 200 with same generic message (no information leakage)' do
        post '/api/v1/auth/password/forgot', params: { email: 'nonexistent@example.com' }

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body['message']).to eq('メールアドレスが登録されている場合、リセット手順をお送りしました')
      end

      it 'does not send an email' do
        expect {
          post '/api/v1/auth/password/forgot', params: { email: 'nonexistent@example.com' }
        }.not_to change { ActionMailer::Base.deliveries.count }
      end
    end

    context 'when email is blank' do
      it 'returns 200 with same generic message' do
        post '/api/v1/auth/password/forgot', params: { email: '' }

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body['message']).to eq('メールアドレスが登録されている場合、リセット手順をお送りしました')
      end
    end
  end

  describe 'POST /api/v1/auth/password/reset' do
    let!(:user) { create(:user, email: 'test@example.com', password: 'oldpass123') }
    let(:raw_token) { SecureRandom.urlsafe_base64(32) }
    let(:hashed_token) { Digest::SHA256.hexdigest(raw_token) }

    before do
      user.update!(
        reset_password_token: hashed_token,
        reset_password_sent_at: Time.current
      )
    end

    context 'when token is valid and passwords match' do
      it 'resets the password successfully' do
        post '/api/v1/auth/password/reset', params: {
          token: raw_token,
          password: 'newpass456',
          password_confirmation: 'newpass456'
        }

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body['message']).to eq('パスワードを再設定しました')
      end

      it 'updates the user password' do
        post '/api/v1/auth/password/reset', params: {
          token: raw_token,
          password: 'newpass456',
          password_confirmation: 'newpass456'
        }

        user.reload
        expect(user.authenticate_password('newpass456')).to be true
      end

      it 'invalidates the reset token' do
        post '/api/v1/auth/password/reset', params: {
          token: raw_token,
          password: 'newpass456',
          password_confirmation: 'newpass456'
        }

        user.reload
        expect(user.reset_password_token).to be_nil
        expect(user.reset_password_sent_at).to be_nil
      end
    end

    context 'when token is expired (over 2 hours)' do
      before do
        user.update!(reset_password_sent_at: 3.hours.ago)
      end

      it 'returns unprocessable_entity with error message' do
        post '/api/v1/auth/password/reset', params: {
          token: raw_token,
          password: 'newpass456',
          password_confirmation: 'newpass456'
        }

        expect(response).to have_http_status(:unprocessable_entity)
        expect(response.parsed_body['error']).to eq('トークンが無効または期限切れです')
      end
    end

    context 'when token is invalid' do
      it 'returns unprocessable_entity with error message' do
        post '/api/v1/auth/password/reset', params: {
          token: 'invalid_token',
          password: 'newpass456',
          password_confirmation: 'newpass456'
        }

        expect(response).to have_http_status(:unprocessable_entity)
        expect(response.parsed_body['error']).to eq('トークンが無効または期限切れです')
      end
    end

    context 'when passwords do not match' do
      it 'returns unprocessable_entity with error message' do
        post '/api/v1/auth/password/reset', params: {
          token: raw_token,
          password: 'newpass456',
          password_confirmation: 'different789'
        }

        expect(response).to have_http_status(:unprocessable_entity)
        expect(response.parsed_body['error']).to eq('パスワードが一致しません')
      end
    end

    context 'when new password is invalid (too short)' do
      it 'returns unprocessable_entity with validation errors' do
        post '/api/v1/auth/password/reset', params: {
          token: raw_token,
          password: 'short1',
          password_confirmation: 'short1'
        }

        expect(response).to have_http_status(:unprocessable_entity)
        expect(response.parsed_body['errors']).to be_present
      end
    end

    context 'when user is unconfirmed' do
      before { user.update!(confirmed_at: nil) }

      it 'パスワードリセット完了時に confirmed_at も設定される' do
        post '/api/v1/auth/password/reset', params: {
          token: raw_token,
          password: 'newpass456',
          password_confirmation: 'newpass456'
        }

        expect(response).to have_http_status(:ok)
        user.reload
        expect(user.confirmed_at).to be_present
      end
    end
  end
end
