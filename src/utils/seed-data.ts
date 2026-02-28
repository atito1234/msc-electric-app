import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// Demo credentials must match UnifiedLogin.tsx
const DEMO_USERS = [
    { role: 'admin', email: 'admin@mscelectric.io', password: 'admin123', name: 'Admin User', hourly_rate: 0 },
    { role: 'client', email: 'johnson.family@email.com', password: 'client123', name: 'Michael Johnson', hourly_rate: 0 },
    { role: 'employee', email: 'carlos.martinez@mscelectric.com', password: 'employee123', name: 'Carlos Martinez', hourly_rate: 85 },
    { role: 'subcontractor', email: 'juan.rodriguez@jrelectric.com', password: 'sub123', name: 'Juan Rodriguez', hourly_rate: 75 },
    { role: 'gc', email: 'builder@apexconstruction.com', password: 'gc123', name: 'Apex Construction', hourly_rate: 0 }
];

export const seedSupabase = async () => {
    try {
        const userIds: Record<string, string> = {};

        // 1. Create Users (Sequentially to manage session switching)
        for (const user of DEMO_USERS) {
            // Sign up (or sign in if already exists and auto-confirm is on)
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
                console.warn(`Error signing up ${user.role}:`, error.message);
                // Try signing in if sign up failed (e.g. already exists)
                const { data: signInData } = await supabase.auth.signInWithPassword({
                    email: user.email,
                    password: user.password
                });

                if (signInData.user) {
                    userIds[user.role] = signInData.user.id;
                }
            } else if (data.user) {
                userIds[user.role] = data.user.id;
            }

            // Create/Update Profile
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

                if (profileError) {
                    console.error(`Profile error for ${user.role}:`, profileError);
                }
            }

            // Sign out to prepare for next user
            await supabase.auth.signOut();
        }

        // 2. Re-login as Admin to insert shared data (Projects, etc.)
        // Admin usually has RLS policies to write data
        const adminCreds = DEMO_USERS.find(u => u.role === 'admin')!;
        const { error: loginError } = await supabase.auth.signInWithPassword({
            email: adminCreds.email,
            password: adminCreds.password
        });

        if (loginError) throw new Error('Failed to login as admin for seeding data');

        if (!userIds['client']) throw new Error('Client user not created, cannot seed projects');

        // 3. Seed Projects
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
                address: { street: '123 Oak Street', city: 'Austin', state: 'TX', zip: '78701' },
                estimated_value: 4500,
                assigned_electricians: [],
                assigned_subcontractors: userIds['subcontractor'] ? [userIds['subcontractor']] : [],
                updated_at: new Date().toISOString()
            }
        ]);

        if (projectError) throw projectError;

        toast.success('Database seeded successfully! You can now log in.');

        // Final Sign Out so user sees login screen fresh
        await supabase.auth.signOut();

    } catch (error: any) {
        console.error('Seeding error:', error);
        toast.error('Seeding failed: ' + error.message);
    }
};
