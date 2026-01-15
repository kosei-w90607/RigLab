class CreatePartsMotherboards < ActiveRecord::Migration[7.1]
  def change
    create_table :parts_motherboards do |t|
      t.string :name, null: false
      t.string :maker, null: false
      t.integer :price, null: false, default: 0
      t.string :socket, null: false
      t.string :memory_type, null: false
      t.string :form_factor, null: false
      t.json :specs

      t.timestamps
    end

    add_index :parts_motherboards, :socket
    add_index :parts_motherboards, :memory_type
    add_index :parts_motherboards, :form_factor
  end
end
