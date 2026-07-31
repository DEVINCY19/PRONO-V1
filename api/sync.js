// api/sync.js - Version TheStatsAPI corrigée
export default async function handler(req, res) {
  const API_KEY = process.env.API_FOOTBALL_KEY;
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!API_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ error: "Variables d'env manquantes" });
  }

  try {
    // 1. Appel THESTATSAPI - endpoint fixtures pour Ligue 1 (ID 16)
    const apiRes = await fetch(`https://api.thestatsapi.com/v1/fixtures?competition_id=16`, {
      headers: {
        'x-api-key': API_KEY,
        'Accept': 'application/json'
      }
    });

    if (!apiRes.ok) {
      const errorData = await apiRes.json();
      return res.status(500).json({ error: "Erreur API TheStatsAPI", details: errorData });
    }

    const data = await apiRes.json();

    // Mapping des données reçues vers votre structure Supabase
    const matches = data.data.map(m => ({
      id: m.id,
      match_date: m.start_date,
      league: "Ligue 1",
      status: m.status,
      team_home_id: m.home_team_id,
      team_away_id: m.away_team_id,
      team_home_name: m.home_team_name,
      team_away_name: m.away_team_name
    }));

    // 2. Envoi à Supabase via REST API (Upsert)
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

    return res.status(200).json({ 
      success: true, 
      count: matches.length,
      message: "Synchronisation terminée avec succès" 
    });

  } catch (err) {
    return res.status(500).json({ 
      error: "Erreur Serveur", 
      message: err.message 
    });
  }
}
