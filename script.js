// ================= CLASSES =================
class Upgrade {
    constructor(id, name, desc, baseCost, powerInc, autoInc, img = null) {
        this.id = id;
        this.name = name;
        this.desc = desc;
        this.baseCost = baseCost;
        this.cost = baseCost;
        this.powerInc = powerInc;
        this.autoInc = autoInc;
        this.owned = 0;
        this.unlocked = false;
        this.img = img; 
    }

   buy() {
    if (game.clicks >= this.cost) {
        game.clicks -= this.cost;
        this.owned++;
        this.unlocked = true;

        game.clickPower += this.powerInc;
        game.autoClicks += this.autoInc;

        this.cost = Math.floor(this.baseCost * Math.pow(1.1, this.owned));

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
// =================ENEMIES=================





// ================= GAME =================
const game = {
    clicks: 0,
    clickPower: 1,
    autoClicks: 0,
    

    ascensionPoints: 0,
    ascensionLevel: 0,

    zona: 1,
    dif: 1,
    currentEnemy: null,

    totalClicks: 0,
    totalAscensions: 0,
    playTime: 0,
    totalEnemiesKilled: 0,

    bonus:{
        clickPowerMult: 1,
        ClickMult: 1,
        PowerMult:1
    },

    getAscensionRequirement() {
        return 10000 * (this.ascensionLevel + 1);
    },
    ///enemies--:
   spawnEnemy() {
    if (!enemyData.tiers) return;

    const tier = [...enemyData.tiers]
        .reverse()
        .find(t => this.zona >= t.minZona);

    if (!tier) return;

    const base = tier.enemies[
        Math.floor(Math.random() * tier.enemies.length)
    ];

    // escala infinita
    const hpScale = Math.pow(1.2, this.zona);
    const rewardScale = Math.pow(1.15, this.zona);

    const hp = Math.floor(base.hp * hpScale * this.dif);
    const reward = Math.floor(base.reward * rewardScale);

    this.currentEnemy = {
        name: `${base.name} +${this.zona}`,
        maxHp: hp,
        hp: hp,
        reward: reward,
        img: base.img
    };

    this.updateEnemyUI();
},

killEnemy() {
    this.clicks += this.currentEnemy.reward;
    this.totalEnemiesKilled++;
    this.zona++;

    if (this.zona % 5 === 0) {
        this.dif += 0.05;
    }

    this.spawnEnemy();
},
updateEnemyUI() {
    if (!this.currentEnemy) return;

    const hpPercent = (this.currentEnemy.hp / this.currentEnemy.maxHp) * 100;

    document.getElementById("enemy-img").src = this.currentEnemy.img;

    document.getElementById("enemy-name").innerText =
        `${this.currentEnemy.name} (Zona ${this.zona})`;

    document.getElementById("enemy-hp").innerText =
        `${this.currentEnemy.hp} / ${this.currentEnemy.maxHp}`;

    document.getElementById("health-fill").style.width =
        hpPercent + "%";
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
        this.zona = 1;
        this.dif = 1;

        this.upgrades.forEach(u => {
            u.owned = 0;
            u.cost = u.baseCost;
        });

        this.update();
        saveGame();
    },

    upgrades: [
        new Upgrade('u1', 'Graveto', '+1 de poder', 10, 1, 0, "Upgrades/Graveto.gif"),
        new Upgrade('u2', 'Jão', '+1/s', 50, 0, 1,"joes/joao.gif"),
        new Upgrade('u3', 'Espada', '+5 de poder', 200, 5, 0, "Upgrades/Espada.gif"),
        new Upgrade('u4', 'Jão Gorro', '+50/s', 1000, 0, 50, "joes/JaoGorro.gif"),
        new Upgrade('u5', 'Jão Chapeu', '+100/s', 5000, 0, 100, "joes/joao_chapeu.gif"),
        new Upgrade('u6', 'Jão Mineiro', '+200/s', 10000, 0, 200, "joes/Joao_mineiro2.gif"),
        new Upgrade('u7', 'Jão Vaqueiro', '+600/s', 20000, 0, 600, "joes/Joao_vaqueiro.gif"),
        new Upgrade('u8', 'Jão Alien', '+1500/s', 50000, 0, 1500, "joes/Joao_alien.gif"),
        new Upgrade('u9', 'Soares', 'ele sabe oq você fez no verão passado...', 200000, 0, 5000, "joes/JoaoSabe.gif"),
        new Upgrade('u10', 'Jão cão', 'Ama Rock', 500000, 0, 15000, "joes/Jao cao.gif")
    ],

    ascensionUpgrades: [
    new AscensionUpgrade(
        "a1", 
        "Clique Melhorado", 
        "+2 poder", 
        1, 
        () => game.clickPower += 2
    ),
    new AscensionUpgrade(
        "a2", 
        "Auto Boost", 
        "+5/s", 
        2, 
        () => game.autoClicks += 5
    ),
    new AscensionUpgrade(
        "a3",
        "Bônus de Ascensão",
        "Aumenta 10% do Click Power, Click Manual e Poder Automático",
        3,
        () => {
            game.bonus.clickPowerMult *= 1.1;
            game.bonus.ClickMult *= 1.1;
            game.bonus.PowerMult *= 1.1;
        }
    )
],
    conquistas: [
        new Conquista("Primeiro Clique", "Tomate.png", "Você clicou!", true),
        new Conquista("100 Cliques", "conquistas/Forca1.gif", "Clique 100x", true),
        new Conquista("1000 Cliques", "conquistas/Forca2.gif", "Clique 1000x", true),
        new Conquista("Automação", "Tomate.png", "Compre 1 upgrade ", true),
        new Conquista("Zona 10", "Tomate.png", "Alcance a zona 10", true),
        new Conquista("Zona 20", "Tomate.png", "Alcance a zona 20", true),
        new Conquista("Zona 30", "Tomate.png", "Alcance a zona 30", true),
        new Conquista("Zona 40", "Tomate.png", "Alcance a zona 40", true),
        new Conquista("Ascensão", "Tomate.png", "Faça sua primeira ascensão", true),
        new Conquista("Jão", "conquistas/JoaoConquista.gif", "Compre seu primeiro Jão", true),
        new Conquista("Jão Jão","conquistas/JoaoConquista2.gif ", "Tenha 50 Jãos", true),
        new Conquista("Jão Jão?", "conquistas/JoaoConquista3.gif", "Tenha 100 Jãos", true)

        
    ],

    patchNotes: [
        new Patch("Lançamento", "01/04/2026", "Versão inicial do jogo."),
        new Patch("Ascensão", "02/04/2026", "Sistema de ascensão adicionado."),
        new Patch("Viusal 'Melhorado'", "04/04/2026", "Madruguei :P"),
        new Patch("Mais inimigos e rework de zonas", "04/04/2026", ">:V"),
        new Patch("Melhor Visual + INIMIGOS", "04/04/2026", "(Te Amo Luis <3)"),
        new Patch("Visual Melhor + 5 Inimigos", "05/04/2025", "Sungan >:P")
    ],

    click(e) {
    if (!this.currentEnemy) return;

    this.currentEnemy.hp -= this.clickPower;
    this.totalClicks += this.clickPower;

    spawnParticle(e.clientX, e.clientY, false);

    if (this.currentEnemy.hp <= 0) {
        this.killEnemy();
    }

    this.updateEnemyUI();
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
        document.getElementById('counter').innerText = Math.floor(this.clicks).toLocaleString('pt-BR');
        document.getElementById('stats-bar').innerText =
            `Poder: ${this.clickPower} | : ${this.autoClicks}/s`;

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
            <p><b>Inimigos Mortos:</b> ${this.totalEnemiesKilled}</p>
            <p><b>Tempo de Jogo:</b> ${formatTime(this.playTime)}</p>
           
        </div>
    `;
},
   renderShop() {
    const shop = document.getElementById('shop');
    shop.innerHTML = "";
    shop.classList.add("upgrades-grid"); // garante o grid -=-

    this.upgrades.forEach(u => {
        const visible = u.unlocked || this.clicks >= u.cost * 0.75;
        if (!visible) return;

        const card = document.createElement('div');
        card.className = `upgrade-card ${this.clicks < u.cost ? 'disabled' : ''}`;
        card.onclick = () => u.buy();

        card.innerHTML = `
            <div class="upgrade-image">
                <img src="${u.img || 'placeholder.png'}" alt="${u.name}">
            </div>
            <div class="upgrade-text">
                <p>${u.name}</p>
                <small>${u.desc}</small>
                <p>Qtd: ${u.owned} | Preço: ${u.cost.toLocaleString('pt-BR')}</p>
            </div>
        `;

        shop.appendChild(card);
    });
},
    renderAscension() {
    const info = document.getElementById("rebirth-info");

    info.innerHTML = `
        <p style="color: black;">Pontos: ${this.ascensionPoints}</p>
        <p style="color: black;">Necessário: ${this.getAscensionRequirement()}</p>
    `;

    const btn = document.getElementById("rebirth-btn");
    btn.innerHTML = `<button onclick="game.doAscension()">Ascender</button>`;

    this.ascensionUpgrades.forEach(u => {
        const el = document.createElement("div");
        el.className = "upgrade-card";
        el.onclick = () => u.buy();

        el.innerHTML = `
            <b style="color: black;">${u.name}</b>
            <p style="color: black;">${u.desc}</p>
            <span style="color: black;">${u.cost} AP</span>
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
    const main = document.querySelector('.main-container');
    const center = document.getElementById('center-content');

    // efeito de blur 
    if (main) main.classList.add('blur-effect');

    setTimeout(() => {
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        const target = document.getElementById(tabId);
        if (target) target.classList.add('active');

        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        const activeBtn = document.querySelector(`.nav-btn[data-tab="${tabId}"]`);
        if (activeBtn) activeBtn.classList.add('active');

        if (center) {
            if (tabId === "clicker") {
                center.classList.add("bg-active");
            } else {
                center.classList.remove("bg-active");
            }
        }

        if (main) {
            setTimeout(() => main.classList.remove('blur-effect'), 150);
        }
    }, 150);
}
// ================= AUTO =================
setInterval(() => {
    if (game.autoClicks > 0 && game.currentEnemy) {

        game.currentEnemy.hp -= game.autoClicks;

        // trava HP mínimo
        game.currentEnemy.hp = Math.max(0, game.currentEnemy.hp);

        // morreu KKKKK
        if (game.currentEnemy.hp <= 0) {
            game.killEnemy();
        }

        game.updateEnemyUI();
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
        zona: game.zona,
        totalClicks: game.totalClicks,
        totalAscensions: game.totalAscensions,
        totalEnemiesKilled: game.totalEnemiesKilled,
        playTime: game.playTime,
        ascensionPoints: game.ascensionPoints,
        ascensionLevel: game.ascensionLevel,
        bonus: game.bonus,
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
    game.zona = data.zona || 1;
    game.autoClicks = data.autoClicks;
    game.totalClicks = data.totalClicks || 0;
    game.totalAscensions = data.totalAscensions || 0;
    game.totalEnemiesKilled = data.totalEnemiesKilled || 0;
    game.playTime = data.playTime || 0;
    game.ascensionPoints = data.ascensionPoints;
    game.ascensionLevel = data.ascensionLevel;
    
       data.upgrades.forEach(saved => {
        const up = game.upgrades.find(u => u.id === saved.id);

        if (up) {
            up.owned = saved.owned;
            up.unlocked = saved.unlocked;
            up.cost = Math.floor(up.baseCost * Math.pow(1.1, up.owned));
            game.clickPower += up.powerInc * up.owned;
            game.autoClicks += up.autoInc * up.owned;
        }
        if (data.bonus) {
    game.bonus = {
        clickPowerMult: data.bonus.clickPowerMult ?? 1,
        clickMult: data.bonus.clickMult ?? 1,
        powerMult: data.bonus.powerMult ?? 1
    };
}
    });
    
function showTab(tabId) {
    const main = document.getElementById('main-content');
    const center = document.getElementById('center-content'); 

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

        // CONTROLE DO FUNDO
        if (tabId === "clicker") {
            center.classList.add("bg-active");
        } else {
            center.classList.remove("bg-active");
        }

        setTimeout(() => main.classList.remove('blur-effect'), 150);
    }, 150);
}
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

});

document.addEventListener("click", (e) => {
    const target = e.target;

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

let enemyData = {};

async function loadEnemies() {
    try {
        const res = await fetch("enemies.json");
        enemyData = await res.json();

        console.log("Enemies carregados:", enemyData); // debug
    } catch (err) {
        console.error("Erro ao carregar enemies.json:", err);
    }
} 

document.addEventListener("DOMContentLoaded", async () => {
    await loadEnemies(); 
    loadGame();

    game.spawnEnemy(); 

    game.update();
});
