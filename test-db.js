const { Client } = require('pg');

const testConnection = async (port) => {
  const connectionString = `postgresql://postgres.cblfpfsvavahttedfloe:TT%23fe6qc3%29%5EUzF.@aws-1-us-east-2.pooler.supabase.com:${port}/postgres`;
  const client = new Client({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    console.log(`Attempting connection to ${port}...`);
    await client.connect();
    console.log(`Connection to ${port} successful!`);
    
    const res = await client.query('SELECT NOW()');
    console.log("Query result:", res.rows[0]);
    
    await client.end();
  } catch (err) {
    console.error(`Connection error to ${port}:`, err.message);
  }
};

(async () => {
  await testConnection(5432);
  await testConnection(6543);
})();
