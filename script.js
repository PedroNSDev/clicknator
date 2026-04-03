// ================= CLASSES =================
class Upgrade {
    constructor(id, name, desc, baseCost, powerInc, autoInc) {
        this.id = id;
        this.name = name;
        this.desc = desc;
        this.baseCost = baseCost;
        this.cost = baseCost;
        this.powerInc = powerInc;
        this.autoInc = autoInc;
        this.owned = 0;
        this.unlocked = false;
    }

    buy() {
        if (game.clicks >= this.cost) {
            game.clicks -= this.cost;
            this.owned++;
            this.unlocked = true;

            game.clickPower += this.powerInc;
            game.autoClicks += this.autoInc;

            this.cost = Math.floor(this.baseCost * Math.pow(1.5, this.owned));
            game.update();
            saveGame();
        }
    }
}

class AscensionUpgrade {
    constructor(id, name, desc, cost, effect) {
        this.id = id;
        this.name = name;
        this.desc = desc;
        this.cost = cost;
        this.owned = false;
        this.effect = effect;
    }

    buy() {
        if (game.ascensionPoints >= this.cost && !this.owned) {
            game.ascensionPoints -= this.cost;
            this.owned = true;
            this.effect();
            game.update();
            saveGame();
        }
    }
}

class Conquista {
    constructor(name, icon, desc, hide = true) {
        this.name = name;
        this.icon = icon;
        this.desc = desc;
        this.hide = hide;
    }

    render(container) {
        const el = document.createElement("div");
        el.className = "conquista";

        el.innerHTML = `
            <img src="${this.hide ? 'interrogation.png' : this.icon}">
            <div class="conquista-textos">
                <b>${this.name}</b>
                <p>${this.desc}</p>
            </div>
        `;
        container.appendChild(el);
    }
}

class Patch {
    constructor(title, date, text) {
        this.title = title;
        this.date = date;
        this.text = text;
    }

    render(container) {
        const el = document.createElement("div");
        el.className = "patch";

        el.innerHTML = `
            <div class="patch-header">
                <b>${this.title}</b>
                <span>${this.date}</span>
            </div>
            <p>${this.text}</p>
        `;

        container.appendChild(el);
    }
}

// ================= GAME =================
const game = {
    clicks: 0,
    clickPower: 1,
    autoClicks: 0,
    totalClicks: 0,
    totalAscensions: 0,
    playTime: 0,

    ascensionPoints: 0,
    ascensionLevel: 0,

    getAscensionRequirement() {
        return 10000 * (this.ascensionLevel + 1);
    },
    
    doAscension() {
        if (this.clicks < this.getAscensionRequirement()) return;
        
        this.ascensionLevel++;
        this.totalAscensions++; 
        let total = this.clicks;
        let needed = 10000;
        let gained = 0;

        while (total >= needed) {
            total -= needed;
            gained++;
            needed += 10000;
        }

        this.ascensionPoints += gained;

        this.clicks = 0;
        this.clickPower = 1;
        this.autoClicks = 0;

        this.upgrades.forEach(u => {
            u.owned = 0;
            u.cost = u.baseCost;
        });

        this.update();
        saveGame();
    },

    upgrades: [
        new Upgrade('u1', '💪 Luva', '+1 clique', 10, 1, 0),
        new Upgrade('u2', '🤖 Robô', '+1/s', 50, 0, 1),
        new Upgrade('u3', '⚡ Mouse', '+5 clique', 200, 5, 0),
        new Upgrade('u4', '🏭 Fábrica', '+10/s', 1000, 0, 10),
        new Upgrade('u5', '🚀 Portal', '+100/s', 10000, 0, 100),
        new Upgrade('u6', '⚡🤖💪 Mega Portal', '+200/s', 20000, 0, 200)
    ],

    ascensionUpgrades: [
        new AscensionUpgrade("a1", "Clique Melhorado", "+2 poder", 1, () => game.clickPower += 2),
        new AscensionUpgrade("a2", "Auto Boost", "+5/s", 2, () => game.autoClicks += 5)
    ],

    conquistas: [
        new Conquista("Primeiro Clique", "Tomate.png", "Você clicou!", true),
        new Conquista("100 Cliques", "Tomate.png", "Clique 100x", true),
        new Conquista("1000 Cliques", "Tomate.png", "Clique 1000x", true),
        new Conquista("Automação", "Tomate.png", "Compre upgrades", true)
    ],

    patchNotes: [
        new Patch("Lançamento", "01/04/2026", "Versão inicial do jogo."),
        new Patch("Ascensão", "02/04/2026", "Sistema de ascensão adicionado.")
    ],

    click(e) {
    this.clicks += this.clickPower;
    this.totalClicks += this.clickPower;

    spawnParticle(e.clientX, e.clientY, false); // normal

    this.checkConquistas();
    this.update();
    saveGame();
    },
    checkConquistas() {
        if (this.clicks >= 1) this.conquistas[0].hide = false;
        if (this.clicks >= 100) this.conquistas[1].hide = false;
        if (this.clicks >= 1000) this.conquistas[2].hide = false;

        const totalUp = this.upgrades.reduce((s, u) => s + u.owned, 0);
        if (totalUp >= 5) this.conquistas[3].hide = false;
    },

    update() {
        document.getElementById('counter').innerText = Math.floor(this.clicks);
        document.getElementById('stats-bar').innerText =
            `Poder: ${this.clickPower} | Auto: ${this.autoClicks}/s`;

        document.getElementById('rebirth-mult').innerText =
            `Ascensão: ${this.ascensionPoints}`;
        
        this.renderShop();
        this.renderAscension();
        this.renderStats();
        this.renderConquistas();
        this.renderPatchNotes();
    },
    renderStats() {
    const container = document.getElementById("stats");

    container.innerHTML = `
        <h2>Estatísticas</h2>

        <div class="stats-box">
            <p><b>Cliques Totais:</b> ${this.totalClicks.toLocaleString()}</p>
            <p><b>Ascensões Totais:</b> ${this.totalAscensions}</p>
            <p><b>Tempo de Jogo:</b> ${formatTime(this.playTime)}</p>
        </div>
    `;
},
    renderShop() {
        const shop = document.getElementById('shop');
        shop.innerHTML = "";

        this.upgrades.forEach(u => {
            const visible = u.unlocked || this.clicks >= u.cost * 0.75;
            if (!visible) return;

            const el = document.createElement("div");
            el.className = `upgrade-card ${this.clicks < u.cost ? 'disabled' : ''}`;
            el.onclick = () => u.buy();

            el.innerHTML = `
                <div>
                    <h3>${u.name}</h3>
                    <p>${u.desc}</p>
                    <small>Qtd: ${u.owned}</small>
                </div>
                <b>${u.cost}</b>
            `;

            shop.appendChild(el);
        });
    },

    renderAscension() {
        const info = document.getElementById("rebirth-info");

        info.innerHTML = `
            <p>Pontos: ${this.ascensionPoints}</p>
            <p>Necessário: ${this.getAscensionRequirement()}</p>
        `;

        const btn = document.getElementById("rebirth-btn");
        btn.innerHTML = `<button onclick="game.doAscension()">Ascender</button>`;

        this.ascensionUpgrades.forEach(u => {
            const el = document.createElement("div");
            el.className = "upgrade-card";
            el.onclick = () => u.buy();

            el.innerHTML = `
                <b>${u.name}</b>
                <p>${u.desc}</p>
                <span>${u.cost} AP</span>
            `;

            info.appendChild(el);
        });
    },

    renderConquistas() {
        const container = document.getElementById("conquistas");
        container.innerHTML = `<h2>Conquistas</h2>`;

        const grid = document.createElement("div");
        grid.style.display = "grid";
        grid.style.gridTemplateColumns = "repeat(3,1fr)";
        grid.style.gap = "10px";

        this.conquistas.forEach(c => c.render(grid));
        container.appendChild(grid);
    },

    renderPatchNotes() {
        const container = document.getElementById("patch-notes");
        container.innerHTML = `<h2>Notas</h2>`;
        this.patchNotes.forEach(p => p.render(container));
    }
};

// ================= PARTICULAS =================
function spawnParticle(x, y, isGray = false) {
    const p = document.createElement('div');
    p.className = 'particle';

    // posição inicial
    p.style.left = (x - 20) + 'px';
    p.style.top = (y - 20) + 'px';
    p.style.backgroundImage = "url('iconreceita.png')";

    // 🎯 DIREÇÃO ALEATÓRIA (leque)
    const angle = Math.random() * Math.PI; 
    const distance = 30 + Math.random() * 50; 

    const moveX = Math.cos(angle) * distance;
    const moveY = Math.sin(angle) * distance * -1; 

    p.style.setProperty('--x', `${moveX}px`);
    p.style.setProperty('--y', `${moveY}px`);

    if (isGray) {
        p.style.filter = "grayscale(1) brightness(0.7)";
        p.style.opacity = "0.6";
        p.style.transform = "scale(0.9)";
    }

    document.body.appendChild(p);

    setTimeout(() => p.remove(), 800);
}
// ================= ABAS =================
function showTab(tabId) {
    const main = document.getElementById('main-content');

    main.classList.add('blur-effect');

    setTimeout(() => {
        document.querySelectorAll('.content-section').forEach(s => {
            s.classList.remove('active');
        });

        document.getElementById(tabId)?.classList.add('active');

        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        const activeBtn = document.querySelector(`.nav-btn[data-tab="${tabId}"]`);
        if (activeBtn) activeBtn.classList.add('active');

        setTimeout(() => main.classList.remove('blur-effect'), 150);
    }, 150);
}

// ================= AUTO =================
setInterval(() => {
    if (game.autoClicks > 0) {
        game.clicks += game.autoClicks;
        game.update();
        saveGame();
    }
}, 1000);

// ================= SAVE =================
function saveGame() {
    localStorage.setItem('save', JSON.stringify({
        clicks: game.clicks,
        clickPower: game.clickPower,
        autoClicks: game.autoClicks,
        totalClicks: game.totalClicks,
        totalAscensions: game.totalAscensions,
        playTime: game.playTime,
        ascensionPoints: game.ascensionPoints,
        ascensionLevel: game.ascensionLevel,
        upgrades: game.upgrades.map(u => ({
            id: u.id,
            owned: u.owned,
            unlocked: u.unlocked
        })),
        conquistas: game.conquistas.map(c => ({
            name: c.name,
            hide: c.hide
        }))
    }));
}

function loadGame() {
    const data = JSON.parse(localStorage.getItem('save'));
    if (!data) return;

    game.clicks = data.clicks;
    game.clickPower = data.clickPower;
    game.autoClicks = data.autoClicks;
    game.totalClicks = data.totalClicks || 0;
    game.totalAscensions = data.totalAscensions || 0;
    game.playTime = data.playTime || 0;
    game.ascensionPoints = data.ascensionPoints;
    game.ascensionLevel = data.ascensionLevel;

    data.upgrades.forEach(d => {
        const u = game.upgrades.find(x => x.id === d.id);
        if (u) {
            u.owned = d.owned;
            u.unlocked = d.unlocked;
        }
    });

    data.conquistas.forEach(d => {
        const c = game.conquistas.find(x => x.name === d.name);
        if (c) c.hide = d.hide;
    });
}
function formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    return `${h}h ${m}m ${s}s`;
}
// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {
    // ===== LOAD DO JOGO =====
    loadGame();
    game.update();
   

    // ===== IMAGEM DE CLIQUE =====
    const clickImg = document.getElementById("main-click");

    if (clickImg) {
        clickImg.addEventListener("mouseenter", () => {
            clickImg.src = "glabmedo.png";
        });

        clickImg.addEventListener("mouseleave", () => {
            clickImg.src = "glabidle.png";
            clickImg.style.transform = "scale(1)";
        });

        clickImg.addEventListener("mousedown", () => {
            clickImg.src = "glabclique.png";
            clickImg.style.transform = "scale(0.85)";
        });

        clickImg.addEventListener("mouseup", () => {
            clickImg.src = "glabmedo.png";
            clickImg.style.transform = "scale(1)";
        });
    }
});

document.addEventListener("click", (e) => {
    const target = e.target;

    // elementos que NÃO devem gerar partícula cinza
    const isInteractive =
        target.closest(".click-img") ||
        target.closest(".upgrade-card") ||
        target.closest("button") ||
        target.closest(".nav-btn");

    if (!isInteractive) {
        spawnParticle(e.clientX, e.clientY, true); // cinza
    }
});
setInterval(() => {
    // tempo
    game.playTime++;

    // autoclick
    if (game.autoClicks > 0) {
        game.clicks += game.autoClicks;
        game.totalClicks += game.autoClicks;
    }

    // atualiza tudo
    game.update();
    saveGame();

}, 1000);


let audioStarted = false;

document.addEventListener("click", () => {
    if (!audioStarted) {
        const bg = document.getElementById("bg-music");
        bg.volume = 0.3; // volume mais baixo
        bg.play();
        audioStarted = true;
    }
});