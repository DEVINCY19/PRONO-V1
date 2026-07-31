// api/sync.js
export default async function handler(req, res) {
  const API_KEY = process.env.API_FOOTBALL_KEY;
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!API_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ error: "Variables d'env manquantes" });
  }

  try {
    // 1. Appel API-FOOTBALL.COM
    const today = new Date().toISOString().split('T')[0];
    const apiRes = await fetch(`https://v3.football.api-sports.io/fixtures?league=61&season=2024&from=${today}&to=${today}`, {
      headers: { 
        'x-apisports-key': API_KEY 
      }
    });
    
    const data = await apiRes.json();

    if (data.errors && Object.keys(data.errors).length > 0) {
      return res.status(500).json({ error: "Erreur API Football", details: data.errors });
    }

    const matches = data.response.map(m => ({
      id: m.fixture.id,
      match_date: m.fixture.date,
      league: m.league.name,
      status: m.fixture.status.short,
      team_home_id: m.teams.home.id,
      team_away_id: m.teams.away.id,
      team_home_name: m.teams.home.name,
      team_away_name: m.teams.away.name
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

    if (!dbRes.ok) {
      const errorText = await dbRes.text();
      return res.status(500).json({ error: "Erreur Supabase", details: errorText });
    }

    return res.status(200).json({ success: true, count: matches.length });
  } catch (err) {
    return res.status(500).json({ error: "Erreur Serveur", message: err.message });
  }
}
