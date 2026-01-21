class User < ApplicationRecord
  has_many :pc_custom_sets, dependent: :destroy

  ROLES = %w[user admin].freeze

  # Validations
  validates :email, presence: true, uniqueness: true,
                    format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :role, presence: true, inclusion: { in: ROLES }
  validates :password, length: { minimum: 8 },
                       format: { with: /\A(?=.*[a-zA-Z])(?=.*[0-9])/,
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

  private

  def encrypt_password
    self.encrypted_password = BCrypt::Password.create(password)
  end

  def set_default_provider_and_uid
    self.provider = 'email' if provider.blank?
    self.uid = email if uid.blank?
  end
end