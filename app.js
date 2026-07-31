js
const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  try {
    const supabase = createClient(
      'https://cmufapilshppnqulbdrk.supabase.co',
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Test simple : on insère un match de test (ID 999)
    const { error } = await supabase.from('matches').upsert({
      id: 999,
      league: 'TEST-IA',
      status: 'OK',
      match_date: new Date().toISOString()
    });

    if (error) throw error;

    res.status(200).json({ success: true, message: "Connexion Supabase OK !" });
  } catch (err) {
    res.status(500).json({ error: "ERREUR TEST: " + err.message });
  }
};
