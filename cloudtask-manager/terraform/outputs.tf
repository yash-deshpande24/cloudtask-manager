output "ec2_public_ip"       { value = aws_instance.app.public_ip }
output "ec2_public_dns"      { value = aws_instance.app.public_dns }
output "rds_endpoint"        { value = aws_db_instance.postgres.endpoint }
output "ecr_backend_url"     { value = aws_ecr_repository.backend.repository_url }
output "ecr_frontend_url"    { value = aws_ecr_repository.frontend.repository_url }
output "cloudwatch_dashboard"{ value = "https://${var.aws_region}.console.aws.amazon.com/cloudwatch/home#dashboards:name=${var.project_name}-dashboard" }
