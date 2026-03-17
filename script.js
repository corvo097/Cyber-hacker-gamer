let game = {
    money: 0, bots: 0, trace: 0, defLevel: 1, level: 1,
    income: 0, isAttacked: false, currentDefCode: "",
    mails: [{ from: "Agente", sub: "O Início", body: "Corvo, infecte a rede. O dinheiro virá.", read: false }]
};

const ALVOS = [
    { id: 1, name: "WiFi Público", reward: 100, cmd: "crack_wifi", lv: 1 },
    { id: 2, name: "Servidor Empresa", reward: 800, cmd: "inject_sql", lv: 2 },
    { id: 3, name: "Banco Federal", reward: 5000, cmd: "bypass_vault", lv: 3 }
];

function init() {
    updateUI();
    renderNet();
    renderMails();
    
    // Loop de Ganho Passivo (Botnet)
    setInterval(() => {
        game.money += game.income;
        if(game.bots > 0 && Math.random() > 0.9) game.trace += 1;
        updateUI();
        if(Math.random() > 0.98 && game.money > 1000) triggerAttack(); // Chance de contra-ataque
    }, 1000);

    // Loop de Recuperação de Rastro
    setInterval(() => { if(game.trace > 0) game.trace -= 0.2; updateUI(); }, 3000);
}

function tab(id) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.getElementById('t-' + id).classList.add('active');
}

// TERMINAL
const cmdInput = document.getElementById("cmd");
cmdInput.addEventListener("keydown", (e) => {
    if(e.key === "Enter") {
        let val = cmdInput.value.toLowerCase();
        cmdInput.value = "";
        print("> " + val);
        if(val === "help") print("Comandos: net, buy, status, clear");
        else if(val === "clear") document.getElementById("log").innerHTML = "";
        else print("Comando desconhecido.", "red");
    }
});

function print(txt, color = "#00ff41") {
    const log = document.getElementById("log");
    log.innerHTML += `<div style="color:${color}">[${new Date().toLocaleTimeString()}] ${txt}</div>`;
    log.scrollTop = log.scrollHeight;
}

// REDE E HACK
function renderNet() {
    const map = document.getElementById("map");
    map.innerHTML = "";
    ALVOS.forEach(a => {
        if(game.level >= a.lv) {
            map.innerHTML += `<div class="node" onclick="hack(${a.id})"><b>${a.name}</b><br>Recompensa: $${a.reward}</div>`;
        }
    });
}

function hack(id) {
    let a = ALVOS.find(x => x.id === id);
    tab('term');
    print(`Conectando a ${a.name}...`);
    print(`DIGITE O COMANDO DE INVASÃO: ${a.cmd}`, "yellow");
    
    let oldHandler = cmdInput.onkeydown;
    cmdInput.onkeydown = (e) => {
        if(e.key === "Enter") {
            if(cmdInput.value === a.cmd) {
                game.money += a.reward;
                game.trace += (a.lv * 15);
                print("ACESSO CONCEDIDO!", "var(--g)");
                if(game.money > 2000 && game.level === 1) { game.level = 2; print("NÍVEL 2 ATINGIDO!", "cyan"); renderNet(); }
            } else {
                game.trace += 30;
                print("FALHA! SISTEMA DE ALERTA ATIVADO!", "red");
            }
            cmdInput.value = "";
            cmdInput.onkeydown = oldHandler;
            updateUI();
        }
    }
}

// MERCADO E BOTNET
function buy(type) {
    if(type === 'bot' && game.money >= 500) {
        game.money -= 500; game.bots += 10; game.income += 5;
    } else if(type === 'vpn' && game.money >= 300) {
        game.money -= 300; game.trace = Math.max(0, game.trace - 40);
    } else if(type === 'def' && game.money >= 1000) {
        game.money -= 1000; game.defLevel++;
    } else if(type === 'nuke' && game.money >= 2000) {
        game.money -= 2000; game.trace = 0;
    }
    updateUI();
}

// CONTRA-ATAQUE (DEFESA)
function triggerAttack() {
    if(game.isAttacked) return;
    game.isAttacked = true;
    game.currentDefCode = Math.random().toString(36).substring(7).toUpperCase();
    document.getElementById("attack-alert").style.display = "block";
    document.getElementById("def-code").innerText = game.currentDefCode;
    
    let defIn = document.getElementById("def-input");
    defIn.value = ""; defIn.focus();
    
    let timer = setTimeout(() => {
        if(game.isAttacked) {
            game.money = Math.floor(game.money / 2);
            game.trace = 80;
            endAttack("DEFESA FALHOU! Metade dos créditos roubados.");
        }
    }, 10000 / game.defLevel); // Mais firewall = mais tempo

    defIn.onkeyup = () => {
        if(defIn.value.toUpperCase() === game.currentDefCode) {
            clearTimeout(timer);
            endAttack("ATAQUE REPELIDO COM SUCESSO!");
        }
    };
}

function endAttack(msg) {
    game.isAttacked = false;
    document.getElementById("attack-alert").style.display = "none";
    print(msg, "yellow");
    updateUI();
}

function updateUI() {
    document.getElementById("money").innerText = game.money;
    document.getElementById("bots").innerText = game.bots;
    document.getElementById("income").innerText = game.income;
    document.getElementById("def-lv").innerText = game.defLevel;
    document.getElementById("trace-txt").innerText = Math.floor(game.trace);
    document.getElementById("trace-fill").style.width = game.trace + "%";
    document.getElementById("bot-n").innerText = game.bots;

    if(game.trace >= 100) { alert("POLÍCIA NA PORTA! SEU HD FOI DESTRUÍDO."); location.reload(); }
}

function renderMails() {
    const mDiv = document.getElementById("mails");
    mDiv.innerHTML = "";
    game.mails.forEach(m => {
        mDiv.innerHTML += `<div class="node"><b>${m.from}</b>: ${m.sub}<br><small>${m.body}</small></div>`;
    });
}

window.onload = init;
                   
