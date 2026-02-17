require "rails_helper"

RSpec.describe "Api::V1::Auth::Registrations" do
  describe "POST /api/v1/auth/register" do
    let(:valid_params) do
      { user: { email: "new@example.com", password: "password123", name: "New User" } }
    end

    it "登録成功時に confirmed_at が null である" do
      post "/api/v1/auth/register", params: valid_params

      expect(response).to have_http_status(:created)
      user = User.find_by(email: "new@example.com")
      expect(user.confirmed_at).to be_nil
    end

    it "登録成功時に確認メールが送信される" do
      expect {
        post "/api/v1/auth/register", params: valid_params
      }.to have_enqueued_mail(AuthMailer, :email_confirmation)

      expect(response).to have_http_status(:created)
    end

    it "レスポンスに確認メール送信メッセージが含まれる" do
      post "/api/v1/auth/register", params: valid_params

      json = JSON.parse(response.body)
      expect(json["message"]).to include("確認メール")
    end
  end
end
