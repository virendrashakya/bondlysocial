require "administrate/base_dashboard"

class ReportDashboard < Administrate::BaseDashboard
  ATTRIBUTE_TYPES = {
    id: Field::Number,
    reporter: Field::BelongsTo,
    reported: Field::BelongsTo,
    reason: Field::String,
    details: Field::Text,
    status: Field::String,
    reviewed_by: Field::BelongsTo,
    reviewed_at: Field::DateTime,
    created_at: Field::DateTime,
    updated_at: Field::DateTime,
  }.freeze

  COLLECTION_ATTRIBUTES = %i[
    id
    reporter
    reported
    reason
    status
    created_at
  ].freeze

  SHOW_PAGE_ATTRIBUTES = %i[
    id
    reporter
    reported
    reason
    details
    status
    reviewed_by
    reviewed_at
    created_at
    updated_at
  ].freeze

  FORM_ATTRIBUTES = %i[
    reporter
    reported
    reason
    details
    status
    reviewed_by
    reviewed_at
  ].freeze

  COLLECTION_FILTERS = {
    pending: ->(resources) { resources.where(status: "pending") },
    reviewed: ->(resources) { resources.where(status: "reviewed") },
  }.freeze

  def display_resource(report)
    "Report ##{report.id} — #{report.reason}"
  end
end
