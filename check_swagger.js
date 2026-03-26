import fs from 'fs';
const envFile = fs.readFileSync('.env', 'utf8');
const url = envFile.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
const key = envFile.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim();

fetch(`${url}/rest/v1/?apikey=${key}`).then(r => r.json()).then(data => {
  const projects = data.definitions.projects.properties;
  console.log(Object.keys(projects).join('\n'));
});
