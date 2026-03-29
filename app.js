const STORAGE_LISTA="feira_lista_v2"
const STORAGE_ULTIMA="feira_ultima_v2"

let lista=JSON.parse(localStorage.getItem(STORAGE_LISTA))||[]
let ultima=JSON.parse(localStorage.getItem(STORAGE_ULTIMA))||[]

function salvarLista(){
localStorage.setItem(STORAGE_LISTA,JSON.stringify(lista))
}

function formatar(v){
return v.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})
}

function mostrarTela(id){

document.querySelectorAll(".tela").forEach(t=>t.classList.remove("ativa"))
document.querySelectorAll(".aba").forEach(a=>a.classList.remove("ativa"))

document.getElementById(id).classList.add("ativa")

event.target.classList.add("ativa")

renderizar()

}

function adicionarItem(){

let nome=document.getElementById("nomeItem").value.trim()
let qtd=Number(document.getElementById("qtdItem").value)

if(!nome||!qtd)return alert("Preencha os campos")

lista.push({id:Date.now(),nome,qtd,preco:0})

salvarLista()

document.getElementById("nomeItem").value=""
document.getElementById("qtdItem").value=""

renderizar()

}

function removerItem(id){

lista=lista.filter(i=>i.id!=id)

salvarLista()

renderizar()

}

function atualizarPreco(id,v){

lista=lista.map(i=>{

if(i.id==id)i.preco=Number(v)

return i

})

salvarLista()

renderizar()

}

function subtotal(i){
return i.qtd*i.preco
}

function renderizar(){

renderCadastro()
renderFeira()
renderComparacao()

}

function renderCadastro(){

let el=document.getElementById("listaCadastro")
el.innerHTML=""

lista.forEach(i=>{

let li=document.createElement("li")
li.className="item"

li.innerHTML=`
<strong>${i.nome}</strong><br>
${i.qtd} unidades
<br>
<button onclick="removerItem(${i.id})">Excluir</button>
`

el.appendChild(li)

})

}

function renderFeira(){

let el=document.getElementById("listaFeira")
el.innerHTML=""

let total=0

lista.forEach(i=>{

let sub=subtotal(i)

total+=sub

let li=document.createElement("li")
li.className="item"

li.innerHTML=`

<strong>${i.nome}</strong><br>
${i.qtd} unidades

<div class="preco">

<input type="number"
placeholder="Preço"
value="${i.preco}"
onchange="atualizarPreco(${i.id},this.value)">

<div class="subtotal">${formatar(sub)}</div>

</div>
`

el.appendChild(li)

})

document.getElementById("totalItens").innerText=lista.length
document.getElementById("valorTotal").innerText=formatar(total)

}

function salvarUltimaFeira(){

if(lista.length==0)return alert("Lista vazia")

ultima=JSON.parse(JSON.stringify(lista))

localStorage.setItem(STORAGE_ULTIMA,JSON.stringify(ultima))

alert("Última feira salva!")

}

function restaurarUltimaLista(){

if(!ultima.length)return alert("Nenhuma feira salva")

lista=ultima.map(i=>({...i,preco:0,id:Date.now()+Math.random()}))

salvarLista()

renderizar()

}

function renderComparacao(){

let el=document.getElementById("comparacaoLista")
el.innerHTML=""

if(!ultima.length)return el.innerHTML="Sem feira anterior"

lista.forEach(i=>{

let base=ultima.find(x=>x.nome.toLowerCase()==i.nome.toLowerCase())

if(!base)return

let dif=i.preco-base.preco
let perc=base.preco?((dif/base.preco)*100):0

let classe=""

let status=""

if(dif>0){
classe="maisCaro"
status="⬆ Mais caro"
}
else if(dif<0){
classe="maisBarato"
status="⬇ Mais barato"
}
else{
status="➖ Igual"
}

let div=document.createElement("div")
div.className="comparacaoItem"

div.innerHTML=`

<strong>${i.nome}</strong>

Preço anterior: ${formatar(base.preco)}<br>

Preço atual: ${formatar(i.preco)}<br>

Diferença: ${formatar(dif)} (${perc.toFixed(1)}%)

<div class="${classe}">${status}</div>

`

el.appendChild(div)

})

}

renderizar()

if("serviceWorker" in navigator){
navigator.serviceWorker.register("sw.js")
}
