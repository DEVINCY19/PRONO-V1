import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://cmufapilshppnqulbdrk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtdWZhcGlsc2hwcG5xdWxiZHJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0NDA4NzAsImV4cCI6MjEwMTAxNjg3MH0.UI0GKMfQgIGby_Tu_Q5Q4hOCpASxRe63pHLVr5lPOV0';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const grid = document.getElementById('display-grid');

async function loadMatchs() {
    if (!grid) return;
    grid.innerHTML = '<p>Chargement des matchs...</p>';

    const { data: matches, error } = await supabase
        .from('matches') // Nom de votre table dans Supabase
        .select('*');

    if (error) {
        grid.innerHTML = `<p style="color:red">Erreur : ${error.message}</p>`;
        return;
    }

    grid.innerHTML = matches.map(match => `
        <div class="bg-gray-800 p-6 rounded-2xl border border-gray-700">
            <div class="text-xs text-green-400 font-bold mb-2">${match.league}</div>
            <div class="flex justify-between font-bold text-lg">
                <span>${match.team_home}</span>
                <span class="text-gray-500">${match.lambda_home || ''}</span>
            </div>
            <div class="flex justify-between font-bold text-lg">
                <span>${match.team_away}</span>
                <span class="text-gray-500">${match.lambda_away || ''}</span>
            </div>
        </div>
    `).join('');
}

// Déclenche le chargement dès que la page est prête
document.addEventListener('DOMContentLoaded', loadMatchs);
