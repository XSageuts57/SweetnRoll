// script.js mejorado
document.addEventListener('DOMContentLoaded', function() {
  // Menú responsive
  const toggle = document.getElementById("menu-toggle");
  const nav = document.getElementById("nav");
  
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      nav.classList.toggle("show");
    });
  }

  // Efecto scroll en navbar
  window.addEventListener("scroll", () => {
    const header = document.querySelector(".site-header");
    if (header) {
      header.classList.toggle("scrolled", window.scrollY > 50);
    }
  });

  // Observador de intersección mejorado
  const initScrollAnimations = () => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px" // Activa la animación 50px antes de que el elemento entre en la vista
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const delay = entry.target.dataset.delay || 0;
          
          setTimeout(() => {
            entry.target.classList.add("show");
            
            // Opcional: dejar de observar después de animar para mejor rendimiento
            observer.unobserve(entry.target);
          }, delay);
        }
      });
    }, observerOptions);

    // Observar todos los elementos con efectos
    document.querySelectorAll('.fade-in, .scale-in, .rotate-in').forEach(el => {
      observer.observe(el);
    });

    // Forzar animación de elementos visibles al cargar
    const checkVisibleElements = () => {
      document.querySelectorAll('.fade-in:not(.show), .scale-in:not(.show), .rotate-in:not(.show)').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.9 && rect.bottom > 0) {
          const delay = el.dataset.delay || 0;
          setTimeout(() => el.classList.add("show"), delay);
        }
      });
    };

    // Verificar elementos visibles al cargar y después de un pequeño delay
    checkVisibleElements();
    setTimeout(checkVisibleElements, 300);
  };

  // Inicializar animaciones
  initScrollAnimations();

  // Efecto ripple para botones
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      ripple.classList.add('ripple-effect');
      
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      
      btn.appendChild(ripple);
      
      setTimeout(() => ripple.remove(), 600);
    });
  });

  // Smooth scroll para enlaces internos
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      const target = targetId === '#' ? document.body : document.querySelector(targetId);
      
      if (target) {
        const headerHeight = document.querySelector('.site-header')?.offsetHeight || 80;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
});

// Carrito functionality
document.addEventListener('DOMContentLoaded', function() {
  const cartButton = document.getElementById('cartButton');
  const cartDropdown = document.getElementById('cartDropdown');
  const closeCart = document.querySelector('.close-cart');
  const cartItems = document.querySelector('.cart-items');
  const cartCount = document.querySelector('.cart-count');
  const cartTotal = document.querySelector('.cart-total span');
  const cartOverlay = document.createElement('div');
  cartOverlay.className = 'cart-overlay';
  document.body.appendChild(cartOverlay);
  
  const pedidoForm = document.getElementById('pedidoForm');
  const resumenCarrito = document.getElementById('resumenCarrito');
  const volverCarritoBtn = document.getElementById('volverCarrito');

  let cart = [];
  
  // Event listeners
  cartButton.addEventListener('click', function(e) {
    e.preventDefault();
    cartDropdown.classList.add('active');
    cartOverlay.classList.add('active');
    document.body.classList.add('cart-open');
  });
  
  closeCart.addEventListener('click', function() {
    closeCartFunction();
  });
  
  cartOverlay.addEventListener('click', function() {
    closeCartFunction();
  });
  
  // Add to cart buttons
  document.querySelectorAll('.btn-add').forEach(button => {
    button.addEventListener('click', function() {
      const card = this.closest('.sabor-card');
      const name = card.querySelector('h3').textContent;
      const priceText = card.querySelector('.precio').textContent;
      
      // Extraer el precio del texto "S/. X.XX"
      const price = parseFloat(priceText.replace('S/.', '').replace('S/', '').trim());
      
      addToCart(name, price);
      updateCartUI();
      
      // Efecto de confirmación
      this.textContent = "✓ Agregado";
      this.style.background = "var(--success)";
      setTimeout(() => {
        this.textContent = "+ Añadir al Pedido";
        this.style.background = "";
      }, 1500);
    });
  });
  
  // Finalizar pedido - Ahora llena el formulario
  document.querySelector('.checkout-btn').addEventListener('click', function() {
    if (cart.length === 0) return;
    
    // Cerrar carrito
    closeCartFunction();
    
    // Llenar resumen en el formulario
    fillOrderForm();
    
    // Desplazarse al formulario
    const formSection = document.getElementById('contacto');
    const headerHeight = document.querySelector('.site-header').offsetHeight;
    const targetPosition = formSection.offsetTop - headerHeight;
    
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  });
  
  // Volver al carrito desde el formulario
  volverCarritoBtn.addEventListener('click', function() {
    cartButton.click(); // Abre el carrito
  });
  
  // Enviar formulario por WhatsApp
  pedidoForm.addEventListener('submit', function(e) {
    e.preventDefault();
    sendWhatsAppOrder();
  });
  
  // Cart functions
  function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);
    
    if (existingItem) {
      existingItem.quantity++;
    } else {
      cart.push({
        name,
        price,
        quantity: 1
      });
    }
  }
  
  function updateCartUI() {
    // Update count
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Update items list
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
      cartItems.innerHTML = '<p class="empty-cart">Tu carrito está vacío</p>';
    } else {
      cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
          <div class="cart-item-info">
            <h4>${item.name}</h4>
            <p>S/ ${item.price.toFixed(2)} c/u</p>
          </div>
          <div class="cart-item-quantity">
            <button class="quantity-btn minus" data-name="${item.name}">-</button>
            <span>${item.quantity}</span>
            <button class="quantity-btn plus" data-name="${item.name}">+</button>
          </div>
          <div class="item-total">
            S/ ${(item.price * item.quantity).toFixed(2)}
          </div>
        `;
        cartItems.appendChild(cartItem);
      });
      
      // Add event listeners to quantity buttons
      document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
        btn.addEventListener('click', function() {
          updateQuantity(this.dataset.name, -1);
        });
      });
      
      document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
        btn.addEventListener('click', function() {
          updateQuantity(this.dataset.name, 1);
        });
      });
    }
    
    // Update total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `S/ ${total.toFixed(2)}`;
  }
  
  function updateQuantity(name, change) {
    const item = cart.find(item => item.name === name);
    if (item) {
      item.quantity += change;
      if (item.quantity <= 0) {
        cart = cart.filter(i => i.name !== name);
      }
      updateCartUI();
    }
  }
  
  function closeCartFunction() {
    cartDropdown.classList.remove('active');
    cartOverlay.classList.remove('active');
    document.body.classList.remove('cart-open');
  }
  
  function fillOrderForm() {
    let html = '';
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    cart.forEach(item => {
      html += `
        <div class="resumen-item">
          <span>${item.quantity}x ${item.name}</span>
          <span>S/ ${(item.price * item.quantity).toFixed(2)}</span>
        </div>
      `;
    });
    
    html += `
      <div class="resumen-total">
        <span>Total:</span>
        <span>S/ ${total.toFixed(2)}</span>
      </div>
    `;
    
    resumenCarrito.innerHTML = html;
  }
  
function sendWhatsAppOrder() {
  const formData = new FormData(pedidoForm);
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Usar emojis directamente en lugar de caracteres Unicode
  let message = "🍩 *PEDIDO SWEET'N ROLL* 🍩\n\n";
  
  message += "*INFORMACIÓN DEL CLIENTE*\n";
  message += `👤 Nombre: ${formData.get('nombre')}\n`;
  message += `📞 Teléfono: ${formData.get('telefono')}\n`;
  
  if (formData.get('dni')) {
    message += `🆔 DNI: ${formData.get('dni')}\n`;
  }
  
  if (formData.get('email')) {
    message += `📧 Email: ${formData.get('email')}\n`;
  }
  
  message += "\n*INFORMACIÓN DE ENTREGA*\n";
  message += `📍 Dirección: ${formData.get('direccion')}\n`;
  
  // Formatear fecha y hora de manera más legible
  const fecha = new Date(formData.get('fecha') + 'T' + formData.get('hora'));
  const opcionesFecha = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const opcionesHora = { hour: '2-digit', minute: '2-digit' };
  
  message += `📅 Fecha: ${fecha.toLocaleDateString('es-ES', opcionesFecha)}\n`;
  message += `⏰ Hora: ${fecha.toLocaleTimeString('es-ES', opcionesHora)}\n`;
  
  message += "\n*DETALLE DEL PEDIDO*\n";
  message += "────────────────\n";
  
  cart.forEach(item => {
    message += `🍩 ${item.quantity}x ${item.name}\n`;
    message += `   S/ ${(item.price * item.quantity).toFixed(2)}\n`;
  });
  
  message += "────────────────\n";
  message += `💰 *TOTAL: S/ ${total.toFixed(2)}*\n\n`;
  
  if (formData.get('mensaje')) {
    message += `📝 *NOTAS ESPECIALES:*\n${formData.get('mensaje')}\n\n`;
  }
  
  message += "¡Gracias por tu pedido! 🎉\n";
  message += "Pronto nos comunicaremos contigo para confirmar.";
  
  // Codificar el mensaje completo para URL
  const encodedMessage = encodeURIComponent(message);
  window.open(`https://wa.me/51910897178?text=${encodedMessage}`, '_blank');
}
  
  // Initialize empty cart
  updateCartUI();
});