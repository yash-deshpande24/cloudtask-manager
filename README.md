# ☁️ CloudTask Manager

> Full-stack Task Management SaaS — React + Node.js + AWS + Docker + Terraform + GitHub Actions CI/CD

---

## 🚀 Run Locally in 3 Commands

```bash
git clone https://github.com/your-username/cloudtask-manager.git
cd cloudtask-manager
docker-compose up --build
```

- **Frontend** → http://localhost:3000
- **Backend API** → http://localhost:5000
- **Health Check** → http://localhost:5000/api/health

> ✅ No manual setup needed — PostgreSQL, backend, and frontend all start automatically.

---

## 🏗️ Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React.js, React Router, Axios |
| Backend | Node.js, Express.js, JWT Auth |
| Database | PostgreSQL (AWS RDS in prod) |
| Containers | Docker, Docker Compose |
| Infrastructure | Terraform (AWS EC2, RDS, ECR, VPC, IAM, CloudWatch) |
| CI/CD | GitHub Actions |
| Monitoring | AWS CloudWatch (Dashboards + CPU Alarms + SNS Email) |

---

## 📁 Project Structure

```
cloudtask-manager/
├── frontend/                     # React.js App
│   ├── src/
│   │   ├── api/index.js          # All Axios API calls
│   │   ├── context/AuthContext.js # JWT auth state
│   │   ├── pages/Login.js        # Login / Register page
│   │   └── pages/Dashboard.js    # Kanban task board
│   ├── Dockerfile                # Multi-stage: build + nginx
│   └── nginx.conf                # Reverse proxy /api → backend
│
├── backend/                      # Node.js + Express REST API
│   ├── src/
│   │   ├── server.js             # Entry point
│   │   ├── config/database.js    # PostgreSQL pool + table init
│   │   ├── middleware/auth.js    # JWT verification
│   │   ├── controllers/
│   │   │   ├── authController.js # register / login
│   │   │   └── taskController.js # CRUD operations
│   │   └── routes/
│   │       ├── auth.js
│   │       └── tasks.js
│   └── Dockerfile
│
├── terraform/                    # AWS Infrastructure as Code
│   ├── main.tf                   # VPC, EC2, Subnets, Security Groups
│   ├── rds.tf                    # PostgreSQL RDS instance
│   ├── ecr.tf                    # Docker image registries
│   ├── iam.tf                    # EC2 IAM role (ECR + CloudWatch)
│   ├── cloudwatch.tf             # Dashboard, CPU alarm, SNS alerts
│   ├── variables.tf
│   └── outputs.tf                # EC2 IP, RDS endpoint, ECR URLs
│
├── .github/
│   └── workflows/deploy.yml      # CI/CD: test → build → push ECR → deploy EC2
│
└── docker-compose.yml            # Local dev (postgres + backend + frontend)
```

---

## 📡 API Endpoints

```
POST  /api/auth/register     { name, email, password }
POST  /api/auth/login        { email, password }

GET   /api/tasks             Get all tasks          [auth required]
POST  /api/tasks             Create task            [auth required]
PUT   /api/tasks/:id         Update task            [auth required]
DELETE/api/tasks/:id         Delete task            [auth required]

GET   /api/health            Health check
```

---

## ☁️ Deploy to AWS

### Prerequisites
- AWS CLI configured (`aws configure`)
- Terraform v1.5+ installed
- A key pair created in AWS EC2

### Step 1 — Provision infrastructure
```bash
cd terraform
terraform init
terraform apply \
  -var="key_pair_name=your-key-name" \
  -var="db_password=YourSecurePassword" \
  -var="alert_email=you@example.com"
```

Terraform creates: VPC, EC2, RDS PostgreSQL, ECR repos, IAM roles, CloudWatch dashboard + alarms.

### Step 2 — Add GitHub Secrets

Go to your repo → Settings → Secrets and add:

| Secret | Value |
|---|---|
| `AWS_ACCESS_KEY_ID` | Your AWS access key |
| `AWS_SECRET_ACCESS_KEY` | Your AWS secret key |
| `ECR_REGISTRY` | From `terraform output ecr_backend_url` (base URL) |
| `EC2_HOST` | From `terraform output ec2_public_ip` |
| `EC2_SSH_KEY` | Contents of your `.pem` key file |

### Step 3 — Push to main
```bash
git push origin main
```

GitHub Actions will: test → build Docker images → push to ECR → deploy to EC2.

---

## 📊 CloudWatch Monitoring

After deployment, Terraform sets up:
- **Dashboard**: CPU, Network In/Out, RDS connections
- **Alarms**: CPU > 80% sends email via SNS
- **Status Check**: Instance health monitored

View your dashboard:
```
https://us-east-1.console.aws.amazon.com/cloudwatch/home#dashboards:name=cloudtask-dashboard
```

---

## 🔧 CI/CD Pipeline

```
Push to main
     │
     ▼
[1] Run Tests (backend + frontend)
     │
     ▼
[2] docker build → push to AWS ECR
     │
     ▼
[3] SSH into EC2 → docker-compose pull → up -d
     │
     ▼
[4] CloudWatch monitors health
```
<img width="1536" height="1024" alt="image" src="https://github.com/user-attachments/assets/952ccbcc-9075-4391-9cf1-5506f3eaea6e" />

<img width="1536" height="1024" alt="image" src="https://github.com/user-attachments/assets/ce98f1fd-3807-4cbb-a4e6-2aa936481a19" />

<img width="1536" height="1024" alt="image" src="https://github.com/user-attachments/assets/fb8d9d2b-8048-4cd5-93be-4e497943fd8a" />


---


