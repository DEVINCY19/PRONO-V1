// api/sync.js
export default async function handler(req, res) {
  const API_KEY = process.env.API_FOOTBALL_KEY; 
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Vérification des variables d'environnement
  if (!API_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ 
      error: "Configuration incomplète sur Vercel",
      missing: {
        api_key: !API_KEY,
        supabase_url: !SUPABASE_URL,
        supabase_key: !SUPABASE_KEY
      }
    });
  }

  try {
    // 1. Appel THESTATSAPI avec l'URL complète
    // ID 16 correspond généralement à la Ligue 1 sur cette API
    const apiUrl = `https://api.thestatsapi.com/v1/football/fixtures?competition_id=16`;
    
    const apiRes = await fetch(apiUrl, {
      headers: { 
        'x-api-key': API_KEY,
        'Accept': 'application/json'
      }
    });

    if (!apiRes.ok) {
      const errorData = await apiRes.text();
      return res.status(apiRes.status).json({ 
        error: "Erreur provenant de TheStatsAPI", 
        details: errorData 
      });
    }

    const data = await apiRes.json();

    // Vérification de la présence des données
    if (!data.data || !Array.isArray(data.data)) {
        return res.status(500).json({ 
          error: "Format de données invalide", 
          received: data 
        });
    }

    // 2. Préparation des matchs pour Supabase
    const matches = data.data.map(m => ({
      id: m.id,
      match_date: m.start_date || m.date || new Date().toISOString(),
      league: "Ligue 1",
      status: m.status || 'scheduled',
      team_home_id: m.home_team_id,
      team_away_id: m.away_team_id,
      team_home_name: m.home_team_name,
      team_away_name: m.away_team_name
    }));

    // 3. Envoi à Supabase (Upsert : insère ou met à jour si l'ID existe déjà)
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
      message: "Synchronisation réussie !" 
    });

  } catch (err) {
    return res.status(500).json({ 
      error: "Erreur critique du serveur", 
      message: err.message 
    });
  }
}
