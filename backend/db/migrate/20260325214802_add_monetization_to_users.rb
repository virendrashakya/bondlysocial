class AddMonetizationToUsers < ActiveRecord::Migration[7.1]
  def change
    add_column :users, :subscription_tier, :string, default: "free", null: false
    add_column :users, :daily_views_count, :integer, default: 0, null: false
    add_column :users, :last_viewed_date, :date
  end
end
