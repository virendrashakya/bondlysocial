class CreateProfiles < ActiveRecord::Migration[7.1]
  def change
    create_table :profiles do |t|
      t.references :user,         null: false, foreign_key: true, index: { unique: true }
      t.string     :name,         null: false
      t.integer    :age,          null: false
      t.string     :gender,       null: false   # male | female | non_binary | prefer_not_to_say
      t.string     :city,         null: false
      t.string     :occupation
      t.text       :bio
      t.string     :intent,       null: false   # see INTENTS constant
      t.jsonb      :interests,    null: false, default: []
      t.boolean    :hidden,       null: false, default: false
      t.string     :avatar_key                  # S3 object key
      t.string     :selfie_key                  # S3 object key
      t.timestamps
    end

    add_index :profiles, :city
    add_index :profiles, :intent
    add_index :profiles, :age
    add_index :profiles, :hidden
    add_index :profiles, :interests, using: :gin
  end
end
