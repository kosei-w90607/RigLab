class CreatePartsMemories < ActiveRecord::Migration[7.1]
  def change
    create_table :parts_memories do |t|
      t.string :name, null: false
      t.string :maker, null: false
      t.integer :price, null: false, default: 0
      t.string :memory_type, null: false
      t.json :specs

      t.timestamps
    end

    add_index :parts_memories, :maker
    add_index :parts_memories, :price
    add_index :parts_memories, :memory_type
  end
end
