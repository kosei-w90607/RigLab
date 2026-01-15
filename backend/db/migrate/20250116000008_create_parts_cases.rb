class CreatePartsCases < ActiveRecord::Migration[7.1]
  def change
    create_table :parts_cases do |t|
      t.string :name, null: false
      t.string :maker, null: false
      t.integer :price, null: false, default: 0
      t.string :form_factor, null: false
      t.integer :max_gpu_length_mm
      t.json :specs

      t.timestamps
    end

    add_index :parts_cases, :form_factor
    add_index :parts_cases, :maker
    add_index :parts_cases, :price
  end
end
