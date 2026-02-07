class AddExternalFieldsToParts < ActiveRecord::Migration[7.1]
  PART_TABLES = %w[parts_cpus parts_gpus parts_memories parts_storages parts_os parts_motherboards parts_psus parts_cases].freeze

  def change
    PART_TABLES.each do |table|
      add_column table, :rakuten_url, :string
      add_column table, :rakuten_image_url, :string
      add_column table, :amazon_url, :string
      add_column table, :last_price_checked_at, :datetime
    end
  end
end
