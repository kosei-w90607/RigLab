class CreatePartsGpus < ActiveRecord::Migration[7.1]
  def change
    create_table :parts_gpus do |t|
      t.string :name, null: false
      t.string :maker, null: false
      t.integer :price, null: false, default: 0
      t.integer :tdp, null: false, default: 0
      t.integer :length_mm
      t.json :specs

      t.timestamps
    end

    add_index :parts_gpus, :maker
    add_index :parts_gpus, :price
  end
end
