variable "aws_region"     { default = "us-east-1" }
variable "project_name"   { default = "cloudtask" }
variable "key_pair_name"  { description = "Your EC2 key pair name" }
variable "alert_email"    { description = "Email for CloudWatch alarms" }
variable "db_password"    { description = "RDS PostgreSQL password" sensitive = true }
