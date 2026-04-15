
const themeBtn = document.querySelector('#theme-btn');
const body = document.body;

if (themeBtn) {
    themeBtn.addEventListener('click', () => {
        body.classList.toggle('dark-theme');
        themeBtn.textContent = body.classList.contains('dark-theme') ? 'Switch to Light' : 'Switch to Dark';
    });
}
const API_BASE = 'https://69dbdd80560857310a0815e3.mockapi.io/api/v1';
const HERO_URL = `${API_BASE}/heroes`;
let allHeroes = [];

async function fetchOlympusHeroes() {
    try {
        const response = await fetch(HERO_URL);
        allHeroes = await response.json();
        refreshCourt();
    } catch (error) {
        console.error('Error fetching heroes:', error);
    }
}

const searchBtn = document.querySelector('#search-btn');

if (searchBtn) {
    searchBtn.addEventListener('click', async () => {
        const nameInput = document.querySelector('#hero-name').value.trim();
        
        if (!nameInput) return alert("Enter a name to search!");

        try {
           
            const response = await fetch(`${HERO_URL}?name=${nameInput}`);
            const results = await response.json();

            if (results.length > 0) {
                const foundHero = results[0];
                
                
                document.querySelector('#hero-power').value = foundHero.power;
                document.querySelector('#hero-rank').value = foundHero.rank;
                
                alert(`Found ${foundHero.name}! Info loaded from archives.`);
                
                
                openJudgementChamber(foundHero.id);
            } else {
                alert("This soul is not in our archives. You may proceed with a new Summon.");
            }
        } catch (error) {
            console.error("Search failed:", error);
        }
    });
}
function refreshCourt() {
    const judgementContainer = document.querySelector('#judgement-list');
    const primordialsContainer = document.querySelector('#primordials-list');
    const titansContainer = document.querySelector('#titans-list');
    const olympusContainer = document.querySelector('#olympus-list');
    
    
    if (judgementContainer) judgementContainer.innerHTML = '';
    if (primordialsContainer) primordialsContainer.innerHTML = '';
    if (titansContainer) titansContainer.innerHTML = '';
    if (olympusContainer) olympusContainer.innerHTML = '';
    
    allHeroes.forEach(hero => {
        const card = createHeroCard(hero);
        const rank = String(hero.rank || '').toLowerCase();
        
        
        if (rank === 'primordial') {
            if (primordialsContainer) primordialsContainer.appendChild(card);
        } else if (rank === 'titan') {
            if (titansContainer) titansContainer.appendChild(card);
        } else if (rank === 'olympian') {
            if (olympusContainer) olympusContainer.appendChild(card);
        } else {
            
            if (judgementContainer) judgementContainer.appendChild(card);
        }
    });
}

function createHeroCard(hero) {
    const card = document.createElement('div');
    card.className = 'hero-card';

    const rank = String(hero.rank || 'Unknown');
    const heroId = hero.id || '';

    
    const promoteAction = heroId
        ? `<button class="promote-btn" onclick="openJudgementChamber('${heroId}')">Review Hero</button>`
        : `<button class="promote-btn" disabled>Review Hero</button>`;

    const banishAction = heroId
        ? `<button class="banish-btn" onclick="banishHero('${heroId}')">Banish</button>`
        : `<button class="banish-btn" disabled>Banish</button>`;

    card.innerHTML = `
        <h3>${hero.name}</h3>
        <p><strong>Power:</strong> ${hero.power}</p>
        <p><strong>Rank:</strong> <span class="rank-badge">${rank}</span></p>
        <div class="card-actions" style="margin-top: 15px; display: flex; gap: 10px;">
            ${promoteAction}
            ${banishAction}
        </div>
    `;
    return card;
}


function openJudgementChamber(id) {
    
    let hero = allHeroes.find(h => h.id === id);

    
    if (!id) {
        const searchName = document.querySelector('#judge-hero-name').value.trim().toLowerCase();
        hero = allHeroes.find(h => h.name.toLowerCase() === searchName);
    }

    if (hero) {
        
        document.querySelector('#judge-hero-id').value = hero.id;
        document.querySelector('#judge-hero-name').value = hero.name;
        document.querySelector('#judge-hero-rank').value = hero.rank;
        
        
        document.querySelector('#judgement-chamber').scrollIntoView({ behavior: 'smooth' });
    } else {
        alert("Hero not found in current records. Please check the spelling.");
    }
}
const heroForm = document.querySelector('#hero-form');
const submitBtn = document.querySelector('#hero-form button[type="submit"]');


if (heroForm) {
    heroForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nameInput = document.querySelector('#hero-name').value.trim();
    const powerInput = document.querySelector('#hero-power').value.trim();
    const rankInput = document.querySelector('#hero-rank').value.trim();

    
    const isDuplicate = allHeroes.some(hero => 
        hero.name.toLowerCase() === nameInput.toLowerCase()
    );

    if (isDuplicate) {
        alert(`❌ Summon Failed: ${nameInput} is already in the archives of Olympus. You cannot summon the same soul twice!`);
        
        
        const existingHero = allHeroes.find(h => h.name.toLowerCase() === nameInput.toLowerCase());
        if (existingHero) openJudgementChamber(existingHero.id);
        
        return; 
    }
   
    try {
        const response = await fetch(HERO_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                name: nameInput, 
                power: powerInput, 
                rank: rankInput 
            })
        });

        if (response.ok) {
            await fetchOlympusHeroes(); // Refresh list to get the new ID
            heroForm.reset();
            alert("✅ New Soul Summoned successfully!");
        }
    } catch (error) {
        console.error("Summoning error:", error);
    }
});
async function banishHero(id) {
    if (!id) return;

    if (confirm("Are you sure you want to banish this hero to the abyss?")) {
        const response = await fetch(`${HERO_URL}/${id}`, { method: 'DELETE' });
        if (response.ok) fetchOlympusHeroes();
    }
}

const judgementForm = document.querySelector('#judgement-form');

if (judgementForm) {
    judgementForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = document.querySelector('#judge-hero-id').value;
        const finalRank = document.querySelector('#judge-action').value;

        if (!id || id === "undefined") {
            return alert("No valid Hero ID found. Please select a hero from the list again.");
        }

        try {
            const response = await fetch(`${HERO_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    rank: finalRank,
                    updatedAt: new Date().toISOString() 
                })
            });

            if (response.ok) {
                const updatedHero = await response.json();
                
                
                const index = allHeroes.findIndex(h => h.id === id);
                if (index !== -1) {
                    allHeroes[index] = updatedHero;
                }

            
                judgementForm.reset();
                document.querySelector('#judge-hero-name').value = '';
                document.querySelector('#judge-hero-rank').value = '';
                
                
                refreshCourt(); 
                alert(`${updatedHero.name} has been judged!`);
            }
        } catch (error) {
            console.error("API Update failed:", error);
        }
    });
}

fetchOlympusHeroes(); }