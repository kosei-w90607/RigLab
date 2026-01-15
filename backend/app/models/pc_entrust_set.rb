# frozen_string_literal: true

class PcEntrustSet < ApplicationRecord
  BUDGET_RANGES = %w[entry middle high].freeze
  USE_CASES = %w[gaming creative office].freeze

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
  validates :budget_range, presence: true, inclusion: { in: BUDGET_RANGES }
  validates :use_case, presence: true, inclusion: { in: USE_CASES }

  def total_price
    [cpu, gpu, memory, storage1, storage2, storage3, os, motherboard, psu, self.case]
      .compact
      .sum(&:price)
  end
end
