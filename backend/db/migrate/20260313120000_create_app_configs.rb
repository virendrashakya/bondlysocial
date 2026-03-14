class CreateAppConfigs < ActiveRecord::Migration[7.1]
  def change
    create_table :app_configs do |t|
      t.string :key,        null: false
      t.text   :value
      t.string :value_type, null: false, default: "string"
      t.text   :description
      t.timestamps
    end
    add_index :app_configs, :key, unique: true
  end
end
