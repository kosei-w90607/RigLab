require "rails_helper"

RSpec.describe SocialAccount do
  describe "validations" do
    let(:user) { create(:user) }

    it "provider, uid が必須" do
      account = SocialAccount.new(user: user)
      expect(account).not_to be_valid
      expect(account.errors[:provider]).to be_present
      expect(account.errors[:uid]).to be_present
    end

    it "有効な属性で作成できる" do
      account = SocialAccount.new(user: user, provider: "google", uid: "12345")
      expect(account).to be_valid
    end

    it "provider + uid のユニーク制約" do
      create(:social_account, provider: "google", uid: "12345")
      duplicate = build(:social_account, provider: "google", uid: "12345")
      expect(duplicate).not_to be_valid
    end

    it "user_id + provider のユニーク制約" do
      create(:social_account, user: user, provider: "google", uid: "111")
      duplicate = build(:social_account, user: user, provider: "google", uid: "222")
      expect(duplicate).not_to be_valid
    end
  end

  describe "associations" do
    it "belongs_to :user" do
      association = described_class.reflect_on_association(:user)
      expect(association.macro).to eq(:belongs_to)
    end
  end
end
