class CreatePartsCpus < ActiveRecord::Migration[7.1]
  def change
    create_table :parts_cpus do |t|
      t.string :name, null: false
      t.string :maker, null: false
      t.integer :price, null: false, default: 0
      t.string :socket, null: false
      t.integer :tdp, null: false, default: 0
      t.string :memory_type, null: false
      t.json :specs

      t.timestamps
    end

    add_index :parts_cpus, :maker
    add_index :parts_cpus, :price
    add_index :parts_cpus, :socket
  end
end
