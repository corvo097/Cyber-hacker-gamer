let game = {
    money: 0, bots: 0, trace: 0, defLevel: 1, level: 1, income: 0,
    isTutorialActive: true,
    mails: [{ id: 1, from: "Null_Sec", sub: "Instruções", body: "Corvo, clique nos nós verdes no Mapa de Rede para coletar créditos.", read: false }]
};

const nodes = [
    {id: 1, x: 50, y: 50, name: "WiFi Público", reward: 100, risk: 10, lv: 1},
    {id: 2, x: 150, y: 120, name: "Servidor Local", reward: 500, risk: 20, lv: 2},
    {id: 3, x: 250, y: 80, name: "Banco Central", reward: 5000, risk: 50, lv: 3}
];

function init() {
    updateUI();
    drawNetwork();
    renderMails();

    // Ganho passivo dos Bots
    setInterval(() => {
        if(game.isTutorialActive) return;
        game.money += game.income;
        if(game.bots > 0 && Math.random() > 0.8) game.trace += 0.2;
        updateUI();
        saveGame();
    }, 1000);

    // Matrix Background
    setInterval(drawMatrix, 33);
}

function fecharTutorial() {
    game.isTutorialActive = false;
    document.getElementById("tutorial-overlay").remove();
    print("SISTEMA ONLINE. ACESSE A REDE.", "#00ff41");
}

function tab(id) {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.getElementById("t-"+id).classList.add("active");
    if(id === 'net') setTimeout(drawNetwork, 100); // Redesenha ao abrir
}

function drawNetwork() {
    let canvas = document.getElementById("network");
    let ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    ctx.strokeStyle = "#004400";
    ctx.lineWidth = 2;
    
    // Desenha conexões
    nodes.forEach((n, i) => {
        if(i < nodes.length - 1) {
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(nodes[i+1].x, nodes[i+1].y);
            ctx.stroke();
        }
    });

    // Desenha os Alvos (Nós)
    nodes.forEach(n => {
        if(game.level >= n.lv) {
            ctx.fillStyle = "#00ff41";
            ctx.beginPath();
            ctx.arc(n.x, n.y, 8, 0, Math.PI*2);
            ctx.fill();
            ctx.fillStyle = "#fff";
            ctx.fillText(n.name, n.x + 10, n.y);
        }
    });

    canvas.onclick = e => {
        let rect = canvas.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;
        nodes.forEach(n => {
            if(game.level >= n.lv) {
                let dist = Math.hypot(n.x - x, n.y - y);
                if(dist < 15) startHack(n);
            }
        });
    };
}

function startHack(n) {
    alertMsg("INVASÃO INICIADA: " + n.name);
    tab('term');
    print("Infiltrando " + n.name + "...", "yellow");
    
    setTimeout(() => {
        game.money += n.reward;
        game.trace += n.risk;
        print("SINCERIDADE DE DADOS COMPLETA. +$" + n.reward, "#00ff41");
        checkProgress();
        updateUI();
    }, 2000);
}

function buy(type) {
    if(type === 'bot' && game.money >= 500) {
        game.money -= 500; game.bots += 10; game.income += 5;
        print("Botnet expandida.");
    } else if(type === 'vpn' && game.money >= 300) {
        game.money -= 300; game.trace = Math.max(0, game.trace - 30);
        print("VPN Ativada.");
    }
    updateUI();
}

function checkProgress() {
    if(game.money >= 1000 && game.level === 1) {
        game.level = 2;
        game.mails.push({id:2, from:"Null_Sec", sub:"Nível 2", body:"Novos servidores disponíveis no mapa.", read:false});
        renderMails();
        drawNetwork();
    }
}

function renderMails() {
    let mDiv = document.getElementById("mails");
    mDiv.innerHTML = "";
    game.mails.forEach(m => {
        mDiv.innerHTML += `<div class="card" onclick="readMail(${m.id})" style="cursor:pointer; margin-bottom:5px; border:1px solid #00ff41; padding:5px;">
            ${m.sub} ${m.read ? '' : '<b>(NOVA)</b>'}
        </div>`;
    });
    document.getElementById("m-count").innerText = game.mails.filter(m => !m.read).length;
}

function readMail(id) {
    let m = game.mails.find(x => x.id === id);
    if(m) {
        m.read = true;
        tab('term');
        print("--- MENSAGEM ---");
        print(m.body);
        renderMails();
    }
}

function updateUI() {
    document.getElementById("money").innerText = Math.floor(game.money);
    document.getElementById("bots").innerText = game.bots;
    document.getElementById("bot-n").innerText = game.bots;
    document.getElementById("trace-txt").innerText = Math.floor(game.trace);
    document.getElementById("trace-fill").style.width = Math.min(100, game.trace) + "%";
    
    if(game.trace >= 100) {
        alert("SISTEMA RASTREADO! VOCÊ FOI PRESO.");
        localStorage.clear();
        location.reload();
    }
}

function print(t, col = "#00ff41") {
    let log = document.getElementById("log");
    log.innerHTML += `<div style="color:${col}">> ${t}</div>`;
    log.scrollTop = log.scrollHeight;
}

function alertMsg(txt) {
    let a = document.getElementById("alert");
    a.innerText = txt;
    setTimeout(() => a.innerText = "", 3000);
}

function saveGame() { if(!game.isTutorialActive) localStorage.setItem("cyberdesk_save", JSON.stringify(game)); }

// MATRIX ANIMATION
const canvas = document.getElementById("matrix");
const ctx = canvas.getContext("2d");
canvas.height = window.innerHeight; canvas.width = window.innerWidth;
const letters = "01"; const fontSize = 14; const columns = canvas.width / fontSize;
const drops = Array(Math.floor(columns)).fill(1);

function drawMatrix() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#0F0";
    ctx.font = fontSize + "px monospace";
    for(let i = 0; i < drops.length; i++) {
        const text = letters[Math.floor(Math.random() * letters.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if(drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
    }
}

init();
      
