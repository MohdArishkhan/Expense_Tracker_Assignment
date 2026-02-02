# Deployment Guide

This guide provides instructions for deploying the Personal Expense Tracker Backend to production.

## Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] MongoDB Atlas cluster created and accessible
- [ ] API thoroughly tested locally
- [ ] Git commits clean and meaningful
- [ ] Documentation updated
- [ ] Security headers verified
- [ ] CORS configuration verified

## Environment Variables

Create a `.env` file with the following variables:

```env
# Application
NODE_ENV=production
PORT=5000
HOST=0.0.0.0

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/expense-tracker?retryWrites=true&w=majority

# API
API_VERSION=v1
LOG_LEVEL=info

# CORS
CORS_ORIGIN=https://yourdomain.com
```

## MongoDB Atlas Setup

1. Create a cluster on MongoDB Atlas
2. Create a database user with appropriate permissions
3. Whitelist production IP addresses
4. Get connection string and add to environment variables

## Deployment Options

### Option 1: Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Add MongoDB Atlas connection
heroku config:set MONGODB_URI="your_connection_string"

# Deploy
git push heroku main
```

### Option 2: Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables
vercel env add MONGODB_URI
```

### Option 3: AWS Lambda

```bash
# Install Serverless
npm install -g serverless

# Configure AWS credentials
serverless config credentials --provider aws

# Deploy
serverless deploy
```

### Option 4: DigitalOcean App Platform

1. Push code to GitHub
2. Connect GitHub to DigitalOcean
3. Create new app from repository
4. Set environment variables
5. Deploy

### Option 5: Docker

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

EXPOSE 5000

CMD ["node", "dist/index.js"]
```

Build and push:

```bash
docker build -t expense-tracker:latest .
docker push your-registry/expense-tracker:latest
```

## Build for Production

```bash
# Install dependencies
npm install

# Type check
npm run type-check

# Build
npm run build

# Test production build locally
npm start
```

## Performance Optimization

### Database Optimization
- Enable database profiling in MongoDB Atlas
- Create appropriate indexes (already configured in schemas)
- Monitor slow queries

### Application Optimization
- Use compression middleware for responses
- Rate limiting implemented for API endpoints
- Cache frequently accessed data
- Monitor response times

### Infrastructure Optimization
- Use CDN for static assets
- Configure load balancing
- Use database replication for high availability
- Monitor server resources

## Monitoring & Logging

### Application Monitoring
- Monitor error rates
- Track API response times
- Monitor database query performance
- Set up alerts for errors

### Recommended Services
- **Error Tracking**: Sentry, Rollbar
- **Monitoring**: Datadog, New Relic
- **Logging**: LogRocket, ELK Stack

### Health Checks

Configure health checks to ping:
```
GET /api/v1/health
```

## Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **Database**: Use MongoDB Atlas IP whitelisting
3. **API Keys**: Rotate regularly
4. **HTTPS**: Always use HTTPS in production
5. **CORS**: Restrict to known domains
6. **Rate Limiting**: Implemented per IP (100 requests per 15 minutes)
7. **Input Validation**: Already implemented
8. **SQL Injection**: MongoDB injection prevention in place

## Scaling Strategies

### Horizontal Scaling
- Run multiple instances behind load balancer
- Use sticky sessions if needed
- Distribute across multiple regions

### Vertical Scaling
- Increase server resources (CPU, RAM)
- Optimize database queries
- Implement caching

### Database Scaling
- Enable sharding for large datasets
- Use read replicas for read-heavy workloads
- Implement connection pooling

## Database Backup

### MongoDB Atlas Backup
1. Enable automated backups in MongoDB Atlas
2. Configure backup retention policy
3. Test restore procedures regularly
4. Set up restore alerts

### Manual Backup
```bash
mongodump --uri "mongodb+srv://user:password@cluster.mongodb.net/expense-tracker"
```

## Rollback Procedure

1. Keep previous version deployed
2. Maintain database migration history
3. Test rollback procedures
4. Have rollback script ready
5. Document breaking changes

## CI/CD Setup

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm run build
      - name: Deploy to Vercel
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
        run: vercel --prod --token $VERCEL_TOKEN
```

## Post-Deployment

1. **Verify Deployment**
   ```bash
   curl https://your-production-api.com/api/v1/health
   ```

2. **Test Endpoints**
   - Test all critical endpoints
   - Verify database connectivity
   - Check error handling

3. **Monitor Logs**
   - Monitor application logs
   - Watch for errors
   - Track performance metrics

4. **User Communication**
   - Notify users of deployment
   - Provide API status page
   - Document any changes

## Troubleshooting

### Application Won't Start
- Check environment variables
- Verify MongoDB connection
- Check logs for errors
- Verify Node.js version compatibility

### Database Connection Issues
- Verify MongoDB URI
- Check IP whitelisting in MongoDB Atlas
- Verify database user credentials
- Check network connectivity

### Performance Issues
- Monitor database queries
- Check API response times
- Review error logs
- Optimize slow endpoints

## Support

For deployment issues, check:
- Application logs
- MongoDB Atlas logs
- Environment variable configuration
- Network connectivity
- Database permissions

## Resources

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Express.js Production Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [Node.js Deployment Checklist](https://nodejs.org/en/docs/guides/nodejs-web-application-architecture/)
