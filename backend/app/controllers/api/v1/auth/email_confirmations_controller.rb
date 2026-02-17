module Api
  module V1
    module Auth
      class EmailConfirmationsController < ApplicationController
        def verify
          user = User.find_by_confirmation_token(params[:token])

          unless user
            return render json: { error: "トークンが無効または期限切れです" }, status: :unprocessable_entity
          end

          if user.confirmed?
            return render json: { error: "既に確認済みです" }, status: :unprocessable_entity
          end

          user.confirm!
          user.clear_confirmation_token!
          render json: { message: "メールアドレスを確認しました" }, status: :ok
        end

        def resend
          user = User.find_by(email: params[:email]&.downcase)

          if user && !user.confirmed?
            if user.confirmation_sent_at && user.confirmation_sent_at > 5.minutes.ago
              return render json: { message: "確認メールは最近送信済みです。しばらくお待ちください" }, status: :ok
            end

            raw_token = user.generate_confirmation_token!
            AuthMailer.email_confirmation(user, raw_token).deliver_later
          end

          render json: { message: "未確認の場合、確認メールを送信しました" }, status: :ok
        end
      end
    end
  end
end
