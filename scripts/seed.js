import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

// Get current directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env manually
const envPath = path.resolve(__dirname, '../.env');
console.log(`Reading .env from ${envPath}`);

let envContent = '';
try {
    envContent = fs.readFileSync(envPath, 'utf-8');
} catch (e) {
    console.error('Could not find .env file in parent directory');
    process.exit(1);
}

const env = {};
envContent.split('\n').forEach(line => {
    const [key, val] = line.split('=');
    if (key && val) env[key.trim()] = val.trim();
});

const supabaseUrl = env.VITE_SUPABASE_URL;
// Priority: Service Role > Anon Key
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY;
const isServiceRole = !!env.SUPABASE_SERVICE_ROLE_KEY;

if (isServiceRole) {
    console.log('Using SUPABASE_SERVICE_ROLE_KEY (Admin Mode)');
} else {
    console.log('Using VITE_SUPABASE_ANON_KEY (Client Mode - Rate Limits apply)');
}

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const DEMO_USERS = [
    { role: 'admin', email: 'admin@mscelectric.io', password: 'admin123', name: 'Admin User', hourly_rate: 0 },
    { role: 'client', email: 'johnson.family@email.com', password: 'client123', name: 'Michael Johnson', hourly_rate: 0 },
    { role: 'employee', email: 'carlos.martinez@mscelectric.com', password: 'employee123', name: 'Carlos Martinez', hourly_rate: 85 },
    { role: 'subcontractor', email: 'juan.rodriguez@jrelectric.com', password: 'sub123', name: 'Juan Rodriguez', hourly_rate: 75 }
];

async function seed() {
    console.log('Starting DB Seed...');
    const userIds = {};

    for (const user of DEMO_USERS) {
        console.log(`Processing ${user.role} (${user.email})...`);

        let userId = null;

        if (isServiceRole) {
            // --- ADMIN MODE: Bypass Rate Limits & Confirmation ---

            // 1. Try to create user directly
            const { data, error } = await supabase.auth.admin.createUser({
                email: user.email,
                password: user.password,
                email_confirm: true, // Auto-confirm
                user_metadata: {
                    name: user.name,
                    role: user.role
                }
            });

            if (error) {
                console.warn(`  Admin Create msg: ${error.message}`);
                // If user already exists, we need to get their ID. 
                // We can't query auth.users easily without a listUsers call (paginated).
                // Easiest backup is to try to SignIn to get the ID.
                const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                    email: user.email,
                    password: user.password
                });

                if (signInData.user) {
                    userId = signInData.user.id;
                    console.log(`  Resolved existing user ID via login: ${userId}`);
                } else if (signInError) {
                    console.error(`  Could not resolve ID for existing user: ${signInError.message}`);
                }
            } else if (data.user) {
                userId = data.user.id;
                console.log(`  Created new user (verified): ${userId}`);
            }

        } else {
            // --- CLIENT MODE: Rate Limits apply ---
            const { data, error } = await supabase.auth.signUp({
                email: user.email,
                password: user.password,
                options: {
                    data: { name: user.name, role: user.role }
                }
            });

            if (error) {
                console.warn(`  Signup msg: ${error.message}`);
                const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                    email: user.email,
                    password: user.password
                });
                if (signInData.user) userId = signInData.user.id;
            } else if (data.user) {
                if (!data.session) console.warn(`  Warning: Session missing. Email confirmation might be required.`);
                userId = data.user.id;
            }
        }

        if (userId) {
            userIds[user.role] = userId;

            // 2. Profile (Upsert) using the resolved userId
            const { error: profileError } = await supabase.from('profiles').upsert({
                id: userId,
                email: user.email,
                name: user.name,
                role: user.role,
                hourly_rate: user.hourly_rate,
                // is_active: true, // Removed to match current schema
                created_at: new Date().toISOString()
            });

            if (profileError) console.error(`  Profile error: ${profileError.message}`);
            else console.log(`  Profile synced.`);

        } else {
            console.error(`  SKIPPING data for ${user.role} - no ID resolved.`);
        }
    }

    // 3. Projects (Requires Client & Employee/Sub IDs to be valid)
    if (userIds['client']) {
        console.log('Seeding Projects...');
        // If we are Service Role, we might bypass RLS on INSERT if policies allow, 
        // or we can just insert directly if strict RLS isn't blocking the service role (Service role bypasses RLS by default in Supabase client usually, unless configured otherwise).
        // Actually, supabase-js admin client bypasses RLS if used correctly, but here we initiated one client.
        // Service Role Key client bypasses RLS.

        const { error: projectError } = await supabase.from('projects').upsert([
            {
                client_id: userIds['client'],
                name: 'Johnson Residence - Full Upgrade',
                description: 'Complete electrical panel upgrade and smart home integration.',
                status: 'in-progress',
                address: { street: '123 Oak Street', city: 'Austin', state: 'TX', zip: '78701' },
                estimated_value: 18500,
                assigned_electricians: userIds['employee'] ? [userIds['employee']] : [],
                assigned_subcontractors: [],
                updated_at: new Date().toISOString()
            },
            {
                client_id: userIds['client'],
                name: 'Backyard Landscape Lighting',
                description: 'Install LED landscape lighting system.',
                status: 'pending',
                address: { street: '456 Oak Dr', city: 'Austin', state: 'TX', zip: '78702' },
                estimated_value: 4500,
                assigned_electricians: [],
                assigned_subcontractors: userIds['subcontractor'] ? [userIds['subcontractor']] : [],
                updated_at: new Date().toISOString()
            }
        ]);

        if (projectError) console.error(`Project seed failed: ${projectError.message}`);
        else console.log('Projects seeded successfully.');
    }

    console.log('Seeding complete.');
}

seed().catch(console.error);
