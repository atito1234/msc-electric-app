import { createClient } from '@supabase/supabase-js';

// Ensure these are in your .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    // We don't want to crash the app immediately during build/dev if envs are missing, 
    // but we should warn or handle it. For now, strict check is fine for migration.
    console.warn('Supabase URL or Key is missing from environment variables');
}

export const supabase = createClient(
    supabaseUrl || '',
    supabaseAnonKey || ''
);

export type UserRole = 'admin' | 'client' | 'employee' | 'subcontractor';

// Helper to get typed session user
export const getCurrentUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    // Fetch profile for role
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

    return profile; // Contains role, name, etc.
};
