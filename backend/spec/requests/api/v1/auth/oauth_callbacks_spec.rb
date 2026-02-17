require "rails_helper"

RSpec.describe "Api::V1::Auth::OauthCallbacks" do
  let(:internal_secret) { "test-internal-secret" }
  let(:valid_headers) { { "X-Internal-Secret" => internal_secret } }

  let(:google_params) do
    {
      provider: "google",
      uid: "google_123456",
      email: "googleuser@example.com",
      name: "Google User",
      avatar_url: "https://lh3.googleusercontent.com/photo.jpg",
      email_verified: true
    }
  end

  before do
    allow(ENV).to receive(:fetch).and_call_original
    allow(ENV).to receive(:fetch).with("NEXTAUTH_SECRET", nil).and_return(internal_secret)
  end

  describe "POST /api/v1/auth/oauth" do
    context "authentication" do
      it "X-Internal-Secret ヘッダーなしで 401 を返す" do
        post "/api/v1/auth/oauth", params: google_params

        expect(response).to have_http_status(:unauthorized)
      end

      it "不正な Secret で 401 を返す" do
        post "/api/v1/auth/oauth", params: google_params,
             headers: { "X-Internal-Secret" => "wrong-secret" }

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "new user creation" do
      it "social_account + user が作成される" do
        expect {
          post "/api/v1/auth/oauth", params: google_params, headers: valid_headers
        }.to change(User, :count).by(1).and change(SocialAccount, :count).by(1)

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json["created"]).to be true
        expect(json["email"]).to eq("googleuser@example.com")
      end

      it "新規ユーザーは confirmed_at が設定される" do
        post "/api/v1/auth/oauth", params: google_params, headers: valid_headers

        user = User.find_by(email: "googleuser@example.com")
        expect(user.confirmed_at).to be_present
      end

      it "新規ユーザーは encrypted_password が空である" do
        post "/api/v1/auth/oauth", params: google_params, headers: valid_headers

        user = User.find_by(email: "googleuser@example.com")
        expect(user.encrypted_password).to be_blank
      end
    end

    context "existing user - email match + confirmed + email_verified=true" do
      let!(:existing_user) { create(:user, email: "googleuser@example.com", confirmed_at: Time.current) }

      it "social_account がリンクされる" do
        expect {
          post "/api/v1/auth/oauth", params: google_params, headers: valid_headers
        }.to change(SocialAccount, :count).by(1).and change(User, :count).by(0)

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json["id"]).to eq(existing_user.id.to_s)
        expect(json["created"]).to be false
      end
    end

    context "existing user - email match + unconfirmed + email_verified=true" do
      let!(:unconfirmed_user) { create(:user, email: "googleuser@example.com", confirmed_at: nil) }

      it "リンク + confirmed_at が設定される" do
        post "/api/v1/auth/oauth", params: google_params, headers: valid_headers

        expect(response).to have_http_status(:ok)
        unconfirmed_user.reload
        expect(unconfirmed_user.confirmed_at).to be_present
        expect(unconfirmed_user.social_accounts.count).to eq(1)
      end
    end

    context "existing user - email match + email_verified=false" do
      let!(:existing_user) { create(:user, email: "googleuser@example.com") }

      it "リンク拒否（422）される" do
        post "/api/v1/auth/oauth",
             params: google_params.merge(email_verified: false),
             headers: valid_headers

        expect(response).to have_http_status(:unprocessable_entity)
        expect(SocialAccount.count).to eq(0)
      end
    end

    context "existing social_account" do
      let!(:existing_user) { create(:user, email: "googleuser@example.com") }
      let!(:social_account) { create(:social_account, user: existing_user, provider: "google", uid: "google_123456") }

      it "そのユーザーが返される（冪等）" do
        expect {
          post "/api/v1/auth/oauth", params: google_params, headers: valid_headers
        }.to change(SocialAccount, :count).by(0).and change(User, :count).by(0)

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json["id"]).to eq(existing_user.id.to_s)
      end
    end
  end
end
