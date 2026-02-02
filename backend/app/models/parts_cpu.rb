# frozen_string_literal: true

class PartsCpu < ApplicationRecord
  has_many :pc_entrust_sets, foreign_key: :cpu_id, dependent: :nullify
  has_many :pc_custom_sets, foreign_key: :cpu_id, dependent: :nullify

  validates :name, presence: true
  validates :maker, presence: true
  validates :price, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :socket, presence: true
  validates :tdp, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  # memory_type は単一値（DDR4, DDR5）またはカンマ区切り複数値（DDR4,DDR5）を許可
  validates :memory_type, presence: true
  validate :valid_memory_types

  # memory_typeが指定されたタイプをサポートしているか確認
  def supports_memory_type?(type)
    memory_type.split(',').include?(type)
  end

  private

  def valid_memory_types
    return if memory_type.blank?

    types = memory_type.split(',')
    invalid_types = types - %w[DDR4 DDR5]
    if invalid_types.any?
      errors.add(:memory_type, "には DDR4, DDR5 のみ指定できます (無効: #{invalid_types.join(', ')})")
    end
  end
end
