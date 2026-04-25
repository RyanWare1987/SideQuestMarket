# S3 Asset Upload Setup

This guide explains how to set up automatic S3 asset uploads using GitHub Actions.

## Prerequisites

1. AWS S3 bucket for hosting assets
2. AWS IAM role or access keys with S3 permissions
3. GitHub repository with Actions enabled

## Setup Steps

### 1. Create S3 Bucket (if not exists)

```bash
# Create S3 bucket
aws s3 mb s3://your-bucket-name --region eu-west-2

# Enable public read access for assets
aws s3api put-bucket-policy --bucket your-bucket-name --policy '{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/assets/*"
    }
  ]
}'
```

### 2. Set up GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:

#### Option A: Using IAM Role (Recommended)
- `AWS_ROLE_ARN`: Your IAM role ARN (e.g., `arn:aws:iam::123456789012:role/GitHubActionsRole`)
- `AWS_REGION`: Your AWS region (e.g., `eu-west-2`)
- `S3_BUCKET_NAME`: Your S3 bucket name

#### Option B: Using Access Keys
- `AWS_ACCESS_KEY_ID`: Your AWS access key ID
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret access key
- `AWS_REGION`: Your AWS region (e.g., `eu-west-2`)
- `S3_BUCKET_NAME`: Your S3 bucket name

### 3. IAM Permissions

Your IAM role/user needs these permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:PutObjectAcl",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::your-bucket-name",
        "arn:aws:s3:::your-bucket-name/*"
      ]
    }
  ]
}
```

### 4. OIDC Setup (for IAM Role method)

If using IAM roles, set up OIDC trust relationship:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::123456789012:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRole",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
          "token.actions.githubusercontent.com:sub": "repo:your-username/your-repo:ref:refs/heads/master"
        }
      }
    }
  ]
}
```

## Usage

### Automatic Upload
- Push to `master` branch triggers automatic asset upload to S3

### Manual Upload
- Go to Actions tab → "Upload Assets to S3" → "Run workflow"

### Update URLs to S3
1. Go to Actions tab → "Update Asset URLs to S3" → "Run workflow"
2. Enter your S3 base URL (e.g., `https://your-bucket.s3.eu-west-2.amazonaws.com`)
3. Review and merge the created pull request

## File Structure in S3

```
s3://your-bucket-name/
└── assets/
    ├── optimized/
    │   ├── dice/
    │   ├── logos/
    │   └── backgrounds/
    ├── Dice/
    ├── VendorLogos/
    ├── Full logo/
    ├── EventMedia/
    └── MarketPhotos_2025_optimized/
```

## URLs After Upload

Your assets will be available at:
- `https://your-bucket.s3.eu-west-2.amazonaws.com/assets/Dice/dice-black.png`
- `https://your-bucket.s3.eu-west-2.amazonaws.com/assets/VendorLogos/logo.png`
- etc.

## Troubleshooting

1. **403 Forbidden**: Check bucket policy and IAM permissions
2. **Action fails**: Verify GitHub secrets are set correctly
3. **Files not uploading**: Check file paths in workflow match your structure