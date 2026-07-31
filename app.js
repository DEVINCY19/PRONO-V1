// --- DÉBUT DU FICHIER app.js CORRIGÉ ---
const SUPABASE_URL = 'https://cmufapilshppnqulbdrk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtdWZhcGlsc2hwcG5xdWxiZHJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0NDA4NzAsImV4cCI6MjEwMTAxNjg3MH0.UI0GKMfQgIGby_Tu_Q5Q4hOCpASxRe63pHLVr5lPOV0';

// Initialisation sécurisée
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function loadMatches() {
    const matchesDiv = document.getElementById('matches');
    if (!matchesDiv) return;
    
    matchesDiv.innerHTML = '<p class="text-center text-green-400">Chargement des matchs...</p>';

    try {
        // Récupération des données
        const { data: teams, error: teamsError } = await supabase.from('teams').select('*');
        const { data: matches, error: matchesError } = await supabase.from('matches').select('*').order('match_date', { ascending: true });

        if (teamsError || matchesError) {
            throw new Error(teamsError?.message || matchesError?.message);
        }

        if (!matches || matches.length === 0) {
            matchesDiv.innerHTML = '<p class="text-center text-gray-400">Aucun match trouvé.</p>';
            return;
        }

        // Génération du HTML
        let html = '';
        for (let m of matches) {
            const teamA = teams.find(t => t.id == m.team_home_id);
            const teamB = teams.find(t => t.id == m.team_away_id);
            
            html += `
                <div class="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700 mb-3">
                    <p class="text-xs text-gray-400 mb-2">${m.league || 'Ligue'} - ${new Date(m.match_date).toLocaleString('fr-FR')}</p>
                    <div class="flex justify-between items-center">
                        <p class="text-lg font-bold text-green-400 w-1/3 text-left">${teamA?.name || 'Équipe 1'}</p>
                        <span class="text-xl font-black text-white px-2">VS</span>
                        <p class="text-lg font-bold text-green-400 w-1/3 text-right">${teamB?.name || 'Équipe 2'}</p>
                    </div>
                </div>`;
        }
        matchesDiv.innerHTML = html;

    } catch (err) {
        console.error("Erreur Supabase:", err);
        matchesDiv.innerHTML = `<p class="text-red-500 p-4 bg-red-900/20 rounded">Erreur de connexion : ${err.message}</p>`;
    }
}

// Lancement au chargement de la page
document.addEventListener('DOMContentLoaded', loadMatches);
loadMatches();
