js
const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  const supabase = createClient(
    'https://cmufapilshppnqulbdrk.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const API_KEY = 'fapi_4HHy3OycT7MKCAjhDQ9Kg9WvZHGltV9j';

  try {
    // Utilisation de l'ID 2015 (Ligue 1) qui est plus sûr
    const response = await fetch('https://api.football-data.org/v4/competitions/2015/matches', {
      headers: { 'X-Auth-Token': API_KEY }
    });
    
    if (!response.ok) throw new Error("API Football Erreur: " + response.status);
    
    const data = await response.json();

    const matches = data.matches.map(m => ({
      id: m.id,
      match_date: m.utcDate,
      league: 'Ligue 1',
      status: m.status,
      team_home_id: m.homeTeam.id,
      team_away_id: m.awayTeam.id,
      SCORE_HOME: m.score?.fullTime?.home,
      SCORE_AWAY: m.score?.fullTime?.away
    }));

    const { error } = await supabase.from('matches').upsert(matches);
    if (error) throw error;

    res.status(200).json({ success: true, count: matches.length });
  } catch (err) {
    res.status(500).json({ error: "Détail Erreur: " + err.message });
  }
};
