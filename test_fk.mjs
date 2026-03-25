import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://cihqfvjywmgvyxudjxvo.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpaHFmdmp5d21ndnl4dWRqeHZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyOTcxNDAsImV4cCI6MjA4Njg3MzE0MH0.1uehzGue0u7uf-0Efn8VTt-s7Ms-9TuFiTjtbFIEWG0'
);

async function test() {
    console.log('Inserting dummy profile...');
    const { data, error } = await supabase.from('profiles').insert({
        id: '11111111-1111-1111-1111-111111111111',
        name: 'Dummy Client',
        email: 'dummy@example.com',
        role: 'client'
    }).select();

    if (error) {
        console.error('DB Error:', error.message);
    } else {
        console.log('Success:', data);
    }
}

test();
