# frozen_string_literal: true

class PartsPsu < ApplicationRecord
  has_many :pc_entrust_sets, foreign_key: :psu_id, dependent: :nullify
  has_many :pc_custom_sets, foreign_key: :psu_id, dependent: :nullify

  validates :name, presence: true
  validates :maker, presence: true
  validates :price, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :wattage, presence: true, numericality: { only_integer: true, greater_than: 0 }
  validates :form_factor, presence: true, inclusion: { in: %w[ATX SFX] }
end
