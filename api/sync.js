// api/sync.js pour TheStatsAPI
export default async function handler(req, res) {
  const API_KEY = process.env.API_FOOTBALL_KEY;
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!API_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ error: "Variables d'env manquantes" });
  }

  try {
    // 1. Appel THESTATSAPI pour Ligue 1 France id=16
    const today = new Date().toISOString().split('T')[0];
    const apiUrl = `https://api.thestatsapi.com/v1/fixtures?competition_id=16&date_from=${today}&date_to=${today}`;
    
    const apiRes = await fetch(apiUrl, {
      headers: { 'x-api-key': API_KEY }
    });
    
    const data = await apiRes.json();

    if (data.error) {
      return res.status(500).json({ error: "Erreur API TheStatsAPI", details: data.error });
    }

    // Extraction des matchs depuis la propriété data.data
    const matches = data.data.map(m => ({
      id: m.id,
      match_date: m.start_time,
      league: m.competition.name,
      status: m.status,
      team_home_id: m.home_team.id,
      team_away_id: m.away_team.id,
      team_home_name: m.home_team.name,
      team_away_name: m.away_team.name
    }));

    // 2. Envoi à Supabase (Upsert / Merge)
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
