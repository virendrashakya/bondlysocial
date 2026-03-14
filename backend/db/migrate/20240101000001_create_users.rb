class CreateUsers < ActiveRecord::Migration[7.1]
  def change
    create_table :users do |t|
      t.string   :email,              null: false
      t.string   :phone,              null: false
      t.string   :password_digest,    null: false
      t.string   :role,               null: false, default: "member"   # member | admin
      t.string   :status,             null: false, default: "pending"  # pending | active | suspended | deleted
      t.boolean  :phone_verified,     null: false, default: false
      t.boolean  :selfie_verified,    null: false, default: false
      t.string   :otp_code
      t.datetime :otp_expires_at
      t.string   :refresh_token
      t.datetime :last_active_at
      t.timestamps
    end

    add_index :users, :email,  unique: true
    add_index :users, :phone,  unique: true
    add_index :users, :status
    add_index :users, :role
  end
end
