const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  const supabase = createClient(
    'https://cmufapilshppnqulbdrk.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const API_KEY = 'fapi_4HHy3OycT7MKCAjhDQ9Kg9WvZHGltV9j';

  try {
    // 1. Récupération des matchs Ligue 1 (FL1)
    const response = await fetch('https://api.football-data.org/v4/competitions/FL1/matches', {
      headers: { 'X-Auth-Token': API_KEY }
    });
    const data = await response.json();

    if (!data.matches) return res.status(500).json({ error: "Erreur API Football" });

    for (const match of data.matches) {
      // 2. Création/Mise à jour automatique des équipes (Domicile & Extérieur)
      const teams = [match.homeTeam, match.awayTeam];
      
      for (const team of teams) {
        await supabase.from('teams').upsert({
          id: team.id,
          name: team.name,
          logo: team.crest // L'API fournit directement l'URL du logo (crest)
        });
      }

      // 3. Insertion du match lié aux IDs des équipes
      await supabase.from('matches').upsert({
        id: match.id,
        match_date: match.utcDate,
        team_home_id: match.homeTeam.id,
        team_away_id: match.awayTeam.id,
        league: 'Ligue 1',
        status: match.status,
        // Si les scores sont dispo, on les met à jour
        SCORE_HOME: match.score.fullTime.home,
        SCORE_AWAY: match.score.fullTime.away
      });
    }

    res.status(200).json({ success: true, message: "Equipes et Matchs synchronisés avec succès !" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
