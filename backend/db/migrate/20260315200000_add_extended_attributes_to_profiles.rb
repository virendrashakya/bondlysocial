class AddExtendedAttributesToProfiles < ActiveRecord::Migration[7.1]
  def change
    # Cultural / Identity
    add_column :profiles, :cultural_background,        :string
    add_column :profiles, :cultural_background_custom,  :string
    add_column :profiles, :religion,                    :string
    add_column :profiles, :religion_visibility,         :string, default: "visible", null: false
    add_column :profiles, :languages_spoken,            :jsonb,  default: [],        null: false

    # Physical Appearance
    add_column :profiles, :height_cm,       :integer
    add_column :profiles, :body_type,       :string
    add_column :profiles, :appearance_tags, :jsonb, default: [], null: false

    # Lifestyle
    add_column :profiles, :drinking,            :string
    add_column :profiles, :smoking,             :string
    add_column :profiles, :workout_frequency,   :string
    add_column :profiles, :relationship_status, :string

    # Privacy Controls
    add_column :profiles, :show_height,        :boolean, default: true, null: false
    add_column :profiles, :show_body_type,     :boolean, default: true, null: false
    add_column :profiles, :show_online_status, :boolean, default: true, null: false
  end
end
