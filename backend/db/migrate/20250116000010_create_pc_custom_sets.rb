class CreatePcCustomSets < ActiveRecord::Migration[7.1]
  def change
    create_table :pc_custom_sets do |t|
      t.references :user, null: true, foreign_key: { on_delete: :cascade }
      t.string :name, null: false
      t.string :share_token, limit: 32
      t.references :cpu, foreign_key: { to_table: :parts_cpus, on_delete: :nullify }
      t.references :gpu, foreign_key: { to_table: :parts_gpus, on_delete: :nullify }
      t.references :memory, foreign_key: { to_table: :parts_memories, on_delete: :nullify }
      t.bigint :storage1_id, comment: 'プライマリストレージ（必須）'
      t.bigint :storage2_id, comment: 'セカンダリストレージ（任意）'
      t.bigint :storage3_id, comment: '追加ストレージ（任意）'
      t.references :os, foreign_key: { to_table: :parts_os, on_delete: :nullify }
      t.references :motherboard, foreign_key: { to_table: :parts_motherboards, on_delete: :nullify }
      t.references :psu, foreign_key: { to_table: :parts_psus, on_delete: :nullify }
      t.references :case, foreign_key: { to_table: :parts_cases, on_delete: :nullify }

      t.timestamps
    end

    add_index :pc_custom_sets, :share_token, unique: true
    add_foreign_key :pc_custom_sets, :parts_storages, column: :storage1_id, on_delete: :nullify
    add_foreign_key :pc_custom_sets, :parts_storages, column: :storage2_id, on_delete: :nullify
    add_foreign_key :pc_custom_sets, :parts_storages, column: :storage3_id, on_delete: :nullify
  end
end
