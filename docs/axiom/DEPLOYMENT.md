# Axiom Deployment Checklist

## Overview

This document provides a comprehensive checklist for deploying the Axiom exam simulator system to production. Follow all sections in order to ensure a smooth deployment.

---

## Pre-Deployment Verification

### Code Quality
- [ ] All tests passing: `npm run test`
- [ ] Type checking passing: `npm run type-check`
- [ ] Build successful: `npm run build`
- [ ] No ESLint errors: `npm run lint`
- [ ] No console warnings or errors in development
- [ ] Code review approved by at least one other developer
- [ ] All TODOs and FIXMEs resolved (or documented as intentional)

### Git Status
- [ ] Current branch is up to date with `main`
- [ ] All changes committed (no uncommitted files)
- [ ] No merge conflicts
- [ ] Git history is clean and meaningful
- [ ] Commit messages follow conventional commits format

### Configuration
- [ ] All environment variables defined in `.env.local`
- [ ] `.env.local` added to `.gitignore` (never commit)
- [ ] All required API keys are valid and active
- [ ] Database connection string is correct
- [ ] CORS settings configured correctly

### Documentation
- [ ] README.md is up to date
- [ ] API documentation is complete
- [ ] Deployment guide is available
- [ ] Known issues are documented
- [ ] Rollback procedure is documented

---

## Required Environment Variables

Create a `.env.local` file with all required variables:

```env
# Next.js
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://axiom.umss.edu.bo

# AI Providers (Cascada)
GROQ_API_KEY=your_groq_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
OPENAI_API_KEY=your_openai_api_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Database
DATABASE_URL=your_database_connection_string

# Error Tracking (Optional)
SENTRY_DSN=your_sentry_dsn
SENTRY_AUTH_TOKEN=your_sentry_auth_token

# Analytics (Optional)
GOOGLE_ANALYTICS_ID=your_ga_id

# Email (Optional)
SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
SMTP_FROM=noreply@axiom.umss.edu.bo
```

---

## Database Preparation

- [ ] All migrations applied: `npx supabase migration deploy`
- [ ] Database backups created and tested
- [ ] Database indexes created for performance
- [ ] Database user roles configured correctly
- [ ] Row-level security (RLS) policies are in place
- [ ] Sample data loaded (if needed)

### Supabase Setup

```bash
# Install Supabase CLI
npm install -g supabase

# Link to project
supabase link --project-ref your-project-ref

# Apply migrations
supabase migration deploy

# Verify tables
supabase db push
```

---

## Deployment Steps

### Step 1: Push to GitHub
```bash
git checkout main
git pull origin main
git push origin main
```

### Step 2: Vercel Deployment
- [ ] Vercel project linked to GitHub repository
- [ ] Environment variables configured in Vercel dashboard
- [ ] Production deployment automatically triggered
- [ ] Deployment preview passed all checks

Monitor the deployment at: https://vercel.com

### Step 3: Domain Configuration
- [ ] DNS records configured correctly
- [ ] SSL certificate generated (auto with Vercel)
- [ ] Custom domain verified
- [ ] HTTPS redirect configured

### Step 4: Database Migration
```bash
# Run any pending migrations
npx supabase migration deploy

# Verify database schema
npx supabase db pull
```

### Step 5: Cache Invalidation
- [ ] Clear CDN cache
- [ ] Clear browser cache headers configured
- [ ] Cache-Control headers set appropriately

---

## Post-Deployment Verification

### Smoke Tests
- [ ] Website loads without errors (https://axiom.umss.edu.bo)
- [ ] Landing page renders correctly
- [ ] Navigation menu works
- [ ] All static assets load (images, CSS, fonts)
- [ ] No 404 errors in console

### Authentication
- [ ] Google OAuth flow works end-to-end
- [ ] User login successful
- [ ] JWT tokens generate correctly
- [ ] Session persistence works
- [ ] Logout clears session properly

### Core Features
- [ ] Create new exam simulator
- [ ] Generate exam questions
- [ ] Submit exam answers
- [ ] Calculate and display scores
- [ ] Generate personalized study plans
- [ ] Export results/PDF

### Rankings System
- [ ] User scores published to ranking
- [ ] Ranking display shows top 10 users
- [ ] Filtering and sorting works
- [ ] User profile rankings are accurate

### Email Notifications
- [ ] Welcome email sent to new users
- [ ] Score notification email sends after exam
- [ ] Study plan email sends correctly
- [ ] Email formatting is correct

### Error Handling
- [ ] 404 page displays correctly
- [ ] 500 error page displays correctly
- [ ] API errors return proper status codes
- [ ] Client errors show friendly messages
- [ ] Error logs are being captured

### Performance
- [ ] Page load time is acceptable (<3s)
- [ ] Largest Contentful Paint (LCP) < 2.5s
- [ ] Cumulative Layout Shift (CLS) < 0.1
- [ ] Time to Interactive (TTI) < 3.5s
- [ ] No JavaScript errors in console

### Security
- [ ] HTTPS is enforced
- [ ] Security headers are set correctly
- [ ] CORS policies are restrictive
- [ ] API keys are not exposed in client code
- [ ] SQL injection attempts are blocked
- [ ] XSS protection is active

### Analytics
- [ ] Google Analytics is tracking events
- [ ] User signups are being tracked
- [ ] Feature usage is being tracked
- [ ] Conversion funnel is working

---

## Monitoring & Logging

### Set Up Monitoring
- [ ] Sentry error tracking active
- [ ] Health check endpoint configured
- [ ] Uptime monitoring active
- [ ] Performance metrics being collected
- [ ] Database query performance monitored

### Log Aggregation
```bash
# Vercel provides logs at:
# https://vercel.com/your-project/deployments

# Or use Sentry for application errors:
# https://sentry.io/organizations/your-org/
```

### Create Alerts
- [ ] Email alert for deployment failures
- [ ] Alert for high error rates (>1%)
- [ ] Alert for slow response times (>5s)
- [ ] Alert for database connection failures
- [ ] Alert for API quota limits

---

## Rollback Plan

If critical issues are found in production:

### Immediate Rollback (< 5 minutes)
```bash
# On Vercel dashboard:
# 1. Navigate to Deployments
# 2. Find the previous stable deployment
# 3. Click "Promote to Production"
# 4. Verify the rollback succeeded
```

### Manual Rollback
```bash
git revert <commit-hash>
git push origin main
# Vercel will auto-deploy the reverted commit
```

### Communication
- [ ] Notify all stakeholders of the issue
- [ ] Update status page
- [ ] Create incident report
- [ ] Schedule post-mortem

---

## Post-Deployment Tasks (24-48 hours)

### Monitoring
- [ ] Review error logs for anomalies
- [ ] Check user feedback and support tickets
- [ ] Monitor database performance
- [ ] Review API response times
- [ ] Check file storage usage

### User Communication
- [ ] Send announcement of new features
- [ ] Share feedback form with users
- [ ] Monitor social media for mentions
- [ ] Respond to user questions

### Documentation Update
- [ ] Update user guide with new features
- [ ] Update API documentation
- [ ] Update status page
- [ ] Create release notes

### Team Debriefing
- [ ] Conduct post-deployment review
- [ ] Document lessons learned
- [ ] Update deployment procedures
- [ ] Plan for improvements

---

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Lighthouse Score | ≥90 | TBD |
| Page Load Time | <3s | TBD |
| Largest Contentful Paint | <2.5s | TBD |
| Cumulative Layout Shift | <0.1 | TBD |
| Time to Interactive | <3.5s | TBD |
| Server Response Time | <200ms | TBD |
| Error Rate | <0.5% | TBD |
| Uptime | 99.9% | TBD |

---

## Common Issues & Solutions

### Issue: Database Connection Timeout
**Solution:**
- Check `DATABASE_URL` is correct
- Verify database is running
- Check network connectivity
- Review database query logs

### Issue: Missing Environment Variables
**Solution:**
- Verify all `.env.local` variables are set
- Check Vercel environment variables match local
- Restart application after changes
- Review logs for specific missing variables

### Issue: Slow Page Loads
**Solution:**
- Check database query performance
- Review bundle size
- Enable compression
- Implement caching
- Optimize images

### Issue: API Rate Limiting
**Solution:**
- Check AI provider quota limits
- Implement request throttling
- Add backoff strategy
- Monitor API usage
- Upgrade API plan if needed

---

## Support & Escalation

For deployment issues, contact:

- **Technical Lead:** rnd261190@gmail.com
- **DevOps Team:** devops@axiom.umss.edu.bo
- **On-Call Support:** Check Slack channel #axiom-support

---

## Sign-Off

- **Deployed By:** ________________
- **Date:** ________________
- **Verified By:** ________________
- **Date:** ________________

---

**Last Updated:** 2026-05-07
**Status:** Ready for Production
