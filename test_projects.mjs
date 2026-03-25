import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://cihqfvjywmgvyxudjxvo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpaHFmdmp5d21ndnl4dWRqeHZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyOTcxNDAsImV4cCI6MjA4Njg3MzE0MH0.1uehzGue0u7uf-0Efn8VTt-s7Ms-9TuFiTjtbFIEWG0'
);

async function test() {
  const { data, error } = await supabase.from('projects').select('*');
  console.log('Error:', error ? error.message : 'Success');
  if (data) console.log(`Found ${data.length} projects.`);
}

test();
