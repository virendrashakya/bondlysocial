class EnhancePostsAndMessagesForInstagramMedia < ActiveRecord::Migration[7.1]
  def change
    # Posts: add visibility control (public = everyone, connections = only connected users)
    add_column :posts, :visibility, :string, default: "public", null: false
    add_index  :posts, :visibility

    # Posts: add location tag (optional, like Instagram)
    add_column :posts, :location, :string

    # Messages: allow referencing/sharing a post in a message
    add_reference :messages, :referenced_post, foreign_key: { to_table: :posts }, null: true

    # Make message body optional (can be just a post reference)
    change_column_null :messages, :body, true
  end
end
