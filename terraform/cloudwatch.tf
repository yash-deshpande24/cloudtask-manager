# SNS topic for alerts
resource "aws_sns_topic" "alerts" {
    name = "${var.project_name}-alerts"
}

resource "aws_sns_topic_subscription" "email" {
    topic_arn = aws_sns_topic.alerts.arn
    protocol  = "email"
    endpoint  = var.alert_email
}

# CPU alarm
resource "aws_cloudwatch_metric_alarm" "cpu_high" {
    alarm_name          = "${var.project_name}-cpu-high"
    comparison_operator = "GreaterThanThreshold"
    evaluation_periods  = 2
    metric_name         = "CPUUtilization"
    namespace           = "AWS/EC2"
    period              = 120
    statistic           = "Average"
    threshold           = 80
    alarm_description   = "EC2 CPU utilization > 80%"
    alarm_actions       = [aws_sns_topic.alerts.arn]
    dimensions          = { InstanceId = aws_instance.app.id }
}

# Status check alarm
resource "aws_cloudwatch_metric_alarm" "status_check" {
    alarm_name          = "${var.project_name}-status-check"
    comparison_operator = "GreaterThanThreshold"
    evaluation_periods  = 1
    metric_name         = "StatusCheckFailed"
    namespace           = "AWS/EC2"
    period              = 60
    statistic           = "Maximum"
    threshold           = 0
    alarm_actions       = [aws_sns_topic.alerts.arn]
    dimensions          = { InstanceId = aws_instance.app.id }
}

# CloudWatch Dashboard
resource "aws_cloudwatch_dashboard" "main" {
    dashboard_name = "${var.project_name}-dashboard"
    dashboard_body = jsonencode({
    widgets = [
        {
        type = "metric"
        properties = {
            title  = "EC2 CPU Utilization"
            metrics = [["AWS/EC2","CPUUtilization","InstanceId", aws_instance.app.id]]
            period = 300; stat = "Average"; view = "timeSeries"
        }
},
    {
        type = "metric"
        properties = {
            title  = "EC2 Network In/Out"
            metrics = [
            ["AWS/EC2","NetworkIn","InstanceId", aws_instance.app.id],
            ["AWS/EC2","NetworkOut","InstanceId", aws_instance.app.id]
        ]
            period = 300; stat = "Sum"; view = "timeSeries"
        }
        },
        {
        type = "metric"
        properties = {
            title  = "RDS Database Connections"
            metrics = [["AWS/RDS","DatabaseConnections","DBInstanceIdentifier", aws_db_instance.postgres.id]]
            period = 300; stat = "Average"; view = "timeSeries"
        }
        }
    ]
})
}
