resource "aws_db_subnet_group" "main" {
    name       = "${var.project_name}-db-subnet"
    subnet_ids = [aws_subnet.public_a.id, aws_subnet.public_b.id]
}

resource "aws_security_group" "rds" {
    name   = "${var.project_name}-rds-sg"
    vpc_id = aws_vpc.main.id
ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ec2.id]
    }
}

resource "aws_db_instance" "postgres" {
    identifier             = "${var.project_name}-db"
    engine                 = "postgres"
    engine_version         = "15.4"
    instance_class         = "db.t3.micro"
    allocated_storage      = 20
    db_name                = "cloudtask"
    username               = "postgres"
    password               = var.db_password
    db_subnet_group_name   = aws_db_subnet_group.main.name
    vpc_security_group_ids = [aws_security_group.rds.id]
    skip_final_snapshot    = true
    publicly_accessible    = false

    tags = { Name = "${var.project_name}-postgres" }
}
