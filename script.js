// 1. THEME ENGINE
const themeBtn = document.querySelector('#theme-btn');
const body = document.body;

themeBtn.addEventListener('click', () => {
    body.classList.toggle('dark-theme');
    themeBtn.textContent = body.classList.contains('dark-theme') ? 'Switch to Light' : 'Switch to Dark';
});

// 2. API SETUP
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

// 3. UI RENDERING & SORTING
function refreshCourt() {
    const judgementContainer = document.querySelector('#judgement-list');
    const olympusContainer = document.querySelector('#olympus-list');
    
    if (judgementContainer && olympusContainer) {
        judgementContainer.innerHTML = '';
        olympusContainer.innerHTML = '';
        
        allHeroes.forEach(hero => {
            const card = createHeroCard(hero);
            if (hero.rank.toLowerCase() === 'olympian') {
                olympusContainer.appendChild(card);
            } else {
                judgementContainer.appendChild(card);
            }
        });
    }
}

function createHeroCard(hero) {
    const card = document.createElement('div');
    card.className = 'hero-card';
    card.innerHTML = `
        <h3>${hero.name}</h3>
        <p><strong>Power:</strong> ${hero.power}</p>
        <p><strong>Rank:</strong> <span class="rank-badge">${hero.rank}</span></p>
        <div class="card-actions">
            ${hero.rank.toLowerCase() !== 'olympian' 
                ? `<button class="promote-btn" onclick="openJudgementChamber('${hero.id}')">Review Hero</button>` 
                : `<span>✨ Legend</span>`
            }
            <button class="banish-btn" onclick="banishHero('${hero.id}')">Banish</button>
        </div>
    `;
    return card;
}

// 4. JUDGEMENT CHAMBER BRIDGE
function openJudgementChamber(id) {
    const hero = allHeroes.find(h => h.id === id);
    if (hero) {
        document.querySelector('#judge-hero-id').value = hero.id;
        document.querySelector('#judge-hero-name').value = hero.name;
        // Fixed the ID target here!
        document.querySelector('#judgement-chamber').scrollIntoView({ behavior: 'smooth' });
    }
}

// 5. SUMMONING ALTAR LOGIC (Inputs & Submits)
const nameInput = document.querySelector('#hero-name');
const submitBtn = document.querySelector('#hero-form button');
const heroForm = document.querySelector('#hero-form');

if (nameInput) {
    nameInput.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();
        const existing = allHeroes.find(h => h.name.toLowerCase() === query);

        if (existing) {
            submitBtn.textContent = "Judge & Update";
            submitBtn.dataset.mode = "promote";
            submitBtn.style.backgroundColor = "#ffcc00"; 
            submitBtn.style.color = "#000"; 
        } else {
            submitBtn.textContent = "Execute Summon";
            submitBtn.dataset.mode = "add";
            submitBtn.style.backgroundColor = ""; 
            submitBtn.style.color = ""; 
        }
    });
}

if (heroForm) {
    heroForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.querySelector('#hero-name').value.trim();
        const power = document.querySelector('#hero-power').value.trim();
        const rank = document.querySelector('#hero-rank').value.trim();

        if (submitBtn.dataset.mode === "promote") {
            const existing = allHeroes.find(h => h.name.toLowerCase() === name.toLowerCase());
            if (existing) {
                openJudgementChamber(existing.id);
                return; 
            }
        }

        const newHero = { name, power, rank };
        try {
            const response = await fetch(HERO_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newHero)
            });

            if (response.ok) {
                heroForm.reset();
                submitBtn.textContent = "Execute Summon"; 
                submitBtn.dataset.mode = "add";
                submitBtn.style.backgroundColor = "";
                fetchOlympusHeroes(); 
            }
        } catch (error) {
            console.error("Failed to summon hero:", error);
        }
    });
}

// 6. ACTION FUNCTIONS (Delete & Update)
async function banishHero(id) {
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

        if (!id) return alert("Please select a hero to judge first!");

        await fetch(`${HERO_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rank: finalRank })
        });

        judgementForm.reset();
        fetchOlympusHeroes();
    });
}

// 7. BOOT UP
fetchOlympusHeroes();