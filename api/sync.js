js
// Dans api/sync.js, changez cette ligne :
const response = await fetch('https://api.football-data.org/v4/competitions/2015/matches', {
    headers: { 'X-Auth-Token': API_KEY }
});
