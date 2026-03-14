class AddPinnedToMessages < ActiveRecord::Migration[7.1]
  def change
    add_column :messages, :pinned, :boolean, default: false, null: false
    add_column :messages, :pinned_at, :datetime
    add_column :messages, :pinned_by_id, :bigint
    add_foreign_key :messages, :users, column: :pinned_by_id
    add_index :messages, [:connection_id, :pinned], where: "pinned = true", name: "idx_pinned_messages"
  end
end
