import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // 1. Initialisation Supabase
  const supabase = createClient(
    'https://cmufapilshppnqulbdrk.supabase.co',
    'VOTRE_CLE_SERVICE_ROLE' // Trouvez "service_role" dans Supabase > Settings > API
  );

  const API_KEY = 'fapi_4HHy3OycT7MKCAjhDQ9Kg9WvZHGltV9j';

  try {
    // 2. Appel à l'API Football (exemple pour la Ligue 1)
    const response = await fetch('https://api.football-data.org/v4/competitions/FL1/matches', {
      headers: { 'X-Auth-Token': API_KEY }
    });
    const data = await response.json();

    // 3. Boucle pour mettre à jour chaque match dans Supabase
    const updates = data.matches.map(match => ({
      id: match.id,
      match_date: match.utcDate,
      team_home_id: match.homeTeam.id,
      team_away_id: match.awayTeam.id,
      league: 'Ligue 1',
      status: match.status
      // Ajoutez ici odd_1, odd_n, etc., si l'API les fournit
    }));

    const { error } = await supabase.from('matches').upsert(updates);

    if (error) throw error;

    return res.status(200).json({ message: "Synchro réussie !", count: updates.length });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
