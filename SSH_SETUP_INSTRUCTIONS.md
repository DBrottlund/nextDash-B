# SSH Key Setup Instructions

## ✅ SSH Key Pair Generated

The SSH key pair has been created for GitHub Actions deployment.

## Step 1: Add Public Key to Hostinger Server

### Option A: Via SSH (Recommended)
```bash
# Connect to your server
ssh -p 65002 u400736858@46.202.198.218

# Create .ssh directory if it doesn't exist
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Add the public key to authorized_keys
echo "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQCsmw/c3PR09wUuciS1iBrnscRCl26Ko1EzYDqQy8/jPhdO8ExgLWpA7SpKZ/dgNL30rdkpCWdOTeCBpOb9WN5Hw+fQUHiKob8WVX5WyhCQVgjCIhnPU5ykYeZ6iNzxvWTEEBVzMzCkFDg5PmsTdkxJCfjMazYwiBVXN1PaJ/A7DM98GP40bsASKQOtLcob/BwrCQocv8l7JYt48NveS5czivNScfiNc+EYnLIeK+XHU5U21iWdjBNSEI4EejpnWuO/AXI1okeQ/1JNYeshnV7pCfZeHDoaF3I1A8KXbXP2guEtDa1Lp/vIdopNAs9KAUvIq2oBpeHhunH8c+w/Lb3P1/gNrhhuv3UtP3Ka+eMqNJTC5+4ZTzq9LZqUZdpzfOgC7PpLXcMjsu2LPvtqVLRgBe39gXMGsZf8eU/UTyMfhPTqwNQGr5115irB26rWJBj9H5QpMOGI8Aix3P15Tmg5Q5qGUOMyWC4uNRRwnO0aQRB1ENAH9TrWpH1oP2MBZr5TslxfDzT4QRWak5+y+P6AHc2TlQ++6w+pu/bJgAkD5Sj07jhARBDWbye2e5RSjq1PXH4Oy59+5FbnmlaEIEVSd8CS7xmHbGnAFIrEGCcfTrMYeUiis1yqYDH9Ix9iOHMNQvbsYFjEE5q2sPU1NwgLIyWPIIo7vry17BZdTMAIqw== github-actions-deploy@nextdashb" >> ~/.ssh/authorized_keys

# Set correct permissions
chmod 600 ~/.ssh/authorized_keys

# Exit SSH session
exit
```

### Option B: Via Hostinger Control Panel
1. Log into Hostinger control panel
2. Go to Advanced → SSH Access
3. Add the public key to SSH Keys section
4. Use this public key:
```
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQCsmw/c3PR09wUuciS1iBrnscRCl26Ko1EzYDqQy8/jPhdO8ExgLWpA7SpKZ/dgNL30rdkpCWdOTeCBpOb9WN5Hw+fQUHiKob8WVX5WyhCQVgjCIhnPU5ykYeZ6iNzxvWTEEBVzMzCkFDg5PmsTdkxJCfjMazYwiBVXN1PaJ/A7DM98GP40bsASKQOtLcob/BwrCQocv8l7JYt48NveS5czivNScfiNc+EYnLIeK+XHU5U21iWdjBNSEI4EejpnWuO/AXI1okeQ/1JNYeshnV7pCfZeHDoaF3I1A8KXbXP2guEtDa1Lp/vIdopNAs9KAUvIq2oBpeHhunH8c+w/Lb3P1/gNrhhuv3UtP3Ka+eMqNJTC5+4ZTzq9LZqUZdpzfOgC7PpLXcMjsu2LPvtqVLRgBe39gXMGsZf8eU/UTyMfhPTqwNQGr5115irB26rWJBj9H5QpMOGI8Aix3P15Tmg5Q5qGUOMyWC4uNRRwnO0aQRB1ENAH9TrWpH1oP2MBZr5TslxfDzT4QRWak5+y+P6AHc2TlQ++6w+pu/bJgAkD5Sj07jhARBDWbye2e5RSjq1PXH4Oy59+5FbnmlaEIEVSd8CS7xmHbGnAFIrEGCcfTrMYeUiis1yqYDH9Ix9iOHMNQvbsYFjEE5q2sPU1NwgLIyWPIIo7vry17BZdTMAIqw== github-actions-deploy@nextdashb
```

## Step 2: Add Private Key to GitHub Secrets

1. Go to your GitHub repository: `https://github.com/your-username/nextDash-B`
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `HOSTINGER_SSH_KEY`
5. Value: Copy the entire private key below (including headers):

```
-----BEGIN OPENSSH PRIVATE KEY-----
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
-----END OPENSSH PRIVATE KEY-----
```

## Step 3: Test SSH Connection

After adding the public key to Hostinger, test the connection:

```bash
ssh -p 65002 -i ~/.ssh/hostinger_deploy u400736858@46.202.198.218
```

If successful, you should connect without entering a password.

## Step 4: Clean Up Local Files (Optional)

After setting up GitHub secrets, you can remove the local key files:

```bash
# Remove local SSH keys (optional - keep them for troubleshooting)
rm ~/.ssh/hostinger_deploy ~/.ssh/hostinger_deploy.pub
```

## Troubleshooting

If SSH key authentication fails:
1. Verify the public key was added correctly to your server
2. Check file permissions on server: `~/.ssh` (700), `~/.ssh/authorized_keys` (600)
3. Test with password authentication as fallback: `ssh -p 65002 u400736858@46.202.198.218`
4. Check SSH logs on server: `sudo tail -f /var/log/auth.log`

## Next Steps

After completing SSH key setup:
1. Add all other secrets from `GITHUB_SECRETS.md`
2. Push your code to trigger the deployment
3. Monitor GitHub Actions for successful deployment