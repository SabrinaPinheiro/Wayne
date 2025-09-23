import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting creation of demo users...')

    // Demo users data
    const demoUsers = [
      {
        email: 'funcionario@wayne.app.br',
        password: '123456',
        full_name: 'Funcionário Demo - Wayne Industries',
        role: 'funcionario'
      },
      {
        email: 'gerente@wayne.app.br', 
        password: '123456',
        full_name: 'Gerente Demo - Wayne Industries',
        role: 'gerente'
      },
      {
        email: 'admin@wayne.app.br',
        password: '123456', 
        full_name: 'Administrador Demo - Wayne Industries',
        role: 'admin'
      }
    ]

    const results = []

    for (const userData of demoUsers) {
      console.log(`Creating user: ${userData.email}`)
      
      // Check if user already exists
      const { data: existingUser } = await supabaseAdmin.auth.admin.getUserByEmail(userData.email)
      
      if (existingUser.user) {
        console.log(`User ${userData.email} already exists, updating profile...`)
        
        // Update profile for existing user
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .upsert({
            user_id: existingUser.user.id,
            full_name: userData.full_name,
            role: userData.role
          }, {
            onConflict: 'user_id'
          })

        if (profileError) {
          console.error(`Error updating profile for ${userData.email}:`, profileError)
          results.push({ email: userData.email, status: 'profile_update_error', error: profileError.message })
        } else {
          results.push({ email: userData.email, status: 'profile_updated' })
        }
        continue
      }

      // Create user via Supabase Admin API
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          full_name: userData.full_name
        }
      })

      if (createError) {
        console.error(`Error creating user ${userData.email}:`, createError)
        results.push({ email: userData.email, status: 'error', error: createError.message })
        continue
      }

      console.log(`User ${userData.email} created successfully`)

      // Create profile (the trigger should handle this, but let's be sure)
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          user_id: newUser.user!.id,
          full_name: userData.full_name,
          role: userData.role
        }, {
          onConflict: 'user_id'
        })

      if (profileError) {
        console.error(`Error creating profile for ${userData.email}:`, profileError)
        results.push({ email: userData.email, status: 'user_created_profile_error', error: profileError.message })
      } else {
        results.push({ email: userData.email, status: 'created' })
      }
    }

    console.log('Demo users creation completed:', results)

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Demo users creation process completed',
        results 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in create-demo-users function:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})