const { createClient } = require('redis');

const client = createClient({
  url: 'rediss://default:gQAAAAAAAXqQAAIgcDJhMTdmMzJkMGU4NzY0N2M4YTlmOTY2MjExZmM3NzI2Mg@driven-catfish-96912.upstash.io:6379'
});

async function main() {
  await client.connect();
  console.log('Connected to Redis');

  const keys = await client.keys('blog*');
  console.log('Deleting blog cache keys:', keys.length);

  if (keys.length > 0) {
    await client.del(keys);
  }

  console.log('✅ Redis blog cache cleared!');
  await client.quit();
}

main().catch(console.error);
