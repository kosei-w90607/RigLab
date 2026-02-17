# frozen_string_literal: true

module Api
  module V1
    module Auth
      class RegistrationsController < ApplicationController
        skip_before_action :set_current_user_from_jwt

        # POST /api/v1/auth/register
        # 新規ユーザーアカウント作成
        def create
          user = User.new(registration_params)
          user.role = 'user'

          if user.save
            raw_token = user.generate_confirmation_token!
            AuthMailer.email_confirmation(user, raw_token).deliver_later
            render json: {
              id: user.id.to_s,
              email: user.email,
              name: user.name,
              role: user.role,
              message: '確認メールを送信しました'
            }, status: :created
          else
            render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
          end
        end

        private

        def registration_params
          params.require(:user).permit(:email, :password, :name)
        end
      end
    end
  end
end
