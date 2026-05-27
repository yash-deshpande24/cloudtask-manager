resource "aws_ecr_repository" "backend" {
    name                 = "${var.project_name}-backend"
    image_tag_mutability = "MUTABLE"
    image_scanning_configuration { scan_on_push = true }
}

resource "aws_ecr_repository" "frontend" {
    name                 = "${var.project_name}-frontend"
    image_tag_mutability = "MUTABLE"
    image_scanning_configuration { scan_on_push = true }
}

# Lifecycle: keep only last 5 images
resource "aws_ecr_lifecycle_policy" "backend" {
    repository = aws_ecr_repository.backend.name
    policy = jsonencode({
    rules = [{
        rulePriority = 1
        selection    = { tagStatus = "any", countType = "imageCountMoreThan", countNumber = 5 }
        action       = { type = "expire" }
    }]
    })
}
