module Api
  module V1
    module Auth
      class OauthCallbacksController < ApplicationController
        skip_before_action :set_current_user_from_jwt

        before_action :authenticate_internal!

        def create
          unless params[:email_verified].to_s == "true"
            return render json: { error: "email_not_verified" }, status: :unprocessable_entity
          end

          # 既存のソーシャルアカウント → ユーザーを返す（冪等）
          existing_social = SocialAccount.find_by(provider: params[:provider], uid: params[:uid])
          if existing_social
            return render_user(existing_social.user, created: false)
          end

          # メールアドレスでユーザーを検索または作成
          user = User.find_by(email: params[:email]&.downcase)
          created = false

          ActiveRecord::Base.transaction do
            if user
              # 既存ユーザーにソーシャルアカウントを紐付け
              user.confirm! unless user.confirmed?
            else
              # 新規ユーザーを作成（パスワードなし）
              user = User.new(
                email: params[:email].downcase,
                name: params[:name],
                role: "user",
                provider: params[:provider],
                uid: params[:uid],
                confirmed_at: Time.current
              )
              user.save!
              created = true
            end

            user.social_accounts.create!(
              provider: params[:provider],
              uid: params[:uid],
              email: params[:email],
              name: params[:name],
              avatar_url: params[:avatar_url]
            )
          end

          render_user(user, created: created)
        rescue ActiveRecord::RecordNotUnique
          # 競合状態: 並行リクエストによりソーシャルアカウントが既に作成済み
          social = SocialAccount.find_by!(provider: params[:provider], uid: params[:uid])
          render_user(social.user, created: false)
        end

        private

        def authenticate_internal!
          secret = ENV.fetch("NEXTAUTH_SECRET", nil)
          provided = request.headers["X-Internal-Secret"]

          unless secret && provided && ActiveSupport::SecurityUtils.secure_compare(secret, provided)
            render json: { error: "Unauthorized" }, status: :unauthorized
          end
        end

        def render_user(user, created:)
          render json: {
            id: user.id.to_s,
            email: user.email,
            name: user.name,
            role: user.role,
            created: created
          }, status: :ok
        end
      end
    end
  end
end
