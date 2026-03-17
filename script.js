let money = 0
let level = 1
let trace = 0
let currentMission = null

const terminal = document.getElementById("terminalOutput")

function print(text){
terminal.innerHTML += text + "<br>"
terminal.scrollTop = terminal.scrollHeight
}

function startMission(type){

currentMission = type

print("Nova missão iniciada...")

if(type==="wifi"){
print("Objetivo: quebrar senha WiFi")
print("Use comando: scan")
}

if(type==="data"){
print("Objetivo: roubar dados")
print("Use comando: breach")
}

if(type==="bank"){
print("Objetivo: invadir banco")
print("Use comando: bypass")
}

}

function handleCommand(event){

if(event.key!=="Enter") return

let input = document.getElementById("commandInput")
let cmd = input.value
input.value=""

print("> "+cmd)

if(!currentMission){
print("Nenhuma missão ativa.")
return
}

if(currentMission==="wifi" && cmd==="scan"){
success(200)
}

else if(currentMission==="data" && cmd==="breach"){
success(500)
}

else if(currentMission==="bank" && cmd==="bypass"){
success(1000)
}

else{
print("Comando inválido.")
trace += 10
}

updateStats()

}

function success(amount){

print("Hack concluído!")

money += amount
trace += 5

if(money>1000) level = 2
if(money>3000) level = 3

currentMission = null

updateStats()

}

function updateStats(){

document.getElementById("money").innerText = money
document.getElementById("level").innerText = level
document.getElementById("trace").innerText = trace

if(trace>=100){
print("VOCÊ FOI RASTREADO. GAME OVER.")
}

  }
