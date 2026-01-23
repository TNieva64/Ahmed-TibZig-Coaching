/**
 * Script pour appeler le routeur demo via HTTP
 */

const DEMO_URL = 'http://localhost:3000/api/trpc/demo.createDemoClient';

async function main() {
  console.log('🚀 Calling demo.createDemoClient...\n');

  try {
    const response = await fetch(DEMO_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Demo client created successfully!\n');
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
