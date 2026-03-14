class CreateGroups < ActiveRecord::Migration[7.1]
  def change
    create_table :groups do |t|
      t.references :creator,    null: false, foreign_key: { to_table: :users }, index: true
      t.string     :title,      null: false
      t.text       :description
      t.string     :city,       null: false
      t.integer    :max_members, null: false, default: 20
      t.string     :status,     null: false, default: "active"  # active | archived
      t.timestamps
    end

    add_index :groups, :city
    add_index :groups, :status
  end
end
