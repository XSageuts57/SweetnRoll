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