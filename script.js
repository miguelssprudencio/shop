const products = [
    {
        id: 1,
        name: "Fone de Ouvido Sem Fio X10",
        description: "Áudio imersivo e bateria de longa duração. Perfeito para o dia a dia.",
        price: 299.90,
        category: "áudio",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
    },
    {
        id: 2,
        name: "Smartwatch Ultra Pro",
        description: "Monitore sua saúde e receba notificações no pulso.",
        price: 799.00,
        category: "wearables",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
    },
    {
        id: 3,
        name: "Câmera Digital 4K Compacta",
        description: "Capture momentos incríveis com qualidade cinematográfica.",
        price: 1250.00,
        category: "fotografia",
        image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
    },
    {
        id: 4,
        name: "Teclado Mecânico RGB Gamer",
        description: "Precisão e estilo para suas sessões de jogo.",
        price: 450.00,
        category: "periféricos",
        image: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
    },
    {
        id: 5,
        name: "Mouse Ergonômico Sem Fio",
        description: "Conforto e produtividade para longas horas de trabalho.",
        price: 180.00,
        category: "periféricos",
        image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
    },
    {
        id: 6,
        name: "Tablet Pro Max 12.9",
        description: "Potência e versatilidade para trabalho e entretenimento.",
        price: 3500.00,
        category: "tablets",
        image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
    },
    {
        id: 7,
        name: "Caixa de Som Bluetooth",
        description: "Som potente e resistente à água para qualquer lugar.",
        price: 350.00,
        category: "áudio",
        image: "https://images.unsplash.com/photo-1608156639585-b3a032ef9689?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
    },
    {
        id: 8,
        name: "Lente Fotográfica 50mm",
        description: "Nitidez excepcional para retratos profissionais.",
        price: 890.00,
        category: "fotografia",
        image: "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
    }
];

// Estado da Aplicação
let cart = [];

// Elementos do DOM
const productsGrid = document.getElementById('products-grid');
const filterBtns = document.querySelectorAll('.filter-btn');
const cartBtn = document.getElementById('cart-btn');
const cartModal = document.getElementById('cart-modal');
const closeCart = document.getElementById('close-cart');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalValue = document.getElementById('cart-total-value');
const cartCount = document.getElementById('cart-count');
const themeToggle = document.getElementById('theme-toggle');

// ==================== GERENCIAMENTO DE TEMA ====================

function initTheme() {
    // Verificar preferência salva no localStorage
    const savedTheme = localStorage.getItem('theme');
    
    // Se não houver preferência salva, usar preferência do sistema
    if (!savedTheme) {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
            enableDarkMode();
        } else {
            enableLightMode();
        }
    } else if (savedTheme === 'dark') {
        enableDarkMode();
    } else {
        enableLightMode();
    }
}

function enableDarkMode() {
    document.body.classList.add('dark-mode');
    localStorage.setItem('theme', 'dark');
    updateThemeIcon();
}

function enableLightMode() {
    document.body.classList.remove('dark-mode');
    localStorage.setItem('theme', 'light');
    updateThemeIcon();
}

function updateThemeIcon() {
    const isDarkMode = document.body.classList.contains('dark-mode');
    const icon = themeToggle.querySelector('i');
    
    if (isDarkMode) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
}

function toggleTheme() {
    const isDarkMode = document.body.classList.contains('dark-mode');
    
    if (isDarkMode) {
        enableLightMode();
    } else {
        enableDarkMode();
    }
    
    // Animar o botão
    themeToggle.style.animation = 'none';
    setTimeout(() => {
        themeToggle.style.animation = 'spin 0.6s ease';
    }, 10);
}

// ==================== INICIALIZAÇÃO ====================

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    displayProducts(products);
    setupFilters();
    setupCartEvents();
    setupScrollAnimations();
    setupSmoothScroll();
    setupThemeToggle();
});

// ==================== SETUP DO BOTÃO DE TEMA ====================

function setupThemeToggle() {
    themeToggle.addEventListener('click', toggleTheme);
}

// ==================== ANIMAÇÕES DE SCROLL ====================

function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.8s ease forwards';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observar cards de produtos
    document.querySelectorAll('.product-card').forEach(card => {
        observer.observe(card);
    });

    // Observar seções
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
}

// ==================== SCROLL SUAVE ====================

function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ==================== EXIBIÇÃO DE PRODUTOS ====================

function displayProducts(productsToDisplay) {
    productsGrid.innerHTML = '';
    
    productsToDisplay.forEach((product, index) => {
        const productCard = document.createElement('div');
        productCard.classList.add('product-card');
        productCard.style.animationDelay = `${index * 0.1}s`;
        productCard.innerHTML = `
            <div class="product-img">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
            </div>
            <div class="product-info">
                <span class="product-category">${product.category}</span>
                <h3 class="product-title">${product.name}</h3>
                <p class="product-price">R$ ${product.price.toFixed(2).replace('.', ',')}</p>
                <button class="add-to-cart-btn" onclick="addToCart(${product.id})">Adicionar ao Carrinho</button>
            </div>
        `;
        productsGrid.appendChild(productCard);
    });

    // Re-observar novos cards
    setupScrollAnimations();
}

// ==================== FILTROS ====================

function setupFilters() {
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Atualizar botões ativos com animação
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Animar grid
            productsGrid.style.opacity = '0.5';
            productsGrid.style.transform = 'scale(0.98)';
            
            setTimeout(() => {
                const filter = btn.getAttribute('data-filter');
                
                if (filter === 'todos') {
                    displayProducts(products);
                } else {
                    const filteredProducts = products.filter(p => p.category === filter);
                    displayProducts(filteredProducts);
                }
                
                productsGrid.style.opacity = '1';
                productsGrid.style.transform = 'scale(1)';
            }, 300);
        });
    });
}

// ==================== EVENTOS DO CARRINHO ====================

function setupCartEvents() {
    cartBtn.addEventListener('click', () => {
        cartModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
    
    closeCart.addEventListener('click', () => {
        cartModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    });
    
    // Fechar modal ao clicar fora dele
    window.addEventListener('click', (e) => {
        if (e.target === cartModal) {
            cartModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });

    // Fechar com tecla ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && cartModal.classList.contains('active')) {
            cartModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
}

// ==================== ADICIONAR AO CARRINHO ====================

window.addToCart = function(productId) {
    const product = products.find(p => p.id === productId);
    
    // Verificar se o produto já está no carrinho
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    updateCart();
    
    // Feedback visual com animação
    const btn = event.target;
    const originalText = btn.innerText;
    btn.innerText = "✓ Adicionado!";
    btn.style.backgroundColor = "#1ABC9C";
    btn.disabled = true;
    
    // Animar o ícone do carrinho
    animateCartIcon();
    
    setTimeout(() => {
        btn.innerText = originalText;
        btn.style.backgroundColor = "";
        btn.disabled = false;
    }, 1500);
};

// ==================== ANIMAÇÃO DO ÍCONE DO CARRINHO ====================

function animateCartIcon() {
    const cartIcon = document.querySelector('.cart-icon');
    cartIcon.style.animation = 'none';
    setTimeout(() => {
        cartIcon.style.animation = 'pulse 0.6s ease';
    }, 10);
}

// ==================== REMOVER DO CARRINHO ====================

window.removeFromCart = function(productId) {
    const itemIndex = cart.findIndex(item => item.id === productId);
    if (itemIndex > -1) {
        const cartItem = cartItemsContainer.children[itemIndex];
        cartItem.style.animation = 'slideOutRight 0.4s ease forwards';
        
        setTimeout(() => {
            cart.splice(itemIndex, 1);
            updateCart();
        }, 400);
    }
};

// ==================== ATUALIZAR INTERFACE DO CARRINHO ====================

function updateCart() {
    // Atualizar contador
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.innerText = totalItems;
    
    // Animar mudança do contador
    cartCount.style.animation = 'none';
    setTimeout(() => {
        cartCount.style.animation = 'pulse 0.6s ease';
    }, 10);
    
    // Atualizar lista de itens
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Seu carrinho está vazio.</p>';
    } else {
        cartItemsContainer.innerHTML = '';
        cart.forEach((item, index) => {
            const cartItem = document.createElement('div');
            cartItem.classList.add('cart-item');
            cartItem.style.animationDelay = `${index * 0.05}s`;
            cartItem.innerHTML = `
                <div class="cart-item-img">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="cart-item-info">
                    <h4 class="cart-item-title">${item.name}</h4>
                    <p class="cart-item-price">${item.quantity}x R$ ${item.price.toFixed(2).replace('.', ',')}</p>
                    <span class="cart-item-remove" onclick="removeFromCart(${item.id})">Remover</span>
                </div>
            `;
            cartItemsContainer.appendChild(cartItem);
        });
    }
    
    // Atualizar total
    const totalValue = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotalValue.innerText = `R$ ${totalValue.toFixed(2).replace('.', ',')}`;
}

// ==================== MENU MOBILE ====================

const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

mobileMenuBtn.addEventListener('click', () => {
    mobileMenuBtn.style.animation = 'spin 0.6s ease';
    setTimeout(() => {
        mobileMenuBtn.style.animation = '';
    }, 600);
});

// ==================== EFEITO PARALLAX NO SCROLL ====================

window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.hero-image img');
    
    parallaxElements.forEach(element => {
        element.style.transform = `translateY(${scrolled * 0.5}px)`;
    });

    // Aurora parallax effect
    const aurora = document.querySelector('.aurora-background');
    if (aurora) {
        aurora.style.transform = `translateY(${scrolled * 0.1}px)`;
    }
});

// ==================== ANIMAÇÃO DE ENTRADA NA PÁGINA ====================

window.addEventListener('load', () => {
    document.body.style.opacity = '1';
});

// ==================== ADICIONAR ANIMAÇÕES CSS DINÂMICAS ====================

const style = document.createElement('style');
style.textContent = `
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }

    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }
`;
document.head.appendChild(style);