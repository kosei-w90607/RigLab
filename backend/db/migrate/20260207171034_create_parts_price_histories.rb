class CreatePartsPriceHistories < ActiveRecord::Migration[7.1]
  def change
    create_table :parts_price_histories do |t|
      t.bigint :part_id, null: false
      t.string :part_type, null: false
      t.integer :price, null: false
      t.string :source, null: false
      t.string :external_url
      t.string :product_name
      t.datetime :fetched_at, null: false
      t.timestamps
    end

    add_index :parts_price_histories, [:part_type, :part_id, :fetched_at]
    add_index :parts_price_histories, [:part_type, :part_id, :source, :fetched_at], name: "idx_price_histories_part_source_fetched"
  end
end
