js
// api/sync.js
export default async function handler(req, res) {
  try {
    const API_KEY = process.env.API_FOOTBALL_KEY;
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!API_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
      throw new Error("Clés manquantes dans Vercel");
    }

    // 1. Appel simple à l'API
    const apiUrl = `https://api.thestatsapi.com/api/football/matches?competition_id=16`;
    const apiRes = await fetch(apiUrl, {
      headers: { 'x-api-key': API_KEY, 'Accept': 'application/json' }
    });

    const data = await apiRes.json();
    if (!apiRes.ok) throw new Error("API error: " + JSON.stringify(data));

    const matchesList = data.data || data;

    const matches = matchesList.map(m => ({
      id: m.id,
      match_date: m.date || m.start_date || new Date().toISOString(),
      league: "Ligue 1",
      status: m.status,
      team_home_id: m.home_team_id,
      team_away_id: m.away_team_id,
      team_home_name: m.home_team_name,
      team_away_name: m.away_team_name
    }));

    // 2. Envoi à Supabase
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

    return res.status(200).json({ success: true, count: matches.length });

  } catch (err) {
    return res.status(500).json({ error: "ECHEC: " + err.message });
  }
}
