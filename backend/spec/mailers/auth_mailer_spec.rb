require "rails_helper"

RSpec.describe AuthMailer do
  describe "#password_reset" do
    let(:user) { create(:user, email: "test@example.com", name: "テストユーザー") }
    let(:token) { "raw_reset_token_abc123" }
    let(:mail) { described_class.password_reset(user, token) }

    it "送信先が正しい" do
      expect(mail.to).to eq(["test@example.com"])
    end

    it "件名が正しい" do
      expect(mail.subject).to eq("RigLab パスワードリセットのお知らせ")
    end

    it "fromがApplicationMailerのデフォルトを使用" do
      expect(mail.from).to eq(["noreply@riglab.example.com"])
    end

    it "本文にリセットリンクを含む" do
      expect(mail.text_part.body.decoded).to include("/reset-password?token=raw_reset_token_abc123")
      expect(mail.html_part.body.decoded).to include("/reset-password?token=raw_reset_token_abc123")
    end

    it "本文に有効期限（2時間）の表記を含む" do
      expect(mail.text_part.body.decoded).to include("2時間")
      expect(mail.html_part.body.decoded).to include("2時間")
    end

    it "本文に注意書きを含む" do
      expect(mail.text_part.body.decoded).to include("心当たりがない")
      expect(mail.html_part.body.decoded).to include("心当たりがない")
    end
  end

  describe "#email_confirmation" do
    let(:user) { create(:user, email: "confirm@example.com", name: "確認ユーザー") }
    let(:token) { "raw_confirm_token_abc123" }
    let(:mail) { described_class.email_confirmation(user, token) }

    it "送信先が正しい" do
      expect(mail.to).to eq(["confirm@example.com"])
    end

    it "件名が正しい" do
      expect(mail.subject).to eq("RigLab メールアドレスの確認")
    end

    it "本文に確認リンクを含む" do
      expect(mail.text_part.body.decoded).to include("/verify-email?token=raw_confirm_token_abc123")
      expect(mail.html_part.body.decoded).to include("/verify-email?token=raw_confirm_token_abc123")
    end

    it "有効期限（24時間）が記載されている" do
      expect(mail.text_part.body.decoded).to include("24時間")
      expect(mail.html_part.body.decoded).to include("24時間")
    end
  end
end
