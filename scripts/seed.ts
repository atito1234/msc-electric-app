import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env file
dotenv.config({ path: resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY; // Using anon key for client-simulated seeding

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const DEMO_USERS = [
    { role: 'admin', email: 'admin@mscelectric.io', password: 'admin123', name: 'Admin User', hourly_rate: 0 },
    { role: 'client', email: 'johnson.family@email.com', password: 'client123', name: 'Michael Johnson', hourly_rate: 0 },
    { role: 'employee', email: 'carlos.martinez@mscelectric.com', password: 'employee123', name: 'Carlos Martinez', hourly_rate: 85 },
    { role: 'subcontractor', email: 'juan.rodriguez@jrelectric.com', password: 'sub123', name: 'Juan Rodriguez', hourly_rate: 75 }
];

async function seed() {
    console.log('Starting DB Seed...');
    const userIds: Record<string, string> = {};

    for (const user of DEMO_USERS) {
        console.log(`Processing ${user.role} (${user.email})...`);

        // 1. SignUp
        const { data, error } = await supabase.auth.signUp({
            email: user.email,
            password: user.password,
            options: {
                data: {
                    name: user.name,
                    role: user.role,
                }
            }
        });

        if (error) {
            console.warn(`  Signup msg: ${error.message}`);
            // Try SignIn
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: user.password
            });

            if (signInError) {
                console.error(`  SignIn failed: ${signInError.message}`);
                continue;
            }

            if (signInData.user) {
                userIds[user.role] = signInData.user.id;
                console.log(`  Logged in as existing user: ${signInData.user.id}`);
            }
        } else if (data.user) {
            if (!data.session) {
                console.error(`  ERROR: User created but session missing. "Confirm Email" might be enabled in Supabase.`);
            }
            userIds[user.role] = data.user.id;
            console.log(`  Created new user: ${data.user.id}`);
        }

        // 2. Profile (Upsert)
        if (userIds[user.role]) {
            const { error: profileError } = await supabase.from('profiles').upsert({
                id: userIds[user.role],
                email: user.email,
                name: user.name,
                role: user.role,
                hourly_rate: user.hourly_rate,
                is_active: true,
                created_at: new Date().toISOString()
            });
            if (profileError) console.error(`  Profile update failed: ${profileError.message}`);
            else console.log(`  Profile updated.`);
        }

        // Sign out to clean state
        await supabase.auth.signOut();
    }

    // 3. Projects (Requires Client & Employee/Sub IDs to be valid)
    if (userIds['client']) {
        console.log('Seeding Projects...');
        // We need to login as *somebody* who can write projects. 
        // If RLS allows Authenticated users to INSERT projects (which it likely does for this demo), any user works.
        // But typically Admin creates projects.
        if (userIds['admin']) {
            await supabase.auth.signInWithPassword({ email: DEMO_USERS[0].email, password: DEMO_USERS[0].password });
        }

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
                estimated_value: 2500,
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
