js
const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  // Initialisation avec la variable d'environnement que vous avez créée
  const supabase = createClient(
    'https://cmufapilshppnqulbdrk.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const API_KEY = 'fapi_4HHy3OycT7MKCAjhDQ9Kg9WvZHGltV9j';

  try {
    const response = await fetch('https://api.football-data.org/v4/competitions/FL1/matches', {
      headers: { 'X-Auth-Token': API_KEY }
    });
    const data = await response.json();

    if (!data.matches) {
        return res.status(500).json({ error: "Impossible de récupérer les matchs de l'API." });
    }

    // On prépare les données pour Supabase
    const matches = data.matches.map(m => ({
      id: m.id,
      match_date: m.utcDate,
      league: 'Ligue 1',
      status: m.status,
      team_home_id: 1, // Temporaire : à lier avec vos IDs réels plus tard
      team_away_id: 2
    }));

    const { error } = await supabase.from('matches').upsert(matches);

    if (error) throw error;

    res.status(200).json({ success: true, message: `${matches.length} matchs synchronisés.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
