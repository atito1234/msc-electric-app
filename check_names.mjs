import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function check() {
  const email = 'antonio.j.tito@gmail.com';
  console.log("Checking leads and profiles for:", email);
  
  const { data: profile } = await supabase.from('profiles').select('*').eq('email', email);
  console.log("Profile:", profile);
  
  const { data: leads } = await supabase.from('leads').select('name').eq('email', email);
  console.log("Leads names:", leads.map(l => l.name));
}
check();
