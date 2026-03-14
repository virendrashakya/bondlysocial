class CreateNotifications < ActiveRecord::Migration[7.1]
  def change
    create_table :notifications do |t|
      t.references :user,       null: false, foreign_key: true, index: true
      t.string     :kind,       null: false   # connection_request | message | group_invite | system
      t.string     :title,      null: false
      t.text       :body
      t.jsonb      :metadata,   null: false, default: {}
      t.boolean    :read,       null: false, default: false
      t.timestamps
    end

    add_index :notifications, [:user_id, :read]
    add_index :notifications, :kind
  end
end
