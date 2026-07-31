js
// api/sync.js
module.exports = async (req, res) => {
  const API_KEY = 'fapi_4HHy3OycT7MKCAjhDQ9Kg9WvZHGltV9j';
  const SUPABASE_URL = 'https://cmufapilshppnqulbdrk.supabase.co';
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_KEY) {
      return res.status(500).json({ error: "La clé SUPABASE_SERVICE_ROLE_KEY est manquante dans Vercel." });
  }

  try {
    const apiRes = await fetch('https://api.football-data.org/v4/competitions/2015/matches', {
      headers: { 'X-Auth-Token': API_KEY }
    });
    const data = await apiRes.json();

    if (!data.matches) throw new Error("API Football error: " + (data.message || "Unknown"));

    const matches = data.matches.map(m => ({
      id: m.id,
      match_date: m.utcDate,
      league: 'Ligue 1',
      status: m.status,
      team_home_id: m.homeTeam.id,
      team_away_id: m.awayTeam.id
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

    res.status(200).json({ success: true, count: matches.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
