# frozen_string_literal: true

class PartsStorage < ApplicationRecord
  validates :name, presence: true
  validates :maker, presence: true
  validates :price, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0 }

  scope :ssd, -> { where("JSON_EXTRACT(specs, '$.storage_type') LIKE '%SSD%'") }
  scope :hdd, -> { where("JSON_EXTRACT(specs, '$.storage_type') = 'HDD'") }
end
