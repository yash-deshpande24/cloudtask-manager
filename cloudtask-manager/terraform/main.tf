terraform {
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
  }
}

provider "aws" {
  region = var.aws_region
}

# ── VPC ──────────────────────────────────────────────────────
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  tags = { Name = "${var.project_name}-vpc" }
}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main.id
  tags   = { Name = "${var.project_name}-igw" }
}

resource "aws_subnet" "public_a" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true
  tags = { Name = "${var.project_name}-public-a" }
}

resource "aws_subnet" "public_b" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = "${var.aws_region}b"
  map_public_ip_on_launch = true
  tags = { Name = "${var.project_name}-public-b" }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  route { cidr_block = "0.0.0.0/0"; gateway_id = aws_internet_gateway.igw.id }
}

resource "aws_route_table_association" "a" {
  subnet_id      = aws_subnet.public_a.id
  route_table_id = aws_route_table.public.id
}

# ── SECURITY GROUPS ──────────────────────────────────────────
resource "aws_security_group" "ec2" {
  name   = "${var.project_name}-ec2-sg"
  vpc_id = aws_vpc.main.id

  ingress { from_port=22;   to_port=22;   protocol="tcp"; cidr_blocks=["0.0.0.0/0"] }
  ingress { from_port=80;   to_port=80;   protocol="tcp"; cidr_blocks=["0.0.0.0/0"] }
  ingress { from_port=3000; to_port=3000; protocol="tcp"; cidr_blocks=["0.0.0.0/0"] }
  ingress { from_port=5000; to_port=5000; protocol="tcp"; cidr_blocks=["0.0.0.0/0"] }
  egress  { from_port=0;    to_port=0;    protocol="-1";  cidr_blocks=["0.0.0.0/0"] }

  tags = { Name = "${var.project_name}-ec2-sg" }
}

# ── EC2 INSTANCE ─────────────────────────────────────────────
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]
  filter { name="name"; values=["ubuntu/images/hvm-ssd/ubuntu-22.04-amd64-server-*"] }
}

resource "aws_instance" "app" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = "t3.micro"
  subnet_id              = aws_subnet.public_a.id
  key_name               = var.key_pair_name
  vpc_security_group_ids = [aws_security_group.ec2.id]
  iam_instance_profile   = aws_iam_instance_profile.ec2_profile.name

  user_data = <<-EOF
    #!/bin/bash
    apt-get update -y
    apt-get install -y docker.io docker-compose awscli git
    systemctl start docker
    usermod -aG docker ubuntu
    cd /home/ubuntu
    git clone https://github.com/your-username/cloudtask-manager.git
    cd cloudtask-manager
    docker-compose up -d
  EOF

  tags = { Name = "${var.project_name}-app-server" }
}
