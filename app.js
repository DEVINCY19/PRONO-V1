const SUPABASE_URL = 'https://cmufapilshppnqulbdrk.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtdWZhcGlsc2hwcG5xdWxiZHJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0NDA4NzAsImV4cCI6MjEwMTAxNjg3MH0.UI0GKMfQgIGby_Tu_Q5Q4hOCpASxRe63pHLVr5lPOV0' // Assurez-vous que c'est bien la clé "anon"

// Utilisation de supabase.createClient car chargé via script CDN
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function loadMatches() {
    const container = document.getElementById('matches')
    
    try {
        const { data, error } = await supabaseClient
            .from('matches')
            .select(`
                *,
                home_team:teams!home_team_id(name),
                away_team:teams!away_team_id(name)
            `)
            .order('match_date', { ascending: true })

        if (error) throw error

        if (!data || data.length === 0) {
            container.innerHTML = `<p class="text-center text-gray-400">Aucun match trouvé</p>`
            return
        }

        container.innerHTML = data.map(match => `
            <div class="bg-gray-800 p-4 rounded-lg shadow-md border border-gray-700 mb-4">
                <p class="text-xs text-green-400 font-semibold mb-1">
                    ${new Date(match.match_date).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                </p>
                <div class="flex justify-between items-center">
                    <span class="text-lg font-bold">${match.home_team?.name || 'Équipe A'}</span>
                    <span class="text-gray-500 font-bold px-2">VS</span>
                    <span class="text-lg font-bold text-right">${match.away_team?.name || 'Équipe B'}</span>
                </div>
            </div>
        `).join('')

    } catch (error) {
        console.error("Erreur complète:", error)
        if (container) {
            container.innerHTML = `<p class="text-red-500 bg-red-100 p-3 rounded">Erreur: ${error.message}</p>`
        }
    }
}

// Lancer le chargement
loadMatches()
