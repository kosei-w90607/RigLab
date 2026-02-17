require "rails_helper"

RSpec.describe "Api::V1::Auth::EmailConfirmations" do
  describe "POST /api/v1/auth/email/verify" do
    let(:user) { create(:user, confirmed_at: nil) }
    let(:raw_token) { user.generate_confirmation_token! }

    it "有効なトークンで confirmed_at が設定される" do
      post "/api/v1/auth/email/verify", params: { token: raw_token }

      expect(response).to have_http_status(:ok)
      expect(json_body["message"]).to include("確認")
      user.reload
      expect(user.confirmed_at).to be_present
      expect(user.confirmation_token).to be_nil
    end

    it "成功後に同じトークンで再度 verify すると 422 を返す" do
      post "/api/v1/auth/email/verify", params: { token: raw_token }
      expect(response).to have_http_status(:ok)

      post "/api/v1/auth/email/verify", params: { token: raw_token }
      expect(response).to have_http_status(:unprocessable_entity)
    end

    it "無効なトークンで 422 エラーを返す" do
      post "/api/v1/auth/email/verify", params: { token: "invalid_token" }

      expect(response).to have_http_status(:unprocessable_entity)
      expect(json_body["error"]).to be_present
    end

    it "期限切れトークンで 422 エラーを返す" do
      raw_token # generate token
      user.update!(confirmation_sent_at: 25.hours.ago)

      post "/api/v1/auth/email/verify", params: { token: raw_token }

      expect(response).to have_http_status(:unprocessable_entity)
    end

    it "既に確認済みの場合は 422 を返す" do
      user.update!(confirmed_at: Time.current)
      user.clear_confirmation_token!

      post "/api/v1/auth/email/verify", params: { token: "any_token" }

      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe "POST /api/v1/auth/email/resend" do
    it "未確認ユーザーに確認メールが送信され 200 を返す" do
      user = create(:user, confirmed_at: nil)

      expect {
        post "/api/v1/auth/email/resend", params: { email: user.email }
      }.to have_enqueued_mail(AuthMailer, :email_confirmation)

      expect(response).to have_http_status(:ok)
    end

    it "存在しないメールでも 200 を返す（情報漏洩防止）" do
      post "/api/v1/auth/email/resend", params: { email: "nonexistent@example.com" }

      expect(response).to have_http_status(:ok)
    end

    it "確認済みユーザーにはメール送信せず 200 を返す（情報漏洩防止）" do
      user = create(:user, confirmed_at: Time.current)

      expect {
        post "/api/v1/auth/email/resend", params: { email: user.email }
      }.not_to have_enqueued_mail(AuthMailer, :email_confirmation)

      expect(response).to have_http_status(:ok)
    end

    it "前回送信から5分以内は再送せず 200 + 適切なメッセージを返す" do
      user = create(:user, confirmed_at: nil, confirmation_sent_at: 2.minutes.ago)

      expect {
        post "/api/v1/auth/email/resend", params: { email: user.email }
      }.not_to have_enqueued_mail(AuthMailer, :email_confirmation)

      expect(response).to have_http_status(:ok)
      expect(json_body["message"]).to be_present
    end
  end

  private

  def json_body
    JSON.parse(response.body)
  end
end
