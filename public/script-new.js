// === CIRCULÔ BRECHÓ - SITE PÚBLICO COM FIRESTORE ===
// Conecta aos dados reais cadastrados no admin

// Import Firebase (será carregado via CDN no HTML)
let app, db;
let allProducts = [];
let filteredProducts = [];

// Estado da aplicação
let filters = { q: "", cat: "Todas" };
let cart = JSON.parse(localStorage.getItem("cart") || "[]");
let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");

// Elementos DOM
const els = {
    grid: document.querySelector("#grid"),
    count: document.querySelector("#cart-count"),
    drawer: document.querySelector("#cart"),
    items: document.querySelector("#cart-items"),
    total: document.querySelector("#cart-total"),
    loading: document.querySelector("#loading") // Vamos adicionar no HTML
};

// Função utilitária para formatação de moeda
function currency(v) { 
    return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); 
}

// Inicializar Firebase
async function initializeFirebase() {
    try {
        // As configurações vêm do config.js
        app = firebase.initializeApp(window.CONFIG.FIREBASE_CONFIG);
        db = firebase.firestore();
        
        // Carregar produtos
        await loadProducts();
        
    } catch (error) {
        console.error('Erro ao inicializar Firebase:', error);
        showError('Erro ao conectar com o servidor. Tente recarregar a página.');
    }
}

// Carregar produtos do Firestore
async function loadProducts() {
    try {
        showLoading(true);
        
        // Buscar produtos disponíveis (simplificado para não precisar de índice)
        const snapshot = await db.collection('products')
            .where('status', '==', 'disponivel')
            .get();
        
        allProducts = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            allProducts.push({
                id: doc.id,
                name: data.name || 'Produto sem nome',
                price: data.price || 0,
                size: data.size || 'U',
                condition: data.condition || 'A',
                category: data.category || 'Outros',
                brand: data.brand || '',
                description: data.description || '',
                images: data.images || [],
                colorHex: data.colorHex || '#e9785f',
                uniquePiece: data.uniquePiece !== false,
                createdAt: data.createdAt,
                // Para compatibilidade com o código antigo
                color: data.colorHex || '#e9785f'
            });
        });

        // Ordenar por data de criação (mais recentes primeiro)
        allProducts.sort((a, b) => {
            const dateA = a.createdAt?.toDate?.() || new Date(0);
            const dateB = b.createdAt?.toDate?.() || new Date(0);
            return dateB - dateA;
        });
        
        // Aplicar filtros e renderizar
        applyFilters();
        
        // Adicionar filtro de favoritos
        addFavoritesFilter();
        
        showLoading(false);
        
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        showError('Erro ao carregar produtos. Tente recarregar a página.');
        showLoading(false);
    }
}

// Mostrar/ocultar loading
function showLoading(show) {
    const loadingEl = document.querySelector('#grid');
    if (show) {
        loadingEl.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #666;">
                <div style="font-size: 32px; margin-bottom: 16px;">⏳</div>
                <div>Carregando peças incríveis...</div>
            </div>
        `;
    }
}

// Mostrar erro
function showError(message) {
    const gridEl = document.querySelector('#grid');
    gridEl.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #999;">
            <div style="font-size: 32px; margin-bottom: 16px;">😔</div>
            <div>${message}</div>
            <button onclick="location.reload()" style="margin-top: 16px; padding: 8px 16px; border: 1px solid #ddd; border-radius: 8px; background: white; cursor: pointer;">
                Tentar Novamente
            </button>
        </div>
    `;
}

// Aplicar filtros
function applyFilters() {
    const q = filters.q.toLowerCase();
    const cat = filters.cat;
    
    filteredProducts = allProducts.filter(p => {
        const matchesSearch = !q || 
            p.name.toLowerCase().includes(q) ||
            (p.brand && p.brand.toLowerCase().includes(q)) ||
            (p.category && p.category.toLowerCase().includes(q));
            
        let matchesCategory;
        if (cat === "Todas") {
            matchesCategory = true;
        } else if (cat === "Favoritos") {
            matchesCategory = favorites.includes(p.id);
        } else {
            matchesCategory = p.category === cat;
        }
        
        return matchesSearch && matchesCategory;
    });
    
    renderGrid();
}

// Renderizar grid de produtos
function renderGrid() {
    if (!els.grid) return;
    
    if (filteredProducts.length === 0) {
        els.grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #666;">
                <div style="font-size: 32px; margin-bottom: 16px;">📦</div>
                <div style="font-size: 18px; margin-bottom: 8px;">Nenhuma peça encontrada</div>
                <div>Tente ajustar os filtros ou volte mais tarde para ver novidades!</div>
            </div>
        `;
        return;
    }
    
    els.grid.innerHTML = filteredProducts.map(p => `
        <article class="card" onclick="openProductModal('${p.id}')" style="cursor: pointer;">
            <div class="photo" style="background:linear-gradient(135deg, ${p.color}, #ffffff66); position: relative;">
                ${p.images && p.images.length > 0 
                    ? `<img src="${p.images[0]}" alt="${p.name}" style="width: 100%; height: 100%; object-fit: cover;" loading="lazy" onerror="this.style.display='none'">`
                    : p.category
                }
                ${p.uniquePiece ? '<div style="position: absolute; top: 8px; right: 8px; background: var(--brand-coral); color: white; padding: 4px 8px; border-radius: 12px; font-size: 10px; font-weight: 600;">✨ ÚNICA</div>' : ''}
                <button class="favorite-btn ${isFavorite(p.id) ? 'active' : ''}" onclick="event.stopPropagation(); toggleFavorite('${p.id}')" title="${isFavorite(p.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}">
                    ${isFavorite(p.id) ? '❤️' : '🤍'}
                </button>
            </div>
            <div class="card-body">
                <h3>${p.name}</h3>
                <div class="meta">
                    <span>Tam ${p.size}</span>
                    <span>•</span>
                    <span>Condição ${p.condition}</span>
                    ${p.brand ? `<span>•</span><span>${p.brand}</span>` : ''}
                </div>
                <div class="meta price">${currency(p.price)}</div>
                <div class="actions">
                    <button class="btn btn-outline small" onclick="event.stopPropagation(); viewWhats('${encodeURIComponent(p.name)}')">Perguntar no WhatsApp</button>
                    <button class="btn btn-primary small" onclick="event.stopPropagation(); addToCart(${JSON.stringify(p).replace(/'/g, "&#39;")})">Adicionar</button>
                </div>
            </div>
        </article>
    `).join("");
}

// Funções do WhatsApp e Carrinho (mantidas iguais)
function viewWhats(nameEnc) {
    const phone = window.CONFIG.WHATSAPP_PHONE || "5511999999999";
    const text = `Olá! Tenho interesse na peça: ${decodeURIComponent(nameEnc)}. Está disponível?`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
}

function addToCart(p) {
    const existing = cart.find(i => i.id === p.id);
    if (existing) { 
        existing.qty += 1; 
    } else { 
        cart.push({ ...p, qty: 1 }); 
    }
    persist(); 
    renderCart();
}

function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    persist(); 
    renderCart();
}

function changeQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) removeFromCart(id);
    persist(); 
    renderCart();
}

function persist() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function renderCart() {
    if (!els.items || !els.total || !els.count) return;
    
    els.items.innerHTML = cart.length ? cart.map(i => `
        <div class="cart-item">
            <div class="thumb" style="background:${i.color}"></div>
            <div>
                <div style="font-weight:600">${i.name}</div>
                <div class="meta">Tam ${i.size} • Cond. ${i.condition}</div>
                <div class="meta">${currency(i.price)} x ${i.qty}</div>
            </div>
            <div style="display:flex; gap:6px; align-items:center">
                <button class="chip" onclick="changeQty('${i.id}',-1)">-</button>
                <span>${i.qty}</span>
                <button class="chip" onclick="changeQty('${i.id}',1)">+</button>
                <button class="chip" onclick="removeFromCart('${i.id}')">remover</button>
            </div>
        </div>
    `).join("") : `<p class="note">Seu carrinho está vazio.</p>`;

    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    els.total.textContent = currency(total);
    els.count.textContent = cart.reduce((s, i) => s + i.qty, 0);
}

function toggleCart(open) {
    if (!els.drawer) return;
    els.drawer.classList.toggle("open", open ?? !els.drawer.classList.contains("open"));
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar Firebase
    initializeFirebase();
    
    // Carrinho
    const openCartBtn = document.querySelector("#open-cart");
    const closeCartBtn = document.querySelector("#close-cart");
    
    if (openCartBtn) openCartBtn.addEventListener("click", () => toggleCart(true));
    if (closeCartBtn) closeCartBtn.addEventListener("click", () => toggleCart(false));

    // Busca
    const searchInput = document.querySelector("#search");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            filters.q = e.target.value;
            applyFilters();
        });
    }

    // Chips de categoria
    document.querySelectorAll("[data-chip]").forEach(ch => {
        ch.addEventListener("click", () => {
            document.querySelectorAll("[data-chip]").forEach(c => c.classList.remove("active"));
            ch.classList.add("active");
            filters.cat = ch.dataset.chip;
            applyFilters();
        });
    });

    // Checkout via WhatsApp
    const checkoutBtn = document.querySelector("#checkout");
    if (checkoutBtn) {
        checkoutBtn.addEventListener("click", () => {
            if (!cart.length) return alert("Seu carrinho está vazio.");
            
            const phone = window.CONFIG.WHATSAPP_PHONE || "5511999999999";
            const itemsList = cart.map(i => `• ${i.name} (Tam ${i.size}) x${i.qty} = ${currency(i.price * i.qty)}`).join("%0A");
            const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
            const msg = `Olá! Quero finalizar a compra:%0A${itemsList}%0A%0ATotal: ${currency(total)}%0A%0AForma de pagamento: Pix/Cartão`;
            window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
        });
    }

    // Renderizar carrinho inicial
    renderCart();
});

// === MODAL DE PRODUTO ===
let currentModalProduct = null;
let currentImageIndex = 0;

function openProductModal(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    currentModalProduct = product;
    currentImageIndex = 0;
    
    // Preencher informações do produto
    document.getElementById('modalProductName').textContent = product.name;
    document.getElementById('modalProductPrice').textContent = currency(product.price);
    document.getElementById('modalProductSize').textContent = product.size;
    document.getElementById('modalProductCondition').textContent = product.condition;
    document.getElementById('modalProductBrandDetail').textContent = product.brand || 'Não informado';
    document.getElementById('modalProductDescription').textContent = product.description || 'Nenhuma descrição disponível.';
    
    // Badge única
    const uniqueBadge = document.getElementById('modalUniqueBadge');
    if (product.uniquePiece) {
        uniqueBadge.style.display = 'inline-block';
    } else {
        uniqueBadge.style.display = 'none';
    }
    
    // Marca (ocultar se vazia)
    const brandRow = document.getElementById('modalBrandRow');
    if (product.brand) {
        brandRow.style.display = 'flex';
    } else {
        brandRow.style.display = 'none';
    }
    
    // Configurar galeria
    setupModalGallery(product.images || []);
    
    // Configurar botões de ação
    setupModalActions(product);
    
    // Mostrar modal
    document.getElementById('productModal').classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeProductModal() {
    document.getElementById('productModal').classList.remove('show');
    document.body.style.overflow = '';
    currentModalProduct = null;
    currentImageIndex = 0;
}

function setupModalGallery(images) {
    const mainImage = document.getElementById('modalMainImage');
    const thumbnailNav = document.getElementById('thumbnailNav');
    const imageCounter = document.getElementById('imageCounter');
    const prevBtn = document.querySelector('.nav-btn.prev');
    const nextBtn = document.querySelector('.nav-btn.next');
    
    if (!images || images.length === 0) {
        // Sem imagens - mostrar placeholder
        mainImage.src = '';
        mainImage.style.display = 'none';
        thumbnailNav.innerHTML = '';
        imageCounter.textContent = '0 / 0';
        prevBtn.disabled = true;
        nextBtn.disabled = true;
        return;
    }
    
    // Configurar imagem principal
    mainImage.src = images[0];
    mainImage.style.display = 'block';
    mainImage.alt = currentModalProduct.name;
    
    // Contador
    imageCounter.textContent = `1 / ${images.length}`;
    
    // Thumbnails
    if (images.length > 1) {
        thumbnailNav.innerHTML = images.map((img, index) => `
            <div class="thumbnail ${index === 0 ? 'active' : ''}" onclick="showImage(${index})">
                <img src="${img}" alt="Imagem ${index + 1}">
            </div>
        `).join('');
        
        // Navegação
        prevBtn.disabled = true;
        nextBtn.disabled = images.length <= 1;
    } else {
        thumbnailNav.innerHTML = '';
        prevBtn.disabled = true;
        nextBtn.disabled = true;
    }
}

function showImage(index) {
    if (!currentModalProduct || !currentModalProduct.images) return;
    
    const images = currentModalProduct.images;
    if (index < 0 || index >= images.length) return;
    
    currentImageIndex = index;
    
    // Atualizar imagem principal
    const mainImage = document.getElementById('modalMainImage');
    mainImage.src = images[index];
    
    // Atualizar contador
    document.getElementById('imageCounter').textContent = `${index + 1} / ${images.length}`;
    
    // Atualizar thumbnails
    document.querySelectorAll('.thumbnail').forEach((thumb, i) => {
        thumb.classList.toggle('active', i === index);
    });
    
    // Atualizar botões de navegação
    const prevBtn = document.querySelector('.nav-btn.prev');
    const nextBtn = document.querySelector('.nav-btn.next');
    
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === images.length - 1;
}

function prevImage() {
    showImage(currentImageIndex - 1);
}

function nextImage() {
    showImage(currentImageIndex + 1);
}

function setupModalActions(product) {
    const whatsappBtn = document.getElementById('modalWhatsappBtn');
    const addToCartBtn = document.getElementById('modalAddToCartBtn');
    
    // Botão WhatsApp
    whatsappBtn.onclick = () => {
        viewWhats(encodeURIComponent(product.name));
    };
    
    // Botão adicionar ao carrinho
    addToCartBtn.onclick = () => {
        addToCart(product);
        closeProductModal();
    };
}

// Fechar modal com ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.getElementById('productModal').classList.contains('show')) {
        closeProductModal();
    }
});

// Navegação com setas do teclado
document.addEventListener('keydown', (e) => {
    if (!document.getElementById('productModal').classList.contains('show')) return;
    
    if (e.key === 'ArrowLeft') {
        prevImage();
    } else if (e.key === 'ArrowRight') {
        nextImage();
    }
});

// === SISTEMA DE FAVORITOS ===
function isFavorite(productId) {
    return favorites.includes(productId);
}

function toggleFavorite(productId) {
    const index = favorites.indexOf(productId);
    
    if (index > -1) {
        // Remover dos favoritos
        favorites.splice(index, 1);
    } else {
        // Adicionar aos favoritos
        favorites.push(productId);
    }
    
    // Salvar no localStorage
    localStorage.setItem("favorites", JSON.stringify(favorites));
    
    // Re-renderizar grid para atualizar ícones
    renderGrid();
    
    // Mostrar feedback
    const product = allProducts.find(p => p.id === productId);
    if (product) {
        showFavoritesFeedback(product.name, index === -1);
    }
}

function showFavoritesFeedback(productName, isAdded) {
    // Criar elemento de feedback
    const feedback = document.createElement('div');
    feedback.className = 'favorites-feedback';
    feedback.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${isAdded ? '#28a745' : '#dc3545'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-weight: 600;
        z-index: 2000;
        animation: fadeInOut 3s ease;
        max-width: 90%;
        text-align: center;
    `;
    
    feedback.textContent = isAdded 
        ? `❤️ ${productName} adicionado aos favoritos!`
        : `💔 ${productName} removido dos favoritos`;
    
    // Adicionar CSS da animação se não existir
    if (!document.querySelector('#favorites-animation-styles')) {
        const style = document.createElement('style');
        style.id = 'favorites-animation-styles';
        style.textContent = `
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translateX(-50%) translateY(20px); }
                20% { opacity: 1; transform: translateX(-50%) translateY(0); }
                80% { opacity: 1; transform: translateX(-50%) translateY(0); }
                100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Adicionar ao body
    document.body.appendChild(feedback);
    
    // Remover após a animação
    setTimeout(() => {
        if (feedback.parentNode) {
            feedback.parentNode.removeChild(feedback);
        }
    }, 3000);
}

function getFavoriteProducts() {
    return allProducts.filter(p => favorites.includes(p.id));
}

// Adicionar filtro de favoritos aos chips existentes
function addFavoritesFilter() {
    const chipsContainer = document.querySelector('.chips');
    if (!chipsContainer || document.querySelector('[data-chip="Favoritos"]')) return;
    
    const favoritesChip = document.createElement('button');
    favoritesChip.className = 'chip';
    favoritesChip.setAttribute('data-chip', 'Favoritos');
    favoritesChip.innerHTML = '❤️ Favoritos';
    
    // Inserir após o chip "Todas"
    const todasChip = document.querySelector('[data-chip="Todas"]');
    if (todasChip && todasChip.nextElementSibling) {
        chipsContainer.insertBefore(favoritesChip, todasChip.nextElementSibling);
    } else {
        chipsContainer.appendChild(favoritesChip);
    }
    
    // Adicionar event listener
    favoritesChip.addEventListener("click", () => {
        document.querySelectorAll("[data-chip]").forEach(c => c.classList.remove("active"));
        favoritesChip.classList.add("active");
        filters.cat = "Favoritos";
        applyFilters();
    });
}