import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const supabaseAdmin = createClient(
            process.env.VITE_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        const { name, email, role = 'client', password } = req.body;

        // Generate a placeholder email if missing to satisfy Supabase Auth
        const finalEmail = email || `no-email-${Date.now()}@mscelectric.io`;
        const finalPassword = password || `${Math.random().toString(36).slice(-8)}A1!`;

        // Create the User in auth.users
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: finalEmail,
            password: finalPassword,
            email_confirm: true,
            user_metadata: { name, role }
        });

        if (authError) {
            console.error('Auth Error:', authError.message);
            return res.status(400).json({ error: authError.message });
        }

        const userId = authData.user.id;

        // Insert into profiles (must match auth.users ID)
        const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
            id: userId,
            name,
            email: finalEmail,
            role,
            is_active: true
        });

        if (profileError) {
            console.error('Profile Error:', profileError.message);
            return res.status(400).json({ error: profileError.message });
        }

        return res.status(200).json({
            user: {
                id: userId,
                name,
                email: finalEmail,
                role
            }
        });
    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
