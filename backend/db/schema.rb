# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.1].define(version: 2026_02_17_215220) do
  create_table "parts_cases", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "name", null: false
    t.string "maker", null: false
    t.integer "price", default: 0, null: false
    t.string "form_factor", null: false
    t.integer "max_gpu_length_mm"
    t.json "specs"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "rakuten_url"
    t.string "rakuten_image_url"
    t.string "amazon_url"
    t.datetime "last_price_checked_at"
    t.index ["form_factor"], name: "index_parts_cases_on_form_factor"
    t.index ["maker"], name: "index_parts_cases_on_maker"
    t.index ["price"], name: "index_parts_cases_on_price"
  end

  create_table "parts_cpus", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "name", null: false
    t.string "maker", null: false
    t.integer "price", default: 0, null: false
    t.string "socket", null: false
    t.integer "tdp", default: 0, null: false
    t.string "memory_type", null: false
    t.json "specs"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "rakuten_url"
    t.string "rakuten_image_url"
    t.string "amazon_url"
    t.datetime "last_price_checked_at"
    t.index ["maker"], name: "index_parts_cpus_on_maker"
    t.index ["price"], name: "index_parts_cpus_on_price"
    t.index ["socket"], name: "index_parts_cpus_on_socket"
  end

  create_table "parts_gpus", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "name", null: false
    t.string "maker", null: false
    t.integer "price", default: 0, null: false
    t.integer "tdp", default: 0, null: false
    t.integer "length_mm"
    t.json "specs"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "rakuten_url"
    t.string "rakuten_image_url"
    t.string "amazon_url"
    t.datetime "last_price_checked_at"
    t.index ["maker"], name: "index_parts_gpus_on_maker"
    t.index ["price"], name: "index_parts_gpus_on_price"
  end

  create_table "parts_memories", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "name", null: false
    t.string "maker", null: false
    t.integer "price", default: 0, null: false
    t.string "memory_type", null: false
    t.json "specs"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "rakuten_url"
    t.string "rakuten_image_url"
    t.string "amazon_url"
    t.datetime "last_price_checked_at"
    t.index ["maker"], name: "index_parts_memories_on_maker"
    t.index ["memory_type"], name: "index_parts_memories_on_memory_type"
    t.index ["price"], name: "index_parts_memories_on_price"
  end

  create_table "parts_motherboards", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "name", null: false
    t.string "maker", null: false
    t.integer "price", default: 0, null: false
    t.string "socket", null: false
    t.string "memory_type", null: false
    t.string "form_factor", null: false
    t.json "specs"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "rakuten_url"
    t.string "rakuten_image_url"
    t.string "amazon_url"
    t.datetime "last_price_checked_at"
    t.index ["form_factor"], name: "index_parts_motherboards_on_form_factor"
    t.index ["memory_type"], name: "index_parts_motherboards_on_memory_type"
    t.index ["socket"], name: "index_parts_motherboards_on_socket"
  end

  create_table "parts_os", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "name", null: false
    t.string "maker", null: false
    t.integer "price", default: 0, null: false
    t.json "specs"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "rakuten_url"
    t.string "rakuten_image_url"
    t.string "amazon_url"
    t.datetime "last_price_checked_at"
    t.index ["maker"], name: "index_parts_os_on_maker"
    t.index ["price"], name: "index_parts_os_on_price"
  end

  create_table "parts_price_histories", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "part_id", null: false
    t.string "part_type", null: false
    t.integer "price", null: false
    t.string "source", null: false
    t.string "external_url"
    t.string "product_name"
    t.datetime "fetched_at", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["part_type", "part_id", "fetched_at"], name: "idx_on_part_type_part_id_fetched_at_3d1ecb5a9d"
    t.index ["part_type", "part_id", "source", "fetched_at"], name: "idx_price_histories_part_source_fetched"
  end

  create_table "parts_psus", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "name", null: false
    t.string "maker", null: false
    t.integer "price", default: 0, null: false
    t.integer "wattage", default: 0, null: false
    t.string "form_factor", default: "ATX", null: false
    t.json "specs"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "rakuten_url"
    t.string "rakuten_image_url"
    t.string "amazon_url"
    t.datetime "last_price_checked_at"
    t.index ["form_factor"], name: "index_parts_psus_on_form_factor"
    t.index ["wattage"], name: "index_parts_psus_on_wattage"
  end

  create_table "parts_storages", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "name", null: false
    t.string "maker", null: false
    t.integer "price", default: 0, null: false
    t.json "specs"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "rakuten_url"
    t.string "rakuten_image_url"
    t.string "amazon_url"
    t.datetime "last_price_checked_at"
    t.index ["maker"], name: "index_parts_storages_on_maker"
    t.index ["price"], name: "index_parts_storages_on_price"
  end

  create_table "pc_custom_sets", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "user_id"
    t.string "name", null: false
    t.string "share_token", limit: 32
    t.bigint "cpu_id"
    t.bigint "gpu_id"
    t.bigint "memory_id"
    t.bigint "storage1_id", comment: "プライマリストレージ（必須）"
    t.bigint "storage2_id", comment: "セカンダリストレージ（任意）"
    t.bigint "storage3_id", comment: "追加ストレージ（任意）"
    t.bigint "os_id"
    t.bigint "motherboard_id"
    t.bigint "psu_id"
    t.bigint "case_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["case_id"], name: "index_pc_custom_sets_on_case_id"
    t.index ["cpu_id"], name: "index_pc_custom_sets_on_cpu_id"
    t.index ["gpu_id"], name: "index_pc_custom_sets_on_gpu_id"
    t.index ["memory_id"], name: "index_pc_custom_sets_on_memory_id"
    t.index ["motherboard_id"], name: "index_pc_custom_sets_on_motherboard_id"
    t.index ["os_id"], name: "index_pc_custom_sets_on_os_id"
    t.index ["psu_id"], name: "index_pc_custom_sets_on_psu_id"
    t.index ["share_token"], name: "index_pc_custom_sets_on_share_token", unique: true
    t.index ["storage1_id"], name: "fk_rails_60c03039d4"
    t.index ["storage2_id"], name: "fk_rails_15625106d9"
    t.index ["storage3_id"], name: "fk_rails_0ba3b00d1e"
    t.index ["user_id"], name: "index_pc_custom_sets_on_user_id"
  end

  create_table "pc_entrust_sets", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "name", null: false
    t.text "description"
    t.string "budget_range", null: false
    t.string "use_case", null: false
    t.bigint "cpu_id"
    t.bigint "gpu_id"
    t.bigint "memory_id"
    t.bigint "storage1_id", comment: "プライマリストレージ"
    t.bigint "storage2_id", comment: "セカンダリストレージ"
    t.bigint "storage3_id", comment: "追加ストレージ"
    t.bigint "os_id"
    t.bigint "motherboard_id"
    t.bigint "psu_id"
    t.bigint "case_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["budget_range"], name: "index_pc_entrust_sets_on_budget_range"
    t.index ["case_id"], name: "index_pc_entrust_sets_on_case_id"
    t.index ["cpu_id"], name: "index_pc_entrust_sets_on_cpu_id"
    t.index ["gpu_id"], name: "index_pc_entrust_sets_on_gpu_id"
    t.index ["memory_id"], name: "index_pc_entrust_sets_on_memory_id"
    t.index ["motherboard_id"], name: "index_pc_entrust_sets_on_motherboard_id"
    t.index ["os_id"], name: "index_pc_entrust_sets_on_os_id"
    t.index ["psu_id"], name: "index_pc_entrust_sets_on_psu_id"
    t.index ["storage1_id"], name: "fk_rails_f6a08dac22"
    t.index ["storage2_id"], name: "fk_rails_e5f9e648d0"
    t.index ["storage3_id"], name: "fk_rails_a29851768f"
    t.index ["use_case"], name: "index_pc_entrust_sets_on_use_case"
  end

  create_table "share_tokens", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "token", null: false
    t.json "parts_data", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["token"], name: "index_share_tokens_on_token", unique: true
  end

  create_table "social_accounts", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "provider", null: false
    t.string "uid", null: false
    t.string "email"
    t.string "name"
    t.string "avatar_url"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["provider", "uid"], name: "index_social_accounts_on_provider_and_uid", unique: true
    t.index ["user_id", "provider"], name: "index_social_accounts_on_user_id_and_provider", unique: true
    t.index ["user_id"], name: "index_social_accounts_on_user_id"
  end

  create_table "users", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "provider", default: "email", null: false, comment: "認証プロバイダー"
    t.string "uid", default: "", null: false, comment: "ユーザーの一意な識別子"
    t.string "encrypted_password", default: "", null: false, comment: "暗号化されたパスワード"
    t.string "reset_password_token", comment: "パスワードリセット用のトークン"
    t.datetime "reset_password_sent_at", comment: "パスワードリセットトークンの送信日時"
    t.boolean "allow_password_change", default: false, comment: "パスワード変更の許可フラグ"
    t.datetime "remember_created_at", comment: "記憶トークンの生成日時"
    t.string "confirmation_token", comment: "確認用トークン"
    t.datetime "confirmed_at", comment: "確認完了日時"
    t.datetime "confirmation_sent_at", comment: "確認メール送信日時"
    t.string "unconfirmed_email", comment: "未確認の新しいメールアドレス"
    t.string "name", comment: "ユーザーの名前"
    t.string "email", comment: "ユーザーのメールアドレス"
    t.text "tokens", comment: "認証トークン"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "role", default: "user", null: false
    t.index ["confirmation_token"], name: "index_users_on_confirmation_token", unique: true, comment: "確認トークンの一意制約インデックス"
    t.index ["email"], name: "index_users_on_email", unique: true, comment: "メールアドレスの一意制約インデックス"
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true, comment: "パスワードリセットトークンの一意制約インデックス"
    t.index ["role"], name: "index_users_on_role"
    t.index ["uid", "provider"], name: "index_users_on_uid_and_provider", unique: true, comment: "UIDとプロバイダーの複合一意制約インデックス"
  end

  add_foreign_key "pc_custom_sets", "parts_cases", column: "case_id", on_delete: :nullify
  add_foreign_key "pc_custom_sets", "parts_cpus", column: "cpu_id", on_delete: :nullify
  add_foreign_key "pc_custom_sets", "parts_gpus", column: "gpu_id", on_delete: :nullify
  add_foreign_key "pc_custom_sets", "parts_memories", column: "memory_id", on_delete: :nullify
  add_foreign_key "pc_custom_sets", "parts_motherboards", column: "motherboard_id", on_delete: :nullify
  add_foreign_key "pc_custom_sets", "parts_os", column: "os_id", on_delete: :nullify
  add_foreign_key "pc_custom_sets", "parts_psus", column: "psu_id", on_delete: :nullify
  add_foreign_key "pc_custom_sets", "parts_storages", column: "storage1_id", on_delete: :nullify
  add_foreign_key "pc_custom_sets", "parts_storages", column: "storage2_id", on_delete: :nullify
  add_foreign_key "pc_custom_sets", "parts_storages", column: "storage3_id", on_delete: :nullify
  add_foreign_key "pc_custom_sets", "users", on_delete: :cascade
  add_foreign_key "pc_entrust_sets", "parts_cases", column: "case_id", on_delete: :nullify
  add_foreign_key "pc_entrust_sets", "parts_cpus", column: "cpu_id", on_delete: :nullify
  add_foreign_key "pc_entrust_sets", "parts_gpus", column: "gpu_id", on_delete: :nullify
  add_foreign_key "pc_entrust_sets", "parts_memories", column: "memory_id", on_delete: :nullify
  add_foreign_key "pc_entrust_sets", "parts_motherboards", column: "motherboard_id", on_delete: :nullify
  add_foreign_key "pc_entrust_sets", "parts_os", column: "os_id", on_delete: :nullify
  add_foreign_key "pc_entrust_sets", "parts_psus", column: "psu_id", on_delete: :nullify
  add_foreign_key "pc_entrust_sets", "parts_storages", column: "storage1_id", on_delete: :nullify
  add_foreign_key "pc_entrust_sets", "parts_storages", column: "storage2_id", on_delete: :nullify
  add_foreign_key "pc_entrust_sets", "parts_storages", column: "storage3_id", on_delete: :nullify
  add_foreign_key "social_accounts", "users"
end
