class CreateGroupMemberships < ActiveRecord::Migration[7.1]
  def change
    create_table :group_memberships do |t|
      t.references :group, null: false, foreign_key: true, index: true
      t.references :user,  null: false, foreign_key: true, index: true
      t.string     :role,  null: false, default: "member"  # member | admin
      t.timestamps
    end

    add_index :group_memberships, [:group_id, :user_id], unique: true
  end
end
