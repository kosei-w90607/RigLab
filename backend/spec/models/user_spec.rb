require "rails_helper"

RSpec.describe User do
  describe "#generate_confirmation_token!" do
    let(:user) { create(:user) }

    it "confirmation_token (SHA256ハッシュ) と confirmation_sent_at を設定する" do
      raw_token = user.generate_confirmation_token!

      expect(raw_token).to be_present
      user.reload
      expect(user.confirmation_token).to eq(Digest::SHA256.hexdigest(raw_token))
      expect(user.confirmation_sent_at).to be_within(1.second).of(Time.current)
    end
  end

  describe ".find_by_confirmation_token" do
    let(:user) { create(:user) }
    let(:raw_token) { user.generate_confirmation_token! }

    it "有効なトークンでユーザーを返す" do
      found = User.find_by_confirmation_token(raw_token)
      expect(found).to eq(user)
    end

    it "期限切れ（24時間超過）で nil を返す" do
      raw_token # generate token
      user.update!(confirmation_sent_at: 25.hours.ago)

      expect(User.find_by_confirmation_token(raw_token)).to be_nil
    end

    it "無効なトークンで nil を返す" do
      expect(User.find_by_confirmation_token("invalid_token")).to be_nil
    end

    it "空のトークンで nil を返す" do
      expect(User.find_by_confirmation_token("")).to be_nil
      expect(User.find_by_confirmation_token(nil)).to be_nil
    end
  end

  describe "#clear_confirmation_token!" do
    let(:user) { create(:user) }

    it "トークンを null 化する" do
      user.generate_confirmation_token!
      expect(user.confirmation_token).to be_present

      user.clear_confirmation_token!
      user.reload
      expect(user.confirmation_token).to be_nil
      expect(user.confirmation_sent_at).to be_nil
    end
  end
end
