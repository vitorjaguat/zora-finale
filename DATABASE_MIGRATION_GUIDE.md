# Database Migration & Deployment Guide

## Overview

This project has been successfully migrated from a static JSON database to a dynamic PostgreSQL database using Drizzle ORM. The database is hosted on Neon and can be deployed to Vercel with minimal configuration.

## Database Schema

The database uses the following tables:

- `auctions`: Main auction data stored as JSONB with metadata
- `auction_token_owners`: Relationship table for token owner lookups
- `auction_curators`: Relationship table for curator lookups
- `auction_bidders`: Relationship table for bidder lookups

## Local Development Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Neon Postgres database (or any PostgreSQL database)

### Environment Variables

Create a `.env.local` file with:

```bash
DATABASE_URL="postgres://username:password@host:port/database?sslmode=require"
```

**⚠️ SECURITY IMPORTANT:**

- Never commit `.env.local` to git (it's already in `.gitignore`)
- Use `.env.example` as a template
- Store actual credentials securely (password managers, Vercel dashboard, etc.)
- Never put credentials in `package.json` or other committed files

### Database Setup

1. **Generate migrations** (if schema changes):

   ```bash
   npm run db:generate
   ```

2. **Apply migrations** (create tables):

   ```bash
   npm run db:migrate
   ```

3. **Seed the database** (populate with auction data):

   ```bash
   npm run db:seed
   ```

4. **Test the database**:
   ```bash
   npm run db:test
   npm run db:connection
   ```

## Production Deployment (Vercel)

### Step 1: Connect Database to Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add your Neon database URL as `DATABASE_URL`

### Step 2: Deploy

1. Push your code to GitHub/GitLab/Bitbucket
2. Vercel will automatically deploy
3. The database connection will work automatically

### Step 3: Database Setup (ONE-TIME ONLY)

**⚠️ IMPORTANT**: Only run this ONCE when you first deploy to production!

#### Initial Setup (First Deployment):

```bash
# For the very first deployment, run migrations and seed the database
npm run deploy:initial
```

#### Regular Deployments:

```bash
# For all subsequent deployments, only run migrations (no seeding)
npm run deploy:production
```

**Why this matters:**

- Your Neon database persists across deployments
- Seeding will **clear all existing data** and reload from the JSON file
- Once seeded, the database will maintain its state even when you deploy updates
- Only run seeding again if you need to reset the database to the original state

## API Endpoints

### Address Lookup

- **URL**: `/api/auctions/address-lookup`
- **Method**: GET
- **Query**: `?address=0x...`
- **Response**: CheckResult interface with auction data

### NFT Metadata

- **URL**: `/api/nft/metadata`
- **Method**: GET
- **Query**: `?contract=0x...&tokenId=123`
- **Response**: NFT metadata

## Database Persistence

### Important Notes:

- **Database persists across deployments**: Your Neon database is separate from your Vercel app
- **Seeding is destructive**: The `db:seed` command will clear all existing data
- **One-time setup**: Once seeded, the database will maintain state across deployments
- **Migrations are safe**: Running migrations multiple times is safe (idempotent)

### Deployment Scenarios:

1. **First deployment** → Use `npm run deploy:initial` (includes seeding)
2. **Regular deployments** → Use `npm run deploy:production` (migrations only)
3. **Schema changes** → Add new migrations with `npm run db:generate`
4. **Data reset needed** → Manually run `npm run db:seed` (destructive!)

### Available Scripts

- `npm run db:generate` - Generate new migrations
- `npm run db:migrate` - Apply migrations to database
- `npm run db:seed` - Seed database with auction data
- `npm run db:test` - Test database connection and data
- `npm run db:connection` - Simple connection test
- `npm run db:studio` - Open Drizzle Studio (database GUI)

### Manual Database Operations

```javascript
// Example: Query auctions by address
import { db } from "@/lib/db";
import { auctions, auctionTokenOwners } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// Find auctions where address is token owner
const results = await db
  .select()
  .from(auctions)
  .innerJoin(auctionTokenOwners, eq(auctions.id, auctionTokenOwners.auctionId))
  .where(eq(auctionTokenOwners.ownerAddress, address));
```

## Performance Considerations

### Database Indexes

The schema includes indexes on:

- `auction_token_owners.owner_address`
- `auction_curators.curator_address`
- `auction_bidders.bidder_address`

### Connection Pooling

The database connection is configured with:

- Max connections: 5 (dev) / 20 (prod)
- Connection timeout: 60s
- Idle timeout: 60s
- Max lifetime: 30 minutes

## Troubleshooting

### Common Issues

1. **Environment Variables Not Loading**
   - Ensure `.env.local` is in project root
   - Check that `DATABASE_URL` is properly set
   - For scripts, you may need to set the variable explicitly

2. **SSL Connection Issues**
   - Ensure connection string includes `?sslmode=require`
   - For local development, you may need to adjust SSL settings

3. **Migration Failures**
   - Check that database credentials are correct
   - Ensure database exists and is accessible
   - Verify network connectivity to Neon

4. **Seeding Issues**
   - Ensure migrations have been applied first
   - Check that `auctions.json` file exists and is valid
   - Verify that auction data includes required fields

### Database Connection Test

```bash
# Test basic connection
npm run db:connection

# Test full database functionality
npm run db:test
```

## Monitoring & Maintenance

### Database Monitoring

- Monitor connection pool usage
- Track query performance
- Set up alerts for connection failures

### Data Backup

- Neon provides automatic backups
- Consider periodic exports for critical data
- Test restore procedures

### Updates

- Keep Drizzle ORM updated
- Monitor database performance
- Update connection pool settings as needed

## Migration Notes

### Changes Made

1. **Schema Design**: Created optimized schema with relationship tables
2. **API Compatibility**: Maintained existing API interfaces
3. **Performance**: Added strategic indexes for common queries
4. **Error Handling**: Robust connection and error handling
5. **Environment**: Configured for both development and production

### Data Migration

- All 3,061 auctions migrated successfully
- Relationship tables populated with 3,061 token owners, 368 curators, and 158 bidders
- Added `isSettled: false` to all auctions for dynamic tracking

### Backward Compatibility

- All existing API endpoints continue to work
- React hooks maintain same interfaces
- No breaking changes to frontend code
