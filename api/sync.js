js
// api/sync.js
export default async function handler(req, res) {
  const API_KEY = process.env.API_FOOTBALL_KEY; 
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!API_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ error: "Variables manquantes sur Vercel" });
  }

  try {
    // 1. Appel THESTATSAPI avec la VRAIE URL
    // On ajoute ?competition_id=16 pour avoir la Ligue 1
    const apiUrl = `https://api.thestatsapi.com/api/football/matches?competition_id=16`;
    
    const apiRes = await fetch(apiUrl, {
      headers: { 
        'Authorization': `Bearer ${API_KEY}`, // Souvent Bearer sur cette API
        'Accept': 'application/json'
      }
    });

    // Si Bearer ne marche pas, essayez avec 'x-api-key': API_KEY comme avant
    if (!apiRes.ok) {
        const retryRes = await fetch(apiUrl, {
            headers: { 'x-api-key': API_KEY, 'Accept': 'application/json' }
        });
        if (!retryRes.ok) throw new Error("API Auth Failed");
        var data = await retryRes.json();
    } else {
        var data = await apiRes.json();
    }

    // 2. Préparation et insertion dans Supabase
    // On adapte selon si les données sont dans data ou data.data
    const matchesList = data.data || data; 

    const matches = matchesList.map(m => ({
      id: m.id,
      match_date: m.date || m.start_date || new Date().toISOString(),
      league: "Ligue 1",
      status: m.status,
      team_home_id: m.home_team_id || m.home_team?.id,
      team_away_id: m.away_team_id || m.away_team?.id,
      team_home_name: m.home_team_name || m.home_team?.name,
      team_away_name: m.away_team_name || m.away_team?.name
    }));

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
    return res.status(500).json({ error: err.message });
  }
}
