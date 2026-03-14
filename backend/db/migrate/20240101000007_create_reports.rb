class CreateReports < ActiveRecord::Migration[7.1]
  def change
    create_table :reports do |t|
      t.references :reporter,  null: false, foreign_key: { to_table: :users }, index: true
      t.references :reported,  null: false, foreign_key: { to_table: :users }, index: true
      t.string     :reason,    null: false   # harassment | fake_profile | inappropriate | spam | other
      t.text       :details
      t.string     :status,    null: false, default: "open"   # open | reviewed | dismissed
      t.references :reviewed_by, foreign_key: { to_table: :users }, index: true
      t.datetime   :reviewed_at
      t.timestamps
    end

    add_index :reports, :status
  end
end
