class AddCategoryToGroups < ActiveRecord::Migration[7.1]
  def change
    add_column :groups, :category, :string
  end
end
