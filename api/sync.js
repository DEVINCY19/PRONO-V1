import { createClient } from '@supabase/supabase-js';

// Configuration
const SUPABASE_URL = 'https://cmufapilshppnqulbdrk.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'VOTRE_SERVICE_ROLE_KEY'; // Utilisez la Service Role Key pour avoir les droits d'écriture
const FOOTBALL_API_KEY = 'fapi_rEsxPYoepktkGTej7QYJkKNVg2ggq4h5';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function syncMatches() {
    console.log("Démarrage de la synchronisation...");

    try {
        // 1. Récupération des données depuis l'API Football (Exemple pour la Ligue 1, ID 61)
        const response = await fetch('https://v3.football.api-sports.io/fixtures?league=61&next=10', {
            method: 'GET',
            headers: {
                'x-rapidapi-key': FOOTBALL_API_KEY,
                'x-rapidapi-host': 'v3.football.api-sports.io'
            }
        });

        const result = await response.json();

        if (!result.response || result.response.length === 0) {
            console.log("Aucun match trouvé sur l'API.");
            return;
        }

        // 2. Formatage des données pour votre table Supabase
        const matchesToInsert = result.response.map(item => ({
            home_team: item.teams.home.name,
            away_team: item.teams.away.name,
            league: item.league.name,
            match_date: item.fixture.date,
            home_form: "VVNVD", // Vous pouvez calculer cela plus tard
            away_form: "NVVDV",
            // Ajoutez d'autres colonnes si nécessaire
        }));

        // 3. Nettoyage de l'ancienne table (Optionnel, dépend de votre stratégie)
        await supabase.from('matches').delete().neq('id', 0); 

        // 4. Insertion des nouveaux matchs
        const { error } = await supabase
            .from('matches')
            .insert(matchesToInsert);

        if (error) throw error;

        console.log(`${matchesToInsert.length} matchs synchronisés avec succès !`);

    } catch (error) {
        console.error("Erreur de synchro :", error.message);
    }
}

syncMatches();
