import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');

let envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, val] = line.split('=');
    if (key && val) env[key.trim()] = val.trim();
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function resetPassword() {
    const emailToReset = 'admin@mscelectric.io';
    const newPassword = 'admin123';

    console.log(`Looking up user: ${emailToReset}`);

    // We fetch all users
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    if (error) {
        console.error('Error listing users:', error);
        return;
    }

    const user = users.find(u => u.email === emailToReset);
    if (!user) {
        console.log(`User ${emailToReset} not found.`);
        return;
    }

    console.log(`Found user ID: ${user.id}. Resetting password...`);
    const { data, error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
        password: newPassword,
        user_metadata: { role: 'admin' }
    });

    if (updateError) {
        console.error('Failed to update password:', updateError);
    } else {
        console.log(`Password for ${emailToReset} successfully reset to ${newPassword}`);
    }
}

resetPassword().catch(console.error);
