# frozen_string_literal: true

class PartsCpu < ApplicationRecord
  has_many :pc_entrust_sets, foreign_key: :cpu_id, dependent: :nullify
  has_many :pc_custom_sets, foreign_key: :cpu_id, dependent: :nullify

  validates :name, presence: true
  validates :maker, presence: true
  validates :price, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :socket, presence: true
  validates :tdp, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :memory_type, presence: true, inclusion: { in: %w[DDR4 DDR5] }
end
