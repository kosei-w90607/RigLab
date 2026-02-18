class User < ApplicationRecord
  has_many :pc_custom_sets, dependent: :destroy
  has_many :social_accounts, dependent: :destroy

  ROLES = %w[user admin].freeze

  # バリデーション
  validates :email, presence: true, uniqueness: true,
                    format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :role, presence: true, inclusion: { in: ROLES }
  validates :password, length: { minimum: 8 },
                       format: { with: /\A(?=.*[a-zA-Z])(?=.*[0-9]).*\z/,
                                 message: 'は英字と数字を両方含めてください' },
                       if: -> { password.present? }

  # コールバック
  before_save :encrypt_password, if: -> { password.present? }
  before_create :set_default_provider_and_uid

  # パスワード仮想属性
  attr_accessor :password

  def admin?
    role == 'admin'
  end

  # メールアドレスとパスワードでユーザーを認証する
  # 認証成功時はユーザーを返し、失敗時はnilを返す
  def self.authenticate(email, password)
    user = find_by(email: email.downcase)
    return nil unless user
    return nil unless user.confirmed?

    user.authenticate_password(password) ? user : nil
  end

  # パスワードが一致するか検証する
  def authenticate_password(plain_password)
    return false if encrypted_password.blank?

    BCrypt::Password.new(encrypted_password) == plain_password
  rescue BCrypt::Errors::InvalidHash
    false
  end

  # ユーザーがメール確認済みか判定する
  def confirmed?
    confirmed_at.present?
  end

  # ユーザーのメールを確認済みにする
  def confirm!
    update!(confirmed_at: Time.current)
  end

  # パスワードリセットトークンを生成する
  # 生トークンを返す（メールで送信用）
  # DBにはSHA256ハッシュを保存（DB漏洩時にトークンが露出しない）
  def generate_reset_password_token!
    raw_token = SecureRandom.urlsafe_base64(32)
    update!(
      reset_password_token: Digest::SHA256.hexdigest(raw_token),
      reset_password_sent_at: Time.current
    )
    raw_token
  end

  # 生リセットトークンでユーザーを検索する（有効期限2時間）
  def self.find_by_reset_token(raw_token)
    return nil if raw_token.blank?

    hashed = Digest::SHA256.hexdigest(raw_token)
    user = find_by(reset_password_token: hashed)
    return nil unless user
    return nil if user.reset_password_sent_at < 2.hours.ago

    user
  end

  # パスワードリセット成功後にトークンをクリアする
  def clear_reset_password_token!
    update!(reset_password_token: nil, reset_password_sent_at: nil)
  end

  # メール確認トークンを生成する
  # 生トークンを返す（メールで送信用）
  # DBにはSHA256ハッシュを保存（パスワードリセットと同じパターン）
  def generate_confirmation_token!
    raw_token = SecureRandom.urlsafe_base64(32)
    update!(
      confirmation_token: Digest::SHA256.hexdigest(raw_token),
      confirmation_sent_at: Time.current
    )
    raw_token
  end

  # 生確認トークンでユーザーを検索する（有効期限24時間）
  def self.find_by_confirmation_token(raw_token)
    return nil if raw_token.blank?

    hashed = Digest::SHA256.hexdigest(raw_token)
    user = find_by(confirmation_token: hashed)
    return nil unless user
    return nil if user.confirmation_sent_at < 24.hours.ago

    user
  end

  # メール確認成功後にトークンをクリアする
  def clear_confirmation_token!
    update!(confirmation_token: nil, confirmation_sent_at: nil)
  end

  private

  def encrypt_password
    self.encrypted_password = BCrypt::Password.create(password)
  end

  def set_default_provider_and_uid
    self.provider = 'email' if provider.blank?
    self.uid = email if uid.blank?
  end
end
