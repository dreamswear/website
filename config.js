// config.js - Configuration Supabase partagée
const SUPABASE_CONFIG = {
    URL: 'https://neensjugjhkvwcqslicr.supabase.co',
    KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lZW5zanVnamhrdndjcXNsaWNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5Mjg1NzQsImV4cCI6MjA4MTUwNDU3NH0.eDEhhT8HzetCntUZ2LYkZhtoUjSjmFxPQqm03aAL8tU'
};

// Initialiser Supabase client
const supabase = window.supabase.createClient(SUPABASE_CONFIG.URL, SUPABASE_CONFIG.KEY);
