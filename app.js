const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  const supabase = createClient(
    'https://cmufapilshppnqulbdrk.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // On teste juste une écriture pour voir si la liaison fonctionne
    const { error } = await supabase.from('matches').upsert({ 
        id: 999, 
        league: 'TEST-OK',
        match_date: new Date().toISOString() 
    });
    
    if (error) throw error;
    res.status(200).send("LIAISON SUPABASE RÉUSSIE !");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
