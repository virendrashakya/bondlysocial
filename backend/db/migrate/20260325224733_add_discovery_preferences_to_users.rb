class AddDiscoveryPreferencesToUsers < ActiveRecord::Migration[7.1]
  def change
    add_column :users, :discovery_preferences, :jsonb, default: {}, null: false
  end
end
