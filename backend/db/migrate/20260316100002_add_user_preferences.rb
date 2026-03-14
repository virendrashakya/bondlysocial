class AddUserPreferences < ActiveRecord::Migration[7.1]
  def change
    add_column :users, :privacy_settings, :jsonb, default: {}, null: false
    add_column :users, :notification_preferences, :jsonb, default: {}, null: false
  end
end
