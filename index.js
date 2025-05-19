// index.js

const express = require('express');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

dotenv.config(); 

// Supabase credentials from .env
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const app = express();
app.use(express.json());
app.use(express.static('public'));

// index.js (continued)

// Test route to fetch all saved recipes
app.get('/api/saved-recipes', async (req, res) => {
    const { data, error } = await supabase.from('recipes').select('*');
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
  
    res.json(data);
  });
  
  // Start the server
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
  