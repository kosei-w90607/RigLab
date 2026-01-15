class CreatePartsStorages < ActiveRecord::Migration[7.1]
  def change
    create_table :parts_storages do |t|
      t.string :name, null: false
      t.string :maker, null: false
      t.integer :price, null: false, default: 0
      t.json :specs

      t.timestamps
    end

    add_index :parts_storages, :maker
    add_index :parts_storages, :price
  end
end
