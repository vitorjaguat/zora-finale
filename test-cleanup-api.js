// Test the bid cleanup API endpoint
async function testCleanupAPI() {
  try {
    console.log("Testing bid cleanup API endpoint...");

    const testData = {
      tokenId: "test-token",
      bidder: "0x1234567890abcdef1234567890abcdef12345678",
      transactionHash:
        "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    };

    const response = await fetch("http://localhost:3000/api/bids/cleanup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();
    console.log("Response status:", response.status);
    console.log("Response body:", result);
  } catch (error) {
    console.error("Error testing cleanup API:", error);
  }
}

void testCleanupAPI();
