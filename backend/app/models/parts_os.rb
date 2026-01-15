# frozen_string_literal: true

class PartsOs < ApplicationRecord
  has_many :pc_entrust_sets, foreign_key: :os_id, dependent: :nullify
  has_many :pc_custom_sets, foreign_key: :os_id, dependent: :nullify

  validates :name, presence: true
  validates :maker, presence: true
  validates :price, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
end
