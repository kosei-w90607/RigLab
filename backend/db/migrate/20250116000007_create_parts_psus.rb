class CreatePartsPsus < ActiveRecord::Migration[7.1]
  def change
    create_table :parts_psus do |t|
      t.string :name, null: false
      t.string :maker, null: false
      t.integer :price, null: false, default: 0
      t.integer :wattage, null: false, default: 0
      t.string :form_factor, null: false, default: 'ATX'
      t.json :specs

      t.timestamps
    end

    add_index :parts_psus, :wattage
    add_index :parts_psus, :form_factor
  end
end
