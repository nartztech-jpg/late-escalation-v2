# Google OAuth Setup Guide

This guide walks you through setting up Google OAuth for Gmail integration in LateEscalate.

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click the project dropdown at the top
3. Click "NEW PROJECT"
4. Enter project name: "LateEscalate"
5. Click "CREATE"
6. Wait for project to be created

## Step 2: Enable Gmail API

1. In the left sidebar, click "APIs & Services" → "Library"
2. Search for "Gmail API"
3. Click on "Gmail API"
4. Click "ENABLE"
5. Wait for API to be enabled

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "CREATE CREDENTIALS" → "OAuth client ID"
3. You may be prompted to "Configure OAuth consent screen" first
4. If prompted, click "CONFIGURE CONSENT SCREEN"

### Configure OAuth Consent Screen

1. Select "External" for user type
2. Click "CREATE"
3. Fill in the form:
   - **App name:** LateEscalate
   - **User support email:** your-email@example.com
   - **Developer contact:** your-email@example.com
4. Click "SAVE AND CONTINUE"
5. On "Scopes" page, click "ADD OR REMOVE SCOPES"
6. Search for and add these scopes:
   - `https://www.googleapis.com/auth/gmail.send`
   - `https://www.googleapis.com/auth/gmail.readonly`
7. Click "UPDATE"
8. Click "SAVE AND CONTINUE"
9. On "Test users" page, add your email address
10. Click "SAVE AND CONTINUE"
11. Review and click "BACK TO DASHBOARD"

### Create OAuth Credentials

1. Go back to "Credentials" page
2. Click "CREATE CREDENTIALS" → "OAuth client ID"
3. Select "Web application"
4. Fill in the form:
   - **Name:** LateEscalate Web Client
   - **Authorized JavaScript origins:** (leave empty for now)
   - **Authorized redirect URIs:** Add these:
     - `http://localhost:3000/api/gmail/callback` (development)
     - `https://yourdomain.com/api/gmail/callback` (production)
5. Click "CREATE"
6. Copy the Client ID and Client Secret

## Step 4: Add Credentials to .env.local

```bash
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/gmail/callback
```

## Step 5: Update Redirect URIs for Production

When you deploy to production:

1. Go back to Google Cloud Console
2. Go to "APIs & Services" → "Credentials"
3. Click on your OAuth 2.0 client
4. Add your production redirect URI:
   - `https://yourdomain.com/api/gmail/callback`
5. Click "SAVE"

## Step 6: Test Gmail Connection

1. Start the development server: `pnpm dev`
2. Go to Settings page
3. Click "Connect Gmail"
4. You'll be redirected to Google login
5. Log in with your Google account
6. Grant permissions
7. You should be redirected back to Settings with "Gmail Connected" status

## Troubleshooting

### "Invalid client" error

- Verify Client ID and Client Secret are correct
- Check that OAuth consent screen is configured
- Ensure your email is added as a test user

### "Redirect URI mismatch" error

- Verify redirect URI exactly matches in Google Console
- Check for trailing slashes or protocol differences
- Update Google Console if using new domain

### "Access denied" error

- Ensure Gmail API is enabled
- Check that scopes are correctly configured
- Verify test user email is added to OAuth consent screen

### Gmail not sending emails

- Verify access token is valid
- Check that Gmail is connected in Settings
- Ensure email is scheduled for today or earlier
- Check email logs for error messages

## Security Notes

- Never commit `.env.local` to version control
- Keep Client Secret secure
- Use HTTPS in production
- Regularly review connected apps in Google Account settings
- Revoke access if credentials are compromised

## Additional Resources

- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Gmail API Documentation](https://developers.google.com/gmail/api)
- [Google Cloud Console](https://console.cloud.google.com)
