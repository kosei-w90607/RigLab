# frozen_string_literal: true

class PcCustomSet < ApplicationRecord
  belongs_to :user, optional: true
  belongs_to :cpu, class_name: 'PartsCpu', optional: true
  belongs_to :gpu, class_name: 'PartsGpu', optional: true
  belongs_to :memory, class_name: 'PartsMemory', optional: true
  belongs_to :storage1, class_name: 'PartsStorage', optional: true
  belongs_to :storage2, class_name: 'PartsStorage', optional: true
  belongs_to :storage3, class_name: 'PartsStorage', optional: true
  belongs_to :os, class_name: 'PartsOs', optional: true
  belongs_to :motherboard, class_name: 'PartsMotherboard', optional: true
  belongs_to :psu, class_name: 'PartsPsu', optional: true
  belongs_to :case, class_name: 'PartsCase', optional: true

  validates :name, presence: true

  before_create :generate_share_token

  def total_price
    [cpu, gpu, memory, storage1, storage2, storage3, os, motherboard, psu, self.case]
      .compact
      .sum(&:price)
  end

  private

  def generate_share_token
    self.share_token ||= SecureRandom.hex(16)
  end
end
