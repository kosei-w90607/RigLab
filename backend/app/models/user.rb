class User < ApplicationRecord
  has_many :pc_custom_sets, dependent: :destroy
  has_many :social_accounts, dependent: :destroy

  ROLES = %w[user admin].freeze

  # Validations
  validates :email, presence: true, uniqueness: true,
                    format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :role, presence: true, inclusion: { in: ROLES }
  validates :password, length: { minimum: 8 },
                       format: { with: /\A(?=.*[a-zA-Z])(?=.*[0-9]).*\z/,
                                 message: 'は英字と数字を両方含めてください' },
                       if: -> { password.present? }

  # Callbacks
  before_save :encrypt_password, if: -> { password.present? }
  before_create :set_default_provider_and_uid

  # Virtual attribute for password
  attr_accessor :password

  def admin?
    role == 'admin'
  end

  # Authenticate user with email and password
  # Returns user if authentication succeeds, nil otherwise
  def self.authenticate(email, password)
    user = find_by(email: email.downcase)
    return nil unless user
    return nil unless user.confirmed?

    user.authenticate_password(password) ? user : nil
  end

  # Check if password matches
  def authenticate_password(plain_password)
    return false if encrypted_password.blank?

    BCrypt::Password.new(encrypted_password) == plain_password
  rescue BCrypt::Errors::InvalidHash
    false
  end

  # Check if user is confirmed (email verified)
  def confirmed?
    confirmed_at.present?
  end

  # Confirm user
  def confirm!
    update!(confirmed_at: Time.current)
  end

  # Generate a password reset token
  # Returns the raw token (to be sent via email)
  # Stores SHA256 hash in DB (secure: DB leak doesn't expose token)
  def generate_reset_password_token!
    raw_token = SecureRandom.urlsafe_base64(32)
    update!(
      reset_password_token: Digest::SHA256.hexdigest(raw_token),
      reset_password_sent_at: Time.current
    )
    raw_token
  end

  # Find user by raw reset token (within 2-hour expiry)
  def self.find_by_reset_token(raw_token)
    return nil if raw_token.blank?

    hashed = Digest::SHA256.hexdigest(raw_token)
    user = find_by(reset_password_token: hashed)
    return nil unless user
    return nil if user.reset_password_sent_at < 2.hours.ago

    user
  end

  # Clear reset password token after successful reset
  def clear_reset_password_token!
    update!(reset_password_token: nil, reset_password_sent_at: nil)
  end

  # Generate an email confirmation token
  # Returns the raw token (to be sent via email)
  # Stores SHA256 hash in DB (same pattern as password reset)
  def generate_confirmation_token!
    raw_token = SecureRandom.urlsafe_base64(32)
    update!(
      confirmation_token: Digest::SHA256.hexdigest(raw_token),
      confirmation_sent_at: Time.current
    )
    raw_token
  end

  # Find user by raw confirmation token (within 24-hour expiry)
  def self.find_by_confirmation_token(raw_token)
    return nil if raw_token.blank?

    hashed = Digest::SHA256.hexdigest(raw_token)
    user = find_by(confirmation_token: hashed)
    return nil unless user
    return nil if user.confirmation_sent_at < 24.hours.ago

    user
  end

  # Clear confirmation token after successful verification
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