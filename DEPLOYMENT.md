# Deployment Guide

## Overview

The app runs on Google Cloud Run — a service that takes a Docker
container and runs it on the internet. You push code to GitHub,
Cloud Build automatically builds a new container, and Cloud Run
starts serving it. No server management.

Neon stays as the database. Cloud Run just runs the app.

## Cost Estimate

| Item | Monthly |
|------|---------|
| Cloud Run (low traffic) | $0–5 |
| Neon PostgreSQL (free tier) | $0 |
| Domain (annual, amortized) | ~$1 |
| **Total** | **$0–6/month** |

Cloud Run charges per request and per second of compute. At soft
launch traffic (< 1000 users), you'll likely stay in the free tier.

---

## One-Time GCP Setup

### 1. Create a GCP Project

Go to https://console.cloud.google.com and create a new project.
Name it something like `learning-app`. Note the Project ID (shown
under the project name — it might be slightly different from the
name if yours was taken).

### 2. Enable Required APIs

In the GCP console, go to "APIs & Services" → "Enable APIs" and
enable these three:

- Cloud Run API
- Cloud Build API
- Artifact Registry API
- Secret Manager API

Or run this in Cloud Shell (the terminal icon at the top of the
GCP console):

```bash
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com
```

### 3. Create an Artifact Registry Repository

This is where your Docker images get stored. Think of it as a
warehouse for shipping containers.

```bash
gcloud artifacts repositories create learning-app \
  --repository-format=docker \
  --location=us-central1 \
  --description="Learning app Docker images"
```

### 4. Set Up Secrets

These are your environment variables, stored securely. Never put
real values in code or .env files that get deployed.

```bash
# Your Neon database URL (get this from your Neon dashboard)
echo -n "postgresql://USER:PASS@HOST/DB?sslmode=require" | \
  gcloud secrets create database-url --data-file=-

# Generate a random secret for NextAuth session signing
openssl rand -base64 32 | \
  gcloud secrets create nextauth-secret --data-file=-

# Your production URL (update after you get your Cloud Run URL)
echo -n "https://YOUR-APP-URL.run.app" | \
  gcloud secrets create nextauth-url --data-file=-
```

### 5. Grant Permissions

Cloud Build needs permission to deploy to Cloud Run and read secrets.

```bash
PROJECT_ID=$(gcloud config get-value project)
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')

# Cloud Build → Cloud Run deployment permission
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/run.admin"

# Cloud Build → act as the Cloud Run service account
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

# Cloud Build → read secrets
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Cloud Run service → read secrets at runtime
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### 6. Connect GitHub to Cloud Build

Go to https://console.cloud.google.com/cloud-build/triggers

- Click "Connect Repository"
- Select GitHub, authorize, and pick `jbeck1689/Public-Reasons`
- Create a trigger:
  - Name: `deploy-on-push`
  - Event: Push to branch
  - Branch: `^main$`
  - Configuration: Cloud Build configuration file
  - Location: `/cloudbuild.yaml`
  - Substitution variables: leave defaults unless you changed the region

### 7. First Deploy

Push any commit to main. Cloud Build will automatically:
1. Build the Docker image (~2-3 minutes)
2. Push it to Artifact Registry
3. Deploy it to Cloud Run

Watch the build at: https://console.cloud.google.com/cloud-build/builds

Once it's live, Cloud Run gives you a URL like:
`https://learning-app-XXXXX-uc.a.run.app`

### 8. Update NEXTAUTH_URL

After you get your Cloud Run URL, update the secret:

```bash
echo -n "https://learning-app-XXXXX-uc.a.run.app" | \
  gcloud secrets versions add nextauth-url --data-file=-
```

Then redeploy (push a commit or click "Edit & Deploy New Revision"
in the Cloud Run console).

---

## Custom Domain (Optional, Later)

Once the app is running on the Cloud Run URL:

1. Buy a domain (Google Domains, Namecheap, etc.)
2. In Cloud Run console → your service → "Manage Custom Domains"
3. Follow the DNS verification steps
4. Update the `nextauth-url` secret to your custom domain
5. Cloud Run handles SSL certificates automatically

---

## Troubleshooting

**Build fails with "prisma generate" error:**
The Dockerfile runs `prisma generate` during the build. If it
fails, the Prisma schema might have changed without updating
the lock file. Run `npx prisma generate` locally first.

**App starts but database errors:**
Check that the `database-url` secret has the correct Neon
connection string including `?sslmode=require`.

**Auth doesn't work (redirect loops):**
The `nextauth-url` secret must exactly match the URL you're
accessing the app from, including `https://`. No trailing slash.

**"Too many requests" immediately:**
The in-memory rate limiter resets when the container restarts.
Cloud Run can scale to multiple instances, each with their own
counters. At soft launch scale this doesn't matter. If it does
later, swap in Redis.
