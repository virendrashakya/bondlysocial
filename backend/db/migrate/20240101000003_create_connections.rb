class CreateConnections < ActiveRecord::Migration[7.1]
  def change
    create_table :connections do |t|
      t.references :requester, null: false, foreign_key: { to_table: :users }, index: true
      t.references :receiver,  null: false, foreign_key: { to_table: :users }, index: true
      t.string     :status,    null: false, default: "pending"  # pending | accepted | rejected
      t.timestamps
    end

    # Prevent duplicate connection pairs
    add_index :connections, [:requester_id, :receiver_id], unique: true
    add_index :connections, :status
  end
end
