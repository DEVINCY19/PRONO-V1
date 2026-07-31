import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://cmufapilshppnqulbdrk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtdWZhcGlsc2hwcG5xdWxiZHJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0NDA4NzAsImV4cCI6MjEwMTAxNjg3MH0.UI0GKMfQgIGby_Tu_Q5Q4hOCpASxRe63pHLVr5lPOV0';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const grid = document.getElementById('display-grid');

export async function loadMatchs() {
    const { data: matches, error } = await supabase
        .from('matches')
        .select('*, home:team_home_id(name, logo, form), away:team_away_id(name, logo, form)')
        .is('SCORE_HOME', null)
        .order('match_date', { ascending: true });

    if (error) return console.error(error);

    grid.innerHTML = matches.map(m => `
        <div class="match-card bg-gray-800 border border-gray-700 rounded-[2rem] p-6 shadow-xl">
            <div class="flex justify-between items-center text-center">
                <div class="flex-1">
                    <img src="${m.home?.logo || 'https://placehold.co/50'}" class="w-12 h-12 mx-auto mb-2">
                    <p class="text-[10px] font-bold uppercase">${m.home?.name || 'DOM'}</p>
                </div>
                <div class="text-green-500 font-black italic">VS</div>
                <div class="flex-1">
                    <img src="${m.away?.logo || 'https://placehold.co/50'}" class="w-12 h-12 mx-auto mb-2">
                    <p class="text-[10px] font-bold uppercase">${m.away?.name || 'EXT'}</p>
                </div>
            </div>
            <div class="mt-4 flex gap-2">
                <button class="flex-1 bg-gray-700 hover:bg-green-600 py-2 rounded-xl text-xs font-bold transition-all">1</button>
                <button class="flex-1 bg-gray-700 hover:bg-blue-600 py-2 rounded-xl text-xs font-bold transition-all">N</button>
                <button class="flex-1 bg-gray-700 hover:bg-red-600 py-2 rounded-xl text-xs font-bold transition-all">2</button>
            </div>
        </div>
    `).join('');
}
