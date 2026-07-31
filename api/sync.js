import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
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

    if (!data.matches) throw new Error("Erreur API Football-Data");

    const updates = data.matches.map(m => ({
      id: m.id,
      match_date: m.utcDate,
      league: 'Ligue 1',
      status: m.status,
      team_home_id: m.homeTeam.id,
      team_away_id: m.awayTeam.id,
      SCORE_HOME: m.score.fullTime.home,
      SCORE_AWAY: m.score.fullTime.away
    }));

    // On insère ou met à jour les matchs
    const { error } = await supabase.from('matches').upsert(updates);
    if (error) throw error;

    res.status(200).json({ success: true, message: `${updates.length} matchs synchronisés.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
