js
const { createClient } = require('@supabase/supabase-js');
const https = require('https');

module.exports = async (req, res) => {
  const supabase = createClient(
    'https://cmufapilshppnqulbdrk.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const options = {
    hostname: 'api.football-data.org',
    path: '/v4/competitions/FL1/matches',
    headers: { 'X-Auth-Token': 'fapi_4HHy3OycT7MKCAjhDQ9Kg9WvZHGltV9j' }
  };

  https.get(options, (apiRes) => {
    let body = '';
    apiRes.on('data', (d) => body += d);
    apiRes.on('end', async () => {
      try {
        const data = JSON.parse(body);
        if (!data.matches) throw new Error("Format API invalide");

        const matches = data.matches.map(m => ({
          id: m.id,
          match_date: m.utcDate,
          league: 'Ligue 1',
          status: m.status,
          team_home_id: m.homeTeam.id,
          team_away_id: m.awayTeam.id
        }));

        const { error } = await supabase.from('matches').upsert(matches);
        if (error) throw error;

        res.status(200).json({ success: true, count: matches.length });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });
  }).on('error', (e) => {
    res.status(500).json({ error: e.message });
  });
};
