// @ts-nocheck
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '' // Need admin powers to create users
        )

        const payload = await req.json()
        const { name, email, phone, address, serviceType, complexity, description, preferredTime } = payload

        console.log(`Processing new contact request from: ${email || name}`)

        // 1. Save the Lead to the database
        const { data: leadData, error: leadError } = await supabaseClient
            .from('leads')
            .insert({
                name,
                email,
                phone,
                address,
                service_type: serviceType || 'General Request',
                complexity: complexity || 'simple',
                description: description,
                preferred_time: preferredTime,
                status: 'new'
            })
            .select()
            .single()

        if (leadError) throw leadError;

        // 2. Create Portal User (if requested via the [REQUESTED PORTAL ACCESS] flag)
        let portalStatus = "Not Requested"
        const wantsPortal = description && description.includes('[REQUESTED PORTAL ACCESS]')

        if (wantsPortal && email) {
            console.log(`Creating Client Portal account for ${email}`)

            // Check if user already exists
            const { data: existingUsers } = await supabaseClient.auth.admin.listUsers()
            const userExists = existingUsers.users.some(u => u.email === email)

            if (!userExists) {
                const tempPassword = Math.random().toString(36).slice(-8) + 'A1!'

                const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
                    email: email,
                    password: tempPassword,
                    email_confirm: true,
                    user_metadata: { role: 'client', name: name }
                })

                if (!authError && authData.user) {
                    // Update their profile to trigger RLS
                    await supabaseClient.from('profiles').upsert({
                        id: authData.user.id,
                        email: email,
                        name: name,
                        role: 'client'
                    })
                    portalStatus = `Account Created (Temp Pass: ${tempPassword})`

                    // Send Welcome Email to Visitor
                    const resendApiKey = Deno.env.get('RESEND_API_KEY')
                    if (resendApiKey) {
                        console.log(`Dispatching Welcome Email to ${email}...`)
                        const visitorEmailRes = await fetch('https://api.resend.com/emails', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${resendApiKey}`
                            },
                            body: JSON.stringify({
                                from: 'MSC Electric <onboarding@resend.dev>',
                                to: [email],
                                subject: 'Welcome to your MSC Electric Client Portal',
                                html: `
                                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                                        <h2>Welcome to MSC Electric</h2>
                                        <p>Hi ${name || 'there'},</p>
                                        <p>Thank you for submitting your project request. We have automatically created a secure Client Portal account for you to track your project's progress, invoices, and communications.</p>
                                        <div style="background-color: #f4f4f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                            <p style="margin: 0 0 10px 0;"><strong>Login URL:</strong> <a href="https://mscelectric.io">https://mscelectric.io</a></p>
                                            <p style="margin: 0 0 10px 0;"><strong>Email:</strong> ${email}</p>
                                            <p style="margin: 0;"><strong>Temporary Password:</strong> ${tempPassword}</p>
                                        </div>
                                        <p><em>Please log in and change your password as soon as possible.</em></p>
                                        <p>We will be in touch shortly regarding your project!</p>
                                        <br/>
                                        <p>Best regards,<br/><strong>The MSC Electric Team</strong></p>
                                    </div>
                                `
                            })
                        })
                        if (!visitorEmailRes.ok) {
                            console.error("Resend API failed for welcome email:", await visitorEmailRes.text())
                        }
                    }
                } else {
                    console.error("Auth creation failed:", authError)
                    portalStatus = "Failed to Create Account"
                }
            } else {
                portalStatus = "Account Already Exists"
            }
        }

        // 3. Send Email to Admin via Resend
        // The user must set RESEND_API_KEY in their Supabase Secrets
        const resendApiKey = Deno.env.get('RESEND_API_KEY')
        const adminEmail = Deno.env.get('ADMIN_EMAIL') || 'antonio.j.tito@gmail.com'

        if (resendApiKey) {
            console.log(`Dispatching Admin Notification Email to ${adminEmail}...`)
            const emailRes = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${resendApiKey}`
                },
                body: JSON.stringify({
                    from: 'MSC Electric <onboarding@resend.dev>', // Replace with verified domain in production
                    to: [adminEmail],
                    subject: `New Lead Request: ${name} - ${serviceType || 'General'}`,
                    html: `
                        <h2>New Project Request or AI Chat Log</h2>
                        <p><strong>Name:</strong> ${name}</p>
                        <p><strong>Email:</strong> ${email || 'N/A'}</p>
                        <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
                        <p><strong>Address:</strong> ${address || 'N/A'}</p>
                        <p><strong>Service:</strong> ${serviceType || 'None specified'}</p>
                        <p><strong>Complexity:</strong> ${complexity || 'unknown'}</p>
                        <p><strong>Portal Status:</strong> ${portalStatus}</p>
                        <hr/>
                        <p><strong>Description / Log:</strong></p>
                        <pre style="white-space: pre-wrap; font-family: sans-serif;">${description}</pre>
                        <br/>
                        <p>Log into your Admin Portal to manage this lead.</p>
                    `
                })
            })

            if (!emailRes.ok) {
                console.error("Resend API failed:", await emailRes.text())
            }
        } else {
            console.warn("RESEND_API_KEY not found. Skipping email dispatch.")
        }

        return new Response(
            JSON.stringify({ success: true, message: "Lead processed successfully" }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error) {
        console.error('Error in process-contact-request:', error.message)
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})
