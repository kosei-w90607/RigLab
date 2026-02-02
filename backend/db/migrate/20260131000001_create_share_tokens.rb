# frozen_string_literal: true

class CreateShareTokens < ActiveRecord::Migration[7.1]
  def change
    create_table :share_tokens do |t|
      t.string :token, null: false
      t.json :parts_data, null: false

      t.timestamps
    end

    add_index :share_tokens, :token, unique: true
  end
end
