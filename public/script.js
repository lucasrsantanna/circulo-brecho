// --- Dummy product list (replace with your real DB / CMS / API) ---
const PRODUCTS = [
  {id:1, name:"Vestido Floral Midi", price:89.90, size:"M", condition:"A", category:"Vestidos", color:"#e9785f"},
  {id:2, name:"Camisa Vintage Azul", price:59.90, size:"G", condition:"B", category:"Blusas", color:"#3b6e7a"},
  {id:3, name:"Saia Jeans", price:69.90, size:"38", condition:"A", category:"Jeans", color:"#dca53a"},
  {id:4, name:"Blazer Bege", price:119.90, size:"M", condition:"A", category:"Blazers", color:"#2b3f47"},
  {id:5, name:"Bolsa Tiracolo", price:79.90, size:"U", condition:"A", category:"Acessórios", color:"#e9785f"},
  {id:6, name:"Cropped Off-White", price:39.90, size:"P", condition:"A", category:"Blusas", color:"#3b6e7a"},
  {id:7, name:"Vestido Preto Curto", price:99.90, size:"P", condition:"A", category:"Vestidos", color:"#2b3f47"},
  {id:8, name:"Calça Wide Leg", price:89.90, size:"40", condition:"B", category:"Jeans", color:"#dca53a"}
];

// --- State ---
let filters = { q:"", cat:"Todas"};
let cart = JSON.parse(localStorage.getItem("cart")||"[]");

const els = {
  grid: document.querySelector("#grid"),
  count: document.querySelector("#cart-count"),
  drawer: document.querySelector("#cart"),
  items: document.querySelector("#cart-items"),
  total: document.querySelector("#cart-total"),
};

function currency(v){ return v.toLocaleString("pt-BR",{style:"currency",currency:"BRL"}) }

function renderGrid(){
  const q = filters.q.toLowerCase();
  const cat = filters.cat;
  const list = PRODUCTS.filter(p => 
    (cat==="Todas" || p.category===cat) && 
    (p.name.toLowerCase().includes(q))
  );
  els.grid.innerHTML = list.map(p => `
    <article class="card">
      <div class="photo" style="background:linear-gradient(135deg, ${p.color}, #ffffff66)">${p.category}</div>
      <div class="card-body">
        <h3>${p.name}</h3>
        <div class="meta">
          <span>Tam ${p.size}</span>
          <span>•</span>
          <span>Condição ${p.condition}</span>
        </div>
        <div class="meta price">${currency(p.price)}</div>
        <div class="actions">
          <button class="btn btn-outline small" onclick="viewWhats('${encodeURIComponent(p.name)}')">Perguntar no WhatsApp</button>
          <button class="btn btn-primary small" onclick='addToCart(${JSON.stringify(p).replace(/'/g,"&#39;")})'>Adicionar</button>
        </div>
      </div>
    </article>
  `).join("");
}

function viewWhats(nameEnc){
  const phone = "55SEU_NUMERO_AQUI"; // ex: 5511999999999
  const text = `Olá! Tenho interesse na peça: ${decodeURIComponent(nameEnc)}. Está disponível?`;
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`,'_blank');
}

function addToCart(p){
  const existing = cart.find(i => i.id===p.id);
  if(existing){ existing.qty += 1; } else { cart.push({...p, qty:1}); }
  persist(); renderCart();
}

function removeFromCart(id){
  cart = cart.filter(i => i.id!==id);
  persist(); renderCart();
}

function changeQty(id,delta){
  const item = cart.find(i => i.id===id);
  if(!item) return;
  item.qty += delta;
  if(item.qty<=0) removeFromCart(id);
  persist(); renderCart();
}

function persist(){
  localStorage.setItem("cart", JSON.stringify(cart));
}

function renderCart(){
  els.items.innerHTML = cart.length? cart.map(i=>`
    <div class="cart-item">
      <div class="thumb" style="background:${i.color}"></div>
      <div>
        <div style="font-weight:600">${i.name}</div>
        <div class="meta">Tam ${i.size} • Cond. ${i.condition}</div>
        <div class="meta">${currency(i.price)} x ${i.qty}</div>
      </div>
      <div style="display:flex; gap:6px; align-items:center">
        <button class="chip" onclick="changeQty(${i.id},-1)">-</button>
        <span>${i.qty}</span>
        <button class="chip" onclick="changeQty(${i.id},1)">+</button>
        <button class="chip" onclick="removeFromCart(${i.id})">remover</button>
      </div>
    </div>
  `).join("") : `<p class="note">Seu carrinho está vazio.</p>`;

  const total = cart.reduce((s,i)=>s+i.price*i.qty,0);
  els.total.textContent = currency(total);
  els.count.textContent = cart.reduce((s,i)=>s+i.qty,0);
}

function toggleCart(open){
  els.drawer.classList.toggle("open", open ?? !els.drawer.classList.contains("open"));
}

document.querySelector("#open-cart").addEventListener("click", ()=>toggleCart(true));
document.querySelector("#close-cart").addEventListener("click", ()=>toggleCart(false));

// search
document.querySelector("#search").addEventListener("input", (e)=>{
  filters.q = e.target.value; renderGrid();
});

// chips
document.querySelectorAll("[data-chip]").forEach(ch => {
  ch.addEventListener("click", ()=>{
    document.querySelectorAll("[data-chip]").forEach(c=>c.classList.remove("active"));
    ch.classList.add("active");
    filters.cat = ch.dataset.chip;
    renderGrid();
  })
})

// checkout via WhatsApp
document.querySelector("#checkout").addEventListener("click", ()=>{
  if(!cart.length) return alert("Seu carrinho está vazio.");
  const phone = "55SEU_NUMERO_AQUI"; // ex: 5511999999999
  const itemsList = cart.map(i=>`• ${i.name} (Tam ${i.size}) x${i.qty} = ${currency(i.price*i.qty)}`).join("%0A");
  const total = cart.reduce((s,i)=>s+i.price*i.qty,0);
  const msg = `Olá! Quero finalizar a compra:%0A${itemsList}%0A%0ATotal: ${currency(total)}%0A%0AForma de pagamento: Pix/Cartão`;
  window.open(`https://wa.me/${phone}?text=${msg}`,'_blank');
});

renderGrid(); renderCart();