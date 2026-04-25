# LateEscalate Deployment Guide

This guide covers deploying LateEscalate to production on Vercel, Railway, or Render.

## Prerequisites

- GitHub account with code pushed
- Supabase project with migrations applied
- Stripe account with products configured
- Google OAuth credentials
- Claude API key
- Manus OAuth credentials

## Deployment to Vercel

### 1. Connect Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Select the project and click "Import"

### 2. Configure Environment Variables

In Vercel project settings, add all variables from `.env.local.example`:

```
DATABASE_URL=your-supabase-connection-string
JWT_SECRET=generate-a-strong-secret
VITE_APP_ID=your-manus-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://manus.im/oauth
OWNER_NAME=Your Name
OWNER_OPEN_ID=your-manus-open-id
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=https://your-domain.vercel.app/api/gmail/callback
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
SCHEDULER_API_KEY=generate-a-random-key
VITE_API_URL=https://your-domain.vercel.app
VITE_APP_TITLE=LateEscalate
BUILT_IN_FORGE_API_URL=https://forge.manus.im
BUILT_IN_FORGE_API_KEY=your-api-key
VITE_FRONTEND_FORGE_API_URL=https://forge.manus.im
VITE_FRONTEND_FORGE_API_KEY=your-frontend-api-key
NODE_ENV=production
```

### 3. Configure Build Settings

- **Build Command:** `pnpm build`
- **Output Directory:** `dist`
- **Install Command:** `pnpm install`

### 4. Deploy

Click "Deploy" and wait for the build to complete.

### 5. Post-Deployment

1. Update Google OAuth redirect URI to your Vercel domain
2. Update Stripe webhook endpoint to your Vercel domain
3. Test the application at your deployed URL

## Deployment to Railway

### 1. Connect Repository

1. Go to [Railway Dashboard](https://railway.app)
2. Click "New Project" → "Deploy from GitHub"
3. Select your repository
4. Railway will auto-detect Node.js project

### 2. Configure Environment Variables

In Railway project settings, add all variables from `.env.local.example`

### 3. Configure Build

Railway will auto-detect the build command. If needed, set:
- **Build Command:** `pnpm build`
- **Start Command:** `pnpm start`

### 4. Deploy

Railway will auto-deploy on push to main branch.

### 5. Post-Deployment

1. Get your Railway domain from project settings
2. Update Google OAuth redirect URI
3. Update Stripe webhook endpoint
4. Test the application

## Deployment to Render

### 1. Create Web Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the repository and branch

### 2. Configure Service

- **Name:** `late-escalate`
- **Environment:** `Node`
- **Build Command:** `pnpm build`
- **Start Command:** `pnpm start`
- **Plan:** Standard or higher (for background jobs)

### 3. Add Environment Variables

Add all variables from `.env.local.example` in the "Environment" section.

### 4. Deploy

Click "Create Web Service" and wait for deployment.

### 5. Post-Deployment

1. Get your Render domain from service settings
2. Update Google OAuth redirect URI
3. Update Stripe webhook endpoint
4. Test the application

## Custom Domain Setup

### For Vercel

1. Go to project settings → "Domains"
2. Add your custom domain
3. Update DNS records as instructed
4. Wait for SSL certificate

### For Railway

1. Go to project settings → "Domain"
2. Add custom domain
3. Update DNS records
4. SSL is automatic

### For Render

1. Go to service settings → "Custom Domain"
2. Add domain
3. Update DNS records
4. SSL is automatic

## Database Migrations in Production

If you need to run migrations in production:

1. **Supabase:** Use SQL Editor to run migrations
2. **Railway:** Connect to database and run migrations
3. **Render:** Use Render CLI or connect directly

## Monitoring

### Logs

- **Vercel:** View in Deployments → Logs
- **Railway:** View in Logs tab
- **Render:** View in Logs tab

### Errors

Check logs for:
- Database connection errors
- API key issues
- OAuth configuration problems
- Email sending failures

## Scaling

### Database

- Supabase: Upgrade plan for higher limits
- Railway: Upgrade database plan
- Render: Upgrade database plan

### Application

- Vercel: Auto-scales with usage
- Railway: Upgrade plan for more resources
- Render: Upgrade plan for more resources

## Backup & Recovery

### Database Backups

- **Supabase:** Automatic daily backups, manual backups available
- **Railway:** Managed backups
- **Render:** Managed backups

### Application Code

- Always push to GitHub before deploying
- Use GitHub releases for version control
- Keep `.env` files secure (never commit)

## Security Checklist

- [ ] All environment variables set correctly
- [ ] Database credentials are secure
- [ ] API keys are not exposed in code
- [ ] HTTPS is enabled
- [ ] CORS is configured correctly
- [ ] Rate limiting is in place
- [ ] Webhook signatures are verified
- [ ] OAuth redirects are whitelisted

## Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
vercel env pull
pnpm install
pnpm build
```

### Database Connection Error

- Verify DATABASE_URL is correct
- Check database is accessible from deployment region
- Ensure firewall allows connections

### OAuth Not Working

- Verify redirect URIs match exactly
- Check API keys are correct
- Ensure callback routes are accessible

### Email Not Sending

- Verify Gmail tokens are valid
- Check Claude API key
- Ensure Stripe webhook is configured

### Stripe Webhook Not Triggering

- Verify webhook endpoint URL is correct
- Check webhook secret matches
- Ensure endpoint is publicly accessible
- Test webhook in Stripe dashboard

## Performance Optimization

1. Enable caching for static assets
2. Use database connection pooling
3. Implement rate limiting
4. Optimize database queries
5. Use CDN for static files

## Support

For deployment issues, check:
- Platform-specific documentation
- GitHub Issues
- Deployment logs
- Error messages in application logs
