// --- ESTADO DO JOGO ---
let game = {
    money: 0, bots: 0, trace: 0, defLevel: 1, level: 1,
    income: 0, isAttacked: false, currentDefCode: "",
    isTutorialActive: true, // Começa com tutorial ativo
    mails: [
        { id: 1, from: "Agente_Null", sub: "Bem-vindo", body: "Corvo, a rede está instável. Comece invadindo o WiFi público na aba _REDE. Junte créditos.", read: false }
    ],
    hacksCompleted: 0
};

// BANCO DE DADOS DE ALVOS
const ALVOS = [
    { id: 1, name: "WiFi Público", reward: 100, cmd: "crack_wifi", lv: 1, riskVal: 15 },
    { id: 2, name: "Servidor Empresa", reward: 800, cmd: "inject_sql", lv: 2, riskVal: 30 },
    { id: 3, name: "Banco Federal", reward: 5000, cmd: "bypass_vault", lv: 3, riskVal: 50 }
];

// --- MOTOR INICIAL ---
function init() {
    updateUI();
    renderNet();
    renderMails();
    
    // Mostra tutorial se for a primeira vez
    if(localStorage.getItem("cyberdesk_singularity_save")) {
        // Se tem save, carrega e pula tutorial
        loadGame();
    } else {
        // Se não tem save, mostra tutorial
        document.getElementById("tutorial-overlay").style.display = "flex";
    }

    // Loop de Ganho Passivo (Botnet) a cada 1 segundo
    setInterval(() => {
        if(game.isTutorialActive) return; // Não ganha dinheiro no tutorial
        game.money += game.income;
        if(game.bots > 0 && Math.random() > 0.9) game.trace += 0.5; // Rastro lento dos bots
        updateUI();
        
        // Chance de contra-ataque (Risco aumenta com dinheiro e rastro)
        if(!game.isAttacked && game.money > 1000 && Math.random() > (0.99 - (game.trace / 500))) {
            triggerAttack();
        }
        
        saveGame(); // Auto-save a cada segundo
    }, 1000);

    // Loop de Recuperação Natural do Rastro
    setInterval(() => { if(game.trace > 0 && !game.isAttacked) game.trace -= 0.1; updateUI(); }, 2000);
}

// --- LOGICA DO TUTORIAL ---
function fecharTutorial() {
    game.isTutorialActive = false;
    document.getElementById("tutorial-overlay").style.display = "none";
    tab('net'); // Começa na aba de rede
    print("CYBERDESK OS INICIALIZADO. BOAS VINDAS, CORVO.", "cyan");
    updateUI();
}

// --- SISTEMA DE ABAS ---
function tab(id) {
    if(game.isTutorialActive) return; // Bloqueia abas no tutorial
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.getElementById('t-' + id).classList.add('active');
}

// --- TERMINAL E COMANDOS ---
const cmdInput = document.getElementById("cmd");
cmdInput.addEventListener("keydown", (e) => {
    if(e.key === "Enter") {
        let val = cmdInput.value.toLowerCase().trim();
        cmdInput.value = "";
        if(!val) return;
        processTerminalCommand(val);
    }
});

function processTerminalCommand(cmd) {
    print("> " + cmd, "#fff");
    if(cmd === "help") {
        print("Comandos: net, buy, status, clear, read_mail [id]");
    } else if(cmd === "clear") {
        document.getElementById("log").innerHTML = "";
    } else if(cmd === "status") {
        print(`Crd: ${game.money} | Risk: ${game.trace.toFixed(1)}% | Bots: ${game.bots}`);
    } else if(cmd.startsWith("read_mail")) {
        // Comando avançado para ler e-mail pelo terminal
        let id = parseInt(cmd.split(" ")[1]);
        readMail(id);
    } else {
        print("Comando desconhecido. Use 'help'.", "red");
    }
}

function print(txt, color = "var(--g)") {
    const log = document.getElementById("log");
    log.innerHTML += `<div style="color:${color}">[${new Date().toLocaleTimeString()}] ${txt}</div>`;
    log.scrollTop = log.scrollHeight; // Auto-scroll
}

// --- SISTEMA DE REDE (HACKING ATIVO) ---
function renderNet() {
    const map = document.getElementById("map");
    map.innerHTML = "";
    ALVOS.forEach(a => {
        if(game.level >= a.lv) {
            map.innerHTML += `
                <div class="node" onclick="hack(${a.id})">
                    <b>ALVO: ${a.name}</b><br>
                    Recompensa: $${a.reward}<br>
                    <small>Risco estimado: +${a.riskVal}%</small>
                </div>
            `;
        }
    });
}

function hack(id) {
    let a = ALVOS.find(x => x.id === id);
    switchTabMobile('term'); // Troca aba e foca terminal
    print(`Conectando ao alvo: ${a.name}...`);
    print(`AGUARDANDO SEQUÊNCIA DE INVASÃO: <b class="yellow">${a.cmd}</b>`, "yellow");
    
    let oldHandler = cmdInput.onkeydown;
    cmdInput.onkeydown = (e) => {
        if(e.key === "Enter") {
            if(cmdInput.value.toLowerCase().trim() === a.cmd) {
                game.money += a.reward;
                game.trace += a.riskVal;
                game.hacksCompleted++;
                print("ACESSO CONCEDIDO! CRÉDITOS TRANSFERIDOS.", "var(--g)");
                checkProgress();
            } else {
                game.trace += (a.riskVal * 2); // Penalidade maior por erro
                print("FALHA CRÍTICA! SISTEMA DE ALERTA ATIVADO!", "red");
            }
            cmdInput.value = "";
            cmdInput.onkeydown = oldHandler; // Restaura handler padrão
            updateUI();
        }
    }
}

// Auxiliar para focar no terminal (importante para mobile)
function switchTabMobile(tabId) {
    tab(tabId);
    setTimeout(() => cmdInput.focus(), 100);
}

// --- ECONOMIA E UPGRADES ---
function buy(type) {
    if(type === 'bot' && game.money >= 500) {
        game.money -= 500; game.bots += 10; game.income += 5;
        print(`Botnet expandida (+10 nós).`);
    } else if(type === 'vpn' && game.money >= 300) {
        game.money -= 300; game.trace = Math.max(0, game.trace - 40);
        print(`VPN ativada.logs limpos.`);
    } else if(type === 'def' && game.money >= 1000) {
        game.money -= 1000; game.defLevel++;
        print(`Firewall atualizado (Nível ${game.defLevel}).`);
    } else if(type === 'nuke' && game.money >= 2000) {
        game.money -= 2000; game.trace = 0;
        print(`Logs deletados. Você é um fantasma.`);
    } else {
        print("Créditos insuficientes.", "red");
    }
    updateUI();
}

// --- SISTEMA DE DEFESA (CONTRA-ATAQUE) ---
function triggerAttack() {
    game.isAttacked = true;
    tab('term'); // Força troca para o terminal para defesa
    game.currentDefCode = Math.random().toString(36).substring(2, 6).toUpperCase(); // Código simples de 4 dígitos
    
    document.getElementById("attack-alert").style.display = "block";
    document.getElementById("def-code").innerText = game.currentDefCode;
    
    const defIn = document.getElementById("def-input");
    defIn.value = ""; defIn.focus();
    print("!!! INVASÃO INIMIGA DETECTADA !!!", "red");
    
    // Tempo para se defender diminui com o tempo e aumenta com firewall
    let timeLimit = Math.max(3000, (15000 / (game.defLevel * 1.5)));
    
    let timer = setTimeout(() => {
        if(game.isAttacked) {
            // Penalidade de falha: Perde metade do dinheiro e rastro vai pro talo
            game.money = Math.floor(game.money / 2);
            game.trace = 90;
            endAttack("DEFESA FALHOU! Sistema comprometido, metade dos créditos roubados.", "red");
        }
    }, timeLimit);

    defIn.onkeyup = () => {
        if(defIn.value.toUpperCase() === game.currentDefCode) {
            clearTimeout(timer);
            endAttack("ATAQUE REPELIDO! Sistema de defesa funcionou.", "cyan");
        }
    };
}

function endAttack(msg, color) {
    game.isAttacked = false;
    document.getElementById("attack-alert").style.display = "none";
    print(msg, color);
    updateUI();
}

// --- SISTEMA DE MENSAGENS E PROGRESSÃO ---
function renderMails() {
    const mDiv = document.getElementById("mails");
    mDiv.innerHTML = "";
    let unread = 0;
    game.mails.forEach(m => {
        if(!m.read) unread++;
        mDiv.innerHTML += `
            <div class="mail-item node" onclick="readMail(${m.id})">
                <b>DE: ${m.from}</b> - ${m.sub} ${m.read ? '' : '<b class="red blink">[!]</b>'}
            </div>`;
    });
    const mCountStat = document.getElementById("m-count");
    mCountStat.innerText = unread > 0 ? unread : '0';
    mCountStat.className = unread > 0 ? 'red blink' : '';
}

function readMail(id) {
    const mail = game.mails.find(m => m.id === id);
    if(mail) {
        mail.read = true;
        tab('term');
        print(`--- MENSAGEM: ${mail.sub} ---`, "cyan");
        print(`DE: ${mail.from}`, "#aaa");
        print(`${mail.body}`, "#fff");
        print("--- FIM DA MENSAGEM ---", "cyan");
        renderMails();
        updateUI();
    }
}

function checkProgress() {
    if(game.money >= 1500 && game.level === 1) {
        game.level = 2;
        game.mails.push({ id: 2, from: "Null_Sec", sub: "Novos Horizontes", body: "Você provou valor, Corvo. A rede corporativa está acessível na aba _REDE. Mais lucro, mais risco.", read: false });
        print("NOVO NÍVEL DE ACESSO ATINGIDO!", "cyan");
        renderNet();
        renderMails();
    } else if(game.money >= 8000 && game.level === 2) {
        game.level = 3;
        game.mails.push({ id: 3, from: "Anon", sub: "A Grande Jogada", body: "O Banco Central está vulnerável. É sua chance de se tornar lenda. Cuidado com a polícia.", read: false });
        print("ACESSO DE ELITE (NÍVEL 3) DETECTADO!", "cyan");
        renderNet();
        renderMails();
    }
}

// --- ATUALIZAÇÃO DA INTERFACE (UI) ---
function updateUI() {
    document.getElementById("money").innerText = Math.floor(game.money);
    document.getElementById("bots").innerText = game.bots;
    document.getElementById("income").innerText = game.income;
    document.getElementById("income-stat").innerText = game.income;
    document.getElementById("def-lv").innerText = game.defLevel;
    document.getElementById("bot-n").innerText = game.bots;
    
    // Rastro e Barra
    document.getElementById("trace-txt").innerText = Math.floor(game.trace);
    let fill = document.getElementById("trace-fill");
    fill.style.width = Math.min(100, game.trace) + "%";
    
    // Cor da barra de rastro baseada no perigo
    if(game.trace > 80) fill.style.background = "var(--r)";
    else if(game.trace > 50) fill.style.background = "yellow";
    else fill.style.background = "var(--g)";

    // CONDIÇÃO DE GAME OVER
    if(game.trace >= 100) {
        game.trace = 100;
        alert("GAME OVER: A POLÍCIA RASTREOU SEU IP E VOCÊ FOI PRESO!");
        localStorage.removeItem("cyberdesk_singularity_save"); // Apaga save
        location.reload(); // Reinicia
    }
}

// --- SALVAMENTO E CARREGAMENTO (SAVE GAME) ---
function saveGame() {
    if(game.isTutorialActive) return; // Não salva durante o tutorial
    localStorage.setItem("cyberdesk_singularity_save", JSON.stringify(game));
}

function loadGame() {
    const saved = localStorage.getItem("cyberdesk_singularity_save");
    if(saved) {
        game = JSON.parse(saved);
        game.isTutorialActive = false; // Garante que volta jogando
        document.getElementById("tutorial-overlay").style.display = "none"; // Garante que fecha tutorial
        renderNet();
        renderMails();
        updateUI();
        tab('term');
        print("SISTEMA RESTAURADO. BEM-VINDO DE VOLTA, CORVO.", "cyan");
    }
}

// Inicializa tudo quando a página carrega
window.onload = init;
    
