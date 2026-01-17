class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable, :confirmable

  include DeviseTokenAuth::Concerns::User

  has_many :pc_custom_sets, dependent: :destroy

  ROLES = %w[user admin].freeze

  validates :role, presence: true, inclusion: { in: ROLES }

  def admin?
    role == 'admin'
  end
end