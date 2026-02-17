# frozen_string_literal: true

module Api
  module V1
    module Auth
      class PasswordResetsController < ApplicationController
        GENERIC_MESSAGE = 'メールアドレスが登録されている場合、リセット手順をお送りしました'

        def forgot
          user = User.find_by(email: params[:email]&.downcase)

          if user
            raw_token = user.generate_reset_password_token!
            AuthMailer.password_reset(user, raw_token).deliver_now
          end

          render json: { message: GENERIC_MESSAGE }
        end

        def reset
          if params[:password] != params[:password_confirmation]
            return render json: { error: 'パスワードが一致しません' }, status: :unprocessable_entity
          end

          user = User.find_by_reset_token(params[:token])

          unless user
            return render json: { error: 'トークンが無効または期限切れです' }, status: :unprocessable_entity
          end

          user.password = params[:password]
          if user.save
            user.clear_reset_password_token!
            user.confirm! unless user.confirmed?
            render json: { message: 'パスワードを再設定しました' }
          else
            render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
          end
        end
      end
    end
  end
end
