class PartsPriceHistory < ApplicationRecord
  VALID_PART_TYPES = %w[cpu gpu memory storage os motherboard psu case].freeze
  VALID_SOURCES = %w[rakuten amazon manual].freeze

  validates :part_id, presence: true
  validates :part_type, presence: true, inclusion: { in: VALID_PART_TYPES }
  validates :price, presence: true, numericality: { only_integer: true, greater_than: 0 }
  validates :source, presence: true, inclusion: { in: VALID_SOURCES }
  validates :fetched_at, presence: true

  scope :for_part, ->(type, id) { where(part_type: type, part_id: id) }
  scope :recent, ->(days = 30) { where("fetched_at >= ?", days.days.ago) }
  scope :by_source, ->(source) { where(source: source) }
  scope :latest_per_day, -> {
    where(id: select("MAX(id)").group("CAST(fetched_at AS DATE)"))
  }
end
