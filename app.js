js
export default async function handler(req, res) {
  const API_KEY = 'fapi_4HHy3OycT7MKCAjhDQ9Kg9WvZHGltV9j';
  const SUPABASE_URL = 'https://cmufapilshppnqulbdrk.supabase.co';
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  try {
    // 1. Appel API Football via Fetch natif
    const apiRes = await fetch('https://api.football-data.org/v4/competitions/FL1/matches', {
      headers: { 'X-Auth-Token': API_KEY }
    });
    const footballData = await apiRes.json();

    if (!footballData.matches) throw new Error("Erreur API Football-Data");

    const matches = footballData.matches.map(m => ({
      id: m.id,
      match_date: m.utcDate,
      league: 'Ligue 1',
      status: m.status,
      team_home_id: m.homeTeam.id,
      team_away_id: m.awayTeam.id
    }));

    // 2. Envoi vers Supabase via Fetch natif (REST API)
    const supabaseRes = await fetch(`${SUPABASE_URL}/rest/v1/matches`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates' // Équivalent de UPSERT
      },
      body: JSON.stringify(matches)
    });

    if (!supabaseRes.ok) {
        const errText = await supabaseRes.text();
        throw new Error("Erreur Supabase: " + errText);
    }

    return res.status(200).json({ success: true, count: matches.length });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
