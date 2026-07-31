// api/sync.js
export default async function handler(req, res) {
  const API_KEY = process.env.API_FOOTBALL_KEY; // Votre clé TheStatsAPI
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!API_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ error: "Variables d'environnement manquantes dans Vercel" });
  }

  try {
    // 1. Appel THESTATSAPI (Vérifiez bien que l'ID de la Ligue 1 est le bon, souvent c'est 'france-ligue-1' ou un ID numérique)
    // Nous utilisons ici l'endpoint standard des matchs
    const apiRes = await fetch(`https://api.thestatsapi.com/v1/fixtures?competition_id=16`, {
      headers: { 
        'x-api-key': API_KEY,
        'Accept': 'application/json'
      }
    });

    if (!apiRes.ok) {
      const errorData = await apiRes.text();
      return res.status(apiRes.status).json({ error: "L'API a répondu avec une erreur", details: errorData });
    }

    const data = await apiRes.json();

    // L'API renvoie les données dans data.data
    if (!data.data || !Array.isArray(data.data)) {
        return res.status(500).json({ error: "Format de données reçu inconnu", received: data });
    }

    const matches = data.data.map(m => ({
      id: m.id,
      match_date: m.start_date || m.date,
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

    if (!dbRes.ok) {
      const errorText = await dbRes.text();
      return res.status(500).json({ error: "Erreur Supabase", details: errorText });
    }

    return res.status(200).json({ success: true, count: matches.length });

  } catch (err) {
    return res.status(500).json({ error: "Erreur Serveur", message: err.message });
  }
}
