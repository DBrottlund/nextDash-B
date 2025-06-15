# GitHub Secrets Configuration

This document lists all required GitHub secrets for the Hostinger deployment workflow.

## Setup Instructions

1. Go to your GitHub repository
2. Navigate to Settings → Secrets and variables → Actions
3. Click "New repository secret" for each secret below
4. Copy the exact secret name and add your actual values

## Required Secrets

### Server Access
```
HOSTINGER_HOST
```
- **Value**: `46.202.198.218`
- **Description**: Your Hostinger server IP address

```
HOSTINGER_USER
```
- **Value**: `u400736858`
- **Description**: SSH username for your Hostinger server
- **Note**: SSH connects on port 65002 (configured in workflow)

```
HOSTINGER_SSH_KEY
```
- **Value**: Use the ED25519 private key below (entire key including headers)
```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACCsNEVnxENbPiuStfW5FSqpuwFEKBh0JC4idVBS4xNfVwAAAJBowA10aMAN
dAAAAAtzc2gtZWQyNTUxOQAAACCsNEVnxENbPiuStfW5FSqpuwFEKBh0JC4idVBS4xNfVw
AAAEC9Nw4bSTjqJtFi4+ff/xCAvh84Hobzu39XfpdQ5Buxbaw0RWfEQ1s+K5K19bkVKqm7
AUQoGHQkLiJ1UFLjE19XAAAABmRlcGxveQECAwQFBgc=
-----END OPENSSH PRIVATE KEY-----
```

### Database Configuration
```
DB_HOST
```
- **Value**: `srv574.hstgr.io`
- **Description**: Hostinger database server hostname

```
DB_NAME
```
- **Value**: `u400736858_nextdashb`
- **Description**: Database name

```
DB_USER
```
- **Value**: `u400736858_nextdashb`
- **Description**: Database username

```
DB_PASSWORD
```
- **Description**: Your actual Hostinger database password
- **Example**: `YourSecureDbPassword123!`

### Authentication Secrets
```
JWT_SECRET
```
- **Description**: 64-character random string for JWT signing
- **Generate with**: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

```
JWT_REFRESH_SECRET
```
- **Description**: 64-character random string for JWT refresh tokens
- **Generate with**: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

### Email Configuration
```
SMTP_USER
```
- **Description**: SMTP username for email sending
- **Example**: `your-smtp-username@example.com`

```
SMTP_PASSWORD
```
- **Description**: SMTP password for email authentication
- **Example**: `YourSMTPPassword123!`

```
FROM_EMAIL
```
- **Value**: `noreply@detaskify.me`
- **Description**: From email address for system emails

### Application Configuration
```
NEXT_PUBLIC_APP_URL
```
- **Value**: `https://nextdashb.detaskify.me`
- **Description**: Your application's public URL

### Admin User Setup
```
ADMIN_EMAIL
```
- **Value**: `admin@detaskify.me`
- **Description**: Primary admin user email

```
ADMIN_PASSWORD
```
- **Description**: Primary admin user password
- **Example**: `SecureAdminPassword123!`

### Optional Admin User
```
ADMIN2_EMAIL
```
- **Value**: `derek@detaskify.me`
- **Description**: Secondary admin user email (optional)

```
ADMIN2_PASSWORD
```
- **Description**: Secondary admin user password (optional)
- **Example**: `AnotherSecurePassword123!`

## Security Notes

- Never commit actual secret values to your repository
- Use strong, unique passwords for all accounts
- Regularly rotate your secrets, especially SSH keys and passwords
- Ensure your SSH key has appropriate permissions (600)
- Keep your database credentials secure and don't share them

## Verification

After setting up all secrets, the GitHub Actions workflow will:
1. Validate all required secrets are present
2. Test SSH connection to your server
3. Deploy your application automatically on push to main branch

## Troubleshooting

If deployment fails:
1. Check GitHub Actions logs for specific error messages
2. Verify all secrets are correctly named and contain valid values
3. Ensure your SSH key has access to the Hostinger server on port 65002
4. Test SSH connection manually: `ssh -p 65002 u400736858@46.202.198.218`
5. Confirm database credentials work by testing connection manually

## Manual SSH Connection

To test your SSH connection manually:
```bash
ssh -p 65002 u400736858@46.202.198.218
```
Password: `117532Uiop!!` (if SSH key authentication fails)