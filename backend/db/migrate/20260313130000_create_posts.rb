class CreatePosts < ActiveRecord::Migration[7.1]
  def change
    create_table :posts do |t|
      t.references :user, null: false, foreign_key: true
      t.text :caption
      t.integer :likes_count, default: 0, null: false
      t.integer :comments_count, default: 0, null: false

      t.timestamps
    end

    create_table :post_likes do |t|
      t.references :post, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.timestamps
    end

    add_index :post_likes, [:post_id, :user_id], unique: true
  end
end
