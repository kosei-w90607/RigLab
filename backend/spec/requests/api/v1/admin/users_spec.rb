# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::Admin::Users', type: :request do
  let(:admin_user) do
    User.create!(
      email: "admin_#{SecureRandom.hex(4)}@example.com",
      password: 'password123',
      name: 'Admin User',
      role: 'admin',
      confirmed_at: Time.current
    )
  end

  let(:regular_user) do
    User.create!(
      email: "user_#{SecureRandom.hex(4)}@example.com",
      password: 'password123',
      name: 'Regular User',
      role: 'user',
      confirmed_at: Time.current
    )
  end

  def generate_jwt_token(user)
    payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      exp: 1.hour.from_now.to_i
    }
    JWT.encode(payload, ENV['NEXTAUTH_SECRET'] || 'test-secret', 'HS256')
  end

  describe 'GET /api/v1/admin/users' do
    context '管理者として認証済みの場合' do
      it 'ユーザー一覧を返す' do
        admin_user
        regular_user
        admin_token = generate_jwt_token(admin_user)

        get '/api/v1/admin/users', headers: { 'Authorization' => "Bearer #{admin_token}" }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json['data']).to be_an(Array)
        expect(json['data'].length).to be >= 2
        expect(json['meta']).to include('total', 'page', 'per_page')
      end
    end

    context '一般ユーザーとして認証済みの場合' do
      it '403 Forbiddenを返す' do
        user_token = generate_jwt_token(regular_user)

        get '/api/v1/admin/users', headers: { 'Authorization' => "Bearer #{user_token}" }

        expect(response).to have_http_status(:forbidden)
      end
    end

    context '未認証の場合' do
      it '401 Unauthorizedを返す' do
        get '/api/v1/admin/users'

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'PATCH /api/v1/admin/users/:id' do
    context '管理者として認証済みの場合' do
      it 'ユーザーのロールを変更できる' do
        admin_token = generate_jwt_token(admin_user)

        patch "/api/v1/admin/users/#{regular_user.id}",
              params: { role: 'admin' },
              headers: { 'Authorization' => "Bearer #{admin_token}" }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json['data']['role']).to eq('admin')
        expect(regular_user.reload.role).to eq('admin')
      end

      it '無効なロールの場合はエラーを返す' do
        admin_token = generate_jwt_token(admin_user)

        patch "/api/v1/admin/users/#{regular_user.id}",
              params: { role: 'invalid_role' },
              headers: { 'Authorization' => "Bearer #{admin_token}" }

        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json['error']['code']).to eq('VALIDATION_ERROR')
      end
    end

    context '一般ユーザーとして認証済みの場合' do
      it '403 Forbiddenを返す' do
        user_token = generate_jwt_token(regular_user)
        another_user = User.create!(
          email: "another_#{SecureRandom.hex(4)}@example.com",
          password: 'password123',
          name: 'Another User',
          role: 'user',
          confirmed_at: Time.current
        )

        patch "/api/v1/admin/users/#{another_user.id}",
              params: { role: 'admin' },
              headers: { 'Authorization' => "Bearer #{user_token}" }

        expect(response).to have_http_status(:forbidden)
      end
    end
  end
end
