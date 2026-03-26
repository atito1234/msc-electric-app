import fs from 'fs';
const envFile = fs.readFileSync('.env', 'utf8');
const url = envFile.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
const key = envFile.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim();

fetch(`${url}/rest/v1/projects?select=*&limit=1`, {
  headers: { apikey: key, 'Authorization': `Bearer ${key}` }
}).then(r => r.json()).then(data => {
  if (data.length > 0) console.log(Object.keys(data[0]).join('\n'));
  else console.log('No rows returned, cannot infer schema precisely without openapi.json. Fetching swagger...');
});
