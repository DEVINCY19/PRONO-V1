const SUPABASE_URL = 'https://cmufapilshppnqulbdrk.supabase.co'const SUPABASE_ANON_KEY = 'sb_publishable_bdSUWUdU14J2U4r52NbWlg__iLMaJb_'
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
async function loadMatches() {const{ data, error } = await supabase.from('matches').select(`*, home_team:teams!matches_home_team_id_fkey(name), away_team:teams!matches_away_team_id_fkey(name)`).order('match_date', { ascending: true })
const container = document.getElementById('matches')if(error) {container.innerHTML = `<p style="color:red">Erreur: ${error.message}</p>` return} if(!data || data.length === 0) {container.innerHTML = `<p>Aucun match trouvé</p>` return}
container.innerHTML = data.map(match => ` <div class="bg-gray-800 p-4 rounded-lg mb-4"><p class="text-sm text-gray-400">${new Date(match.match_date).toLocaleString('fr-FR')}</p><p class="text-xl font-bold">${match.home_team.name} VS ${match.away_team.name}</p></div> `).join('')}
loadMatches()
