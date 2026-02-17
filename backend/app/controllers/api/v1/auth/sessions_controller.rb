# frozen_string_literal: true

module Api
  module V1
    module Auth
      class SessionsController < ApplicationController
        skip_before_action :set_current_user_from_jwt, only: [:create]

        # POST /api/v1/auth/login
        # ユーザー認証してNextAuth.js用のユーザー情報を返す
        def create
          user = User.find_by(email: login_params[:email]&.downcase)

          unless user
            return render json: { error: 'Invalid email or password' }, status: :unauthorized
          end

          unless user.confirmed?
            return render json: { error: 'email_not_confirmed' }, status: :forbidden
          end

          if user.encrypted_password.blank?
            return render json: { error: 'password_not_set' }, status: :forbidden
          end

          unless user.authenticate_password(login_params[:password])
            return render json: { error: 'Invalid email or password' }, status: :unauthorized
          end

          render json: {
            id: user.id.to_s,
            email: user.email,
            name: user.name,
            role: user.role
          }, status: :ok
        end

        # GET /api/v1/auth/me
        # 現在のユーザー情報を取得（JWT認証必須）
        def me
          authenticate_user!
          return if performed?

          render json: {
            id: current_user.id.to_s,
            email: current_user.email,
            name: current_user.name,
            role: current_user.role
          }, status: :ok
        end

        # DELETE /api/v1/auth/sign_out
        # サインアウト（JWT認証必須）
        def destroy
          authenticate_user!
          return if performed?

          render json: { message: 'サインアウトしました' }, status: :ok
        end

        private

        def login_params
          params.require(:user).permit(:email, :password)
        end
      end
    end
  end
end
