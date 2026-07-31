// api/sync.js
export default async function handler(req, res) {
  const API_KEY = 'fapi_4HHy3OycT7MKCAjhDQ9Kg9WvZHGltV9j';
  const SUPABASE_URL = 'https://cmufapilshppnqulbdrk.supabase.co';
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  try {
    // 1. Appel API Football
    const apiRes = await fetch('https://api.football-data.org/v4/competitions/2015/matches', {
      headers: {
        'X-Auth-Token': API_KEY
      }
    });
    const data = await apiRes.json();

    if (!data.matches) {
      return res.status(500).json({
        error: "Erreur API Football",
        details: data
      });
    }

    const matches = data.matches.map(m => ({
      id: m.id,
      match_date: m.utcDate,
      league: 'Ligue 1',
      status: m.status,
      team_home_id: m.homeTeam.id,
      team_away_id: m.awayTeam.id
    }));

    // 2. Envoi direct à Supabase en REST pur
    const dbRes = await fetch(`${SUPABASE_URL}/rest/v1/matches`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(matches)
    });

    if (!dbRes.ok) {
      const errorText = await dbRes.text();
      return res.status(500).json({
        error: "Erreur Supabase",
        details: errorText
      });
    }

    return res.status(200).json({
      success: true,
      count: matches.length
    });
  } catch (err) {
    return res.status(500).json({
      error: "Erreur Serveur",
      message: err.message
    });
  }
}
