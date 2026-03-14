# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.1].define(version: 2026_03_16_200001) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "active_storage_attachments", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.string "service_name", null: false
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "app_configs", force: :cascade do |t|
    t.string "key", null: false
    t.text "value"
    t.string "value_type", default: "string", null: false
    t.text "description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["key"], name: "index_app_configs_on_key", unique: true
  end

  create_table "blocks", force: :cascade do |t|
    t.bigint "blocker_id", null: false
    t.bigint "blocked_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["blocked_id"], name: "index_blocks_on_blocked_id"
    t.index ["blocker_id", "blocked_id"], name: "index_blocks_on_blocker_id_and_blocked_id", unique: true
    t.index ["blocker_id"], name: "index_blocks_on_blocker_id"
  end

  create_table "connections", force: :cascade do |t|
    t.bigint "requester_id", null: false
    t.bigint "receiver_id", null: false
    t.string "status", default: "pending", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["receiver_id"], name: "index_connections_on_receiver_id"
    t.index ["requester_id", "receiver_id"], name: "index_connections_on_requester_id_and_receiver_id", unique: true
    t.index ["requester_id"], name: "index_connections_on_requester_id"
    t.index ["status"], name: "index_connections_on_status"
  end

  create_table "group_memberships", force: :cascade do |t|
    t.bigint "group_id", null: false
    t.bigint "user_id", null: false
    t.string "role", default: "member", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["group_id", "user_id"], name: "index_group_memberships_on_group_id_and_user_id", unique: true
    t.index ["group_id"], name: "index_group_memberships_on_group_id"
    t.index ["user_id"], name: "index_group_memberships_on_user_id"
  end

  create_table "groups", force: :cascade do |t|
    t.bigint "creator_id", null: false
    t.string "title", null: false
    t.text "description"
    t.string "city", null: false
    t.integer "max_members", default: 20, null: false
    t.string "status", default: "active", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "category"
    t.index ["city"], name: "index_groups_on_city"
    t.index ["creator_id"], name: "index_groups_on_creator_id"
    t.index ["status"], name: "index_groups_on_status"
  end

  create_table "message_reactions", force: :cascade do |t|
    t.bigint "message_id", null: false
    t.bigint "user_id", null: false
    t.string "emoji", limit: 10, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["message_id", "user_id", "emoji"], name: "idx_unique_reaction", unique: true
    t.index ["message_id"], name: "index_message_reactions_on_message_id"
    t.index ["user_id"], name: "index_message_reactions_on_user_id"
  end

  create_table "messages", force: :cascade do |t|
    t.bigint "connection_id", null: false
    t.bigint "sender_id", null: false
    t.text "body"
    t.boolean "read", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "referenced_post_id"
    t.boolean "pinned", default: false, null: false
    t.datetime "pinned_at"
    t.bigint "pinned_by_id"
    t.index ["connection_id", "created_at"], name: "index_messages_on_connection_id_and_created_at"
    t.index ["connection_id", "pinned"], name: "idx_pinned_messages", where: "(pinned = true)"
    t.index ["connection_id"], name: "index_messages_on_connection_id"
    t.index ["referenced_post_id"], name: "index_messages_on_referenced_post_id"
    t.index ["sender_id"], name: "index_messages_on_sender_id"
  end

  create_table "notifications", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "kind", null: false
    t.string "title", null: false
    t.text "body"
    t.jsonb "metadata", default: {}, null: false
    t.boolean "read", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["kind"], name: "index_notifications_on_kind"
    t.index ["user_id", "read"], name: "index_notifications_on_user_id_and_read"
    t.index ["user_id"], name: "index_notifications_on_user_id"
  end

  create_table "post_likes", force: :cascade do |t|
    t.bigint "post_id", null: false
    t.bigint "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["post_id", "user_id"], name: "index_post_likes_on_post_id_and_user_id", unique: true
    t.index ["post_id"], name: "index_post_likes_on_post_id"
    t.index ["user_id"], name: "index_post_likes_on_user_id"
  end

  create_table "posts", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.text "caption"
    t.integer "likes_count", default: 0, null: false
    t.integer "comments_count", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "visibility", default: "public", null: false
    t.string "location"
    t.index ["user_id"], name: "index_posts_on_user_id"
    t.index ["visibility"], name: "index_posts_on_visibility"
  end

  create_table "profiles", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "name", null: false
    t.integer "age", null: false
    t.string "gender", null: false
    t.string "city", null: false
    t.string "occupation"
    t.text "bio"
    t.string "intent", null: false
    t.jsonb "interests", default: [], null: false
    t.boolean "hidden", default: false, null: false
    t.string "avatar_key"
    t.string "selfie_key"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "cultural_background"
    t.string "cultural_background_custom"
    t.string "religion"
    t.string "religion_visibility", default: "visible", null: false
    t.jsonb "languages_spoken", default: [], null: false
    t.integer "height_cm"
    t.string "body_type"
    t.jsonb "appearance_tags", default: [], null: false
    t.string "drinking"
    t.string "smoking"
    t.string "workout_frequency"
    t.string "relationship_status"
    t.boolean "show_height", default: true, null: false
    t.boolean "show_body_type", default: true, null: false
    t.boolean "show_online_status", default: true, null: false
    t.string "remote_avatar_url"
    t.index ["age"], name: "index_profiles_on_age"
    t.index ["city"], name: "index_profiles_on_city"
    t.index ["hidden"], name: "index_profiles_on_hidden"
    t.index ["intent"], name: "index_profiles_on_intent"
    t.index ["interests"], name: "index_profiles_on_interests", using: :gin
    t.index ["user_id"], name: "index_profiles_on_user_id", unique: true
  end

  create_table "reports", force: :cascade do |t|
    t.bigint "reporter_id", null: false
    t.bigint "reported_id", null: false
    t.string "reason", null: false
    t.text "details"
    t.string "status", default: "open", null: false
    t.bigint "reviewed_by_id"
    t.datetime "reviewed_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["reported_id"], name: "index_reports_on_reported_id"
    t.index ["reporter_id"], name: "index_reports_on_reporter_id"
    t.index ["reviewed_by_id"], name: "index_reports_on_reviewed_by_id"
    t.index ["status"], name: "index_reports_on_status"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", null: false
    t.string "phone", null: false
    t.string "password_digest", null: false
    t.string "role", default: "member", null: false
    t.string "status", default: "pending", null: false
    t.boolean "phone_verified", default: false, null: false
    t.boolean "selfie_verified", default: false, null: false
    t.string "otp_code"
    t.datetime "otp_expires_at"
    t.string "refresh_token"
    t.datetime "last_active_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.jsonb "privacy_settings", default: {}, null: false
    t.jsonb "notification_preferences", default: {}, null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["phone"], name: "index_users_on_phone", unique: true
    t.index ["role"], name: "index_users_on_role"
    t.index ["status"], name: "index_users_on_status"
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "blocks", "users", column: "blocked_id"
  add_foreign_key "blocks", "users", column: "blocker_id"
  add_foreign_key "connections", "users", column: "receiver_id"
  add_foreign_key "connections", "users", column: "requester_id"
  add_foreign_key "group_memberships", "groups"
  add_foreign_key "group_memberships", "users"
  add_foreign_key "groups", "users", column: "creator_id"
  add_foreign_key "message_reactions", "messages"
  add_foreign_key "message_reactions", "users"
  add_foreign_key "messages", "connections"
  add_foreign_key "messages", "posts", column: "referenced_post_id"
  add_foreign_key "messages", "users", column: "pinned_by_id"
  add_foreign_key "messages", "users", column: "sender_id"
  add_foreign_key "notifications", "users"
  add_foreign_key "post_likes", "posts"
  add_foreign_key "post_likes", "users"
  add_foreign_key "posts", "users"
  add_foreign_key "profiles", "users"
  add_foreign_key "reports", "users", column: "reported_id"
  add_foreign_key "reports", "users", column: "reporter_id"
  add_foreign_key "reports", "users", column: "reviewed_by_id"
end
