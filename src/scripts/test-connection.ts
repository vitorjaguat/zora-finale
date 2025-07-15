import dotenv from "dotenv";
import postgres from "postgres";

// Load environment variables
dotenv.config({ path: ".env.local", override: true });

async function testConnection() {
  try {
    console.log("Testing Neon connection...");
    console.log("DATABASE_URL:", process.env.DATABASE_URL);

    const connectionString = process.env.DATABASE_URL!;

    // Test connection with minimal config
    const client = postgres(connectionString, {
      max: 1,
      ssl: connectionString.includes("sslmode=require") ? "require" : false,
      connect_timeout: 60,
      idle_timeout: 60,
    });

    console.log("Attempting to connect...");
    const result = await client`SELECT 1 as test`;
    console.log("Connection successful:", result);

    // Test if tables exist
    const tables = await client`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log("Available tables:", tables.length, "tables found");

    await client.end();
    console.log("Connection test completed successfully!");
  } catch (error) {
    console.error("Connection test failed:", error);
    throw error;
  }
}

testConnection().catch(console.error);
