#!/usr/bin/env node

/**
 * Production deployment script for Vercel
 * This script ensures the database is properly set up after deployment
 */

import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

async function deployToProduction() {
  console.log("🚀 Starting production deployment...");

  const shouldSeed = process.argv.includes("--seed");

  try {
    // Step 1: Apply migrations (safe to run multiple times)
    console.log("📦 Applying database migrations...");
    await execAsync("npm run db:migrate");
    console.log("✅ Migrations applied successfully");

    // Step 2: Seed database (ONLY if explicitly requested)
    if (shouldSeed) {
      console.log("🌱 Seeding database (--seed flag provided)...");
      console.log("⚠️  WARNING: This will clear existing data!");
      await execAsync("npm run db:seed");
      console.log("✅ Database seeded successfully");
    } else {
      console.log("⏭️  Skipping database seeding (use --seed flag to force)");
    }

    // Step 3: Test database connection
    console.log("🔍 Testing database connection...");
    await execAsync("npm run db:test");
    console.log("✅ Database test passed");

    console.log("🎉 Production deployment completed successfully!");
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

deployToProduction();
