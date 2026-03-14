class AddRemoteAvatarUrlToProfiles < ActiveRecord::Migration[7.1]
  def change
    add_column :profiles, :remote_avatar_url, :string
  end
end
