# Vercel Deployment Guide

## Important Notes for Vercel Deployment

### 1. File Uploads
**WARNING**: Vercel's serverless functions have a read-only filesystem except for `/tmp`. Files uploaded to `/tmp` are:
- Temporary and will be deleted after the function execution
- Not shared between function invocations
- Limited to 512MB

**Recommended Solution**: Use **Vercel Blob** for file storage in production.

To migrate to Vercel Blob:
1. Install: `npm install @vercel/blob`
2. Update multer configuration to upload to Vercel Blob instead of local filesystem
3. Update image URLs to use Blob URLs

Learn more: https://vercel.com/docs/storage/vercel-blob

### 2. Environment Variables
Make sure to set these in your Vercel project settings:

**Required:**
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT tokens
- `CRON_SECRET` - Secret for cron job authentication (generate a random string)

**Optional:**
- `REDIS_URL` - Redis connection string (for caching)
- `ALLOWED_ORIGINS` - Comma-separated list of allowed CORS origins
- `DASHBOARD_URL` - Dashboard URL
- `WEBSITE_URL` - Website URL

### 3. Cron Jobs
The following cron jobs need to be configured in Vercel:

1. **Clean Expired OTPs** - Runs every hour
   - Path: `/api/cron/clean-otps`
   - Schedule: `0 * * * *`

2. **Update Ads Status** - Runs every 30 minutes
   - Path: `/api/cron/update-ads`
   - Schedule: `*/30 * * * *`

Configure these in your Vercel project settings under "Cron Jobs" or use the `vercel-cron.json` file.

### 4. Database Connection
The database connection pool is optimized for serverless with:
- Max 1 connection per function
- Short idle timeout (10s)
- Connection timeout (5s)

Make sure your PostgreSQL database supports enough concurrent connections for your expected traffic.

### 5. Redis (Optional)
If using Redis for caching, make sure to use a service that supports serverless connections like:
- Upstash Redis (recommended for Vercel)
- Redis Labs

### 6. Deployment Steps

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy!

### 7. Testing Locally

To test the serverless function locally:
\`\`\`bash
npm install -g vercel
vercel dev
\`\`\`

This will start a local development server that mimics Vercel's serverless environment.
