class CreateGroupMessages < ActiveRecord::Migration[7.1]
  def change
    create_table :group_messages do |t|
      t.references :group, null: false, foreign_key: true, index: true
      t.references :user,  null: false, foreign_key: true, index: true
      t.text       :body,  null: false
      t.timestamps
    end

    add_index :group_messages, [:group_id, :created_at]
  end
end
