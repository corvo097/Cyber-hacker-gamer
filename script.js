let game={
money:0,
bots:0,
trace:0,
defLevel:1
}

const nodes=[
{x:100,y:200,name:"Wifi",reward:100},
{x:300,y:100,name:"Empresa",reward:800},
{x:500,y:250,name:"Banco",reward:5000}
]

function init(){

drawNetwork()

setInterval(()=>{
game.money+=game.bots
updateUI()
},1000)

}

function tab(id){

document.querySelectorAll(".tab")
.forEach(t=>t.classList.remove("active"))

document.getElementById("t-"+id)
.classList.add("active")

}

function drawNetwork(){

let canvas=document.getElementById("network")
let ctx=canvas.getContext("2d")

canvas.width=canvas.offsetWidth
canvas.height=canvas.offsetHeight

ctx.strokeStyle="#00ff41"

for(let i=0;i<nodes.length-1;i++){

ctx.beginPath()
ctx.moveTo(nodes[i].x,nodes[i].y)
ctx.lineTo(nodes[i+1].x,nodes[i+1].y)
ctx.stroke()

}

nodes.forEach(n=>{

ctx.fillStyle="#00ff41"
ctx.beginPath()
ctx.arc(n.x,n.y,6,0,Math.PI*2)
ctx.fill()

})

canvas.onclick=e=>{

let rect=canvas.getBoundingClientRect()

let x=e.clientX-rect.left
let y=e.clientY-rect.top

nodes.forEach(n=>{

let dist=Math.hypot(n.x-x,n.y-y)

if(dist<10) hack(n)

})

}

}

function hack(n){

alertMsg("HACKING "+n.name)

document.getElementById("hackSound").play()

codeRain()

setTimeout(()=>{

game.money+=n.reward
game.trace+=10
updateUI()

print("Hack concluído "+n.name)

},2000)

}

function codeRain(){

let log=document.getElementById("log")

let chars="010101010101"

for(let i=0;i<20;i++){

let line=""

for(let j=0;j<40;j++)
line+=chars[Math.floor(Math.random()*chars.length)]

log.innerHTML+="<div>"+line+"</div>"

}

}

function alertMsg(txt){

let a=document.getElementById("alert")

a.innerText=txt

setTimeout(()=>a.innerText="",2000)

}

function buy(type){

if(type==="bot"&&game.money>=500){

game.money-=500
game.bots+=5

}

updateUI()

}

function updateUI(){

money.innerText=Math.floor(game.money)
bots.innerText=game.bots
trace_txt.innerText=Math.floor(game.trace)
trace_fill.style.width=game.trace+"%"

}

function print(t){

let log=document.getElementById("log")

log.innerHTML+="<div>> "+t+"</div>"

log.scrollTop=log.scrollHeight

}

init()



/* MATRIX */

const canvas=document.getElementById("matrix")
const ctx=canvas.getContext("2d")

canvas.height=window.innerHeight
canvas.width=window.innerWidth

const letters="01"
const fontSize=14
const columns=canvas.width/fontSize

const drops=[]

for(let i=0;i<columns;i++)
drops[i]=1

function draw(){

ctx.fillStyle="rgba(0,0,0,0.05)"
ctx.fillRect(0,0,canvas.width,canvas.height)

ctx.fillStyle="#0F0"
ctx.font=fontSize+"px monospace"

for(let i=0;i<drops.length;i++){

const text=letters[Math.floor(Math.random()*letters.length)]

ctx.fillText(text,i*fontSize,drops[i]*fontSize)

if(drops[i]*fontSize>canvas.height && Math.random()>0.975)
drops[i]=0

drops[i]++

}

}

setInterval(draw,33)
