# frozen_string_literal: true

class PartsGpu < ApplicationRecord
  has_many :pc_entrust_sets, foreign_key: :gpu_id, dependent: :nullify
  has_many :pc_custom_sets, foreign_key: :gpu_id, dependent: :nullify

  validates :name, presence: true
  validates :maker, presence: true
  validates :price, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :tdp, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :length_mm, numericality: { only_integer: true, greater_than: 0 }, allow_nil: true
end
