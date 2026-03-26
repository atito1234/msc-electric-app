import fs from 'fs';
const envFile = fs.readFileSync('.env', 'utf8');
const url = envFile.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
const key = envFile.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim();

fetch(`${url}/rest/v1/?apikey=${key}`).then(r => r.json()).then(data => {
  const t = data.definitions;
  console.log("INVOICES:", Object.keys(t.invoices?.properties || {}).join(', '));
  console.log("PROFILES:", Object.keys(t.profiles?.properties || {}).join(', '));
  console.log("LEADS:", Object.keys(t.leads?.properties || {}).join(', '));
  console.log("CONTRACTS:", Object.keys(t.contracts?.properties || {}).join(', '));
});
