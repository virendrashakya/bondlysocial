class AdminReportSerializer
  include JSONAPI::Serializer

  attributes :reason, :details, :status, :created_at, :reviewed_at

  attribute :reporter_id do |report|
    report.reporter_id
  end

  attribute :reported_id do |report|
    report.reported_id
  end

  attribute :reporter_name do |report|
    report.reporter.profile&.name || report.reporter.email
  end

  attribute :reported_name do |report|
    report.reported.profile&.name || report.reported.email
  end

  attribute :reported_status do |report|
    report.reported.status
  end
end
