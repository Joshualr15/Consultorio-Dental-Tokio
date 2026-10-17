/**
 * Consultorio Dental Tokio (Consultorio Dental Ixtapaluca)
 * Lógica Principal Interactiva:
 * - Indicador en tiempo real de Consultorio Abierto / Cerrado (Horario Oficial Ixtapaluca)
 * - Acordeón interactivo para Preguntas Frecuentes (FAQ)
 * - Galería Bento con Visor Lightbox de fotografías reales del consultorio
 * - Navegación Sticky con Glassmorphism y Menú Móvil
 * - Animaciones suaves al hacer scroll (IntersectionObserver)
 */

document.addEventListener('DOMContentLoaded', () => {
  // Inicializar íconos de Lucide si está cargado
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  initClinicScheduleStatus();
  initStickyNavbarAndMobileMenu();
  initFaqAccordion();
  initScrollReveal();
  initGalleryLightbox();
  initQuickWhatsAppConfigurator();

  // Actualizar el estado del horario cada minuto
  setInterval(initClinicScheduleStatus, 60000);
});

/**
 * 1. Indicador en Tiempo Real: Consultorio Abierto Ahora / Cerrado
 * Horario Oficial:
 * - Lunes a Viernes (1 - 5): 10:00 a 19:00 hrs
 * - Sábado (6): 10:00 a 17:00 hrs
 * - Domingo (0): Cerrado
 */
function initClinicScheduleStatus() {
  const now = new Date();

  // Obtener hora exacta en zona horaria del Centro de México (Ixtapaluca, Edo. Méx.)
  let mexicoDate;
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Mexico_City',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false
    });
    const parts = formatter.formatToParts(now);
    const map = {};
    parts.forEach((p) => {
      map[p.type] = p.value;
    });
    mexicoDate = new Date(
      Number(map.year),
      Number(map.month) - 1,
      Number(map.day),
      Number(map.hour === '24' ? 0 : map.hour),
      Number(map.minute),
      Number(map.second)
    );
  } catch (e) {
    mexicoDate = now;
  }

  const day = mexicoDate.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
  const hours = mexicoDate.getHours();
  const minutes = mexicoDate.getMinutes();
  const currentMinutes = hours * 60 + minutes;

  let isOpen = false;
  let statusText = '';
  let subStatusText = '';
  let closingSoon = false;

  // Lunes a Viernes: 10:00 (600m) a 19:00 (1140m)
  if (day >= 1 && day <= 5) {
    const openTime = 10 * 60; // 10:00 a.m.
    const closeTime = 19 * 60; // 7:00 p.m.
    if (currentMinutes >= openTime && currentMinutes < closeTime) {
      isOpen = true;
      const minsLeft = closeTime - currentMinutes;
      if (minsLeft <= 45) {
        closingSoon = true;
        statusText = 'Abierto Ahora • Cierra pronto (7:00 p.m.)';
      } else {
        statusText = 'Consultorio Abierto Ahora';
      }
      subStatusText = 'Hoy atendemos de 10:00 a.m. a 7:00 p.m.';
    } else if (currentMinutes < openTime) {
      isOpen = false;
      statusText = 'Cerrado ahora • Abre hoy a las 10:00 a.m.';
      subStatusText = 'Agenda tu cita por WhatsApp en cualquier momento';
    } else {
      isOpen = false;
      statusText =
        day === 5
          ? 'Cerrado ahora • Abre mañana sábado 10:00 a.m.'
          : 'Cerrado ahora • Abre mañana a las 10:00 a.m.';
      subStatusText = 'Deja tu mensaje en WhatsApp y te confirmamos';
    }
  }
  // Sábado: 10:00 (600m) a 17:00 (1020m)
  else if (day === 6) {
    const openTime = 10 * 60; // 10:00 a.m.
    const closeTime = 17 * 60; // 5:00 p.m.
    if (currentMinutes >= openTime && currentMinutes < closeTime) {
      isOpen = true;
      const minsLeft = closeTime - currentMinutes;
      if (minsLeft <= 45) {
        closingSoon = true;
        statusText = 'Abierto Ahora • Cierra pronto (5:00 p.m.)';
      } else {
        statusText = 'Consultorio Abierto Ahora';
      }
      subStatusText = 'Sábado de atención de 10:00 a.m. a 5:00 p.m.';
    } else if (currentMinutes < openTime) {
      isOpen = false;
      statusText = 'Cerrado ahora • Abre hoy sábado 10:00 a.m.';
      subStatusText = 'Agenda tu cita por WhatsApp en cualquier momento';
    } else {
      isOpen = false;
      statusText = 'Cerrado ahora • Abre el lunes a las 10:00 a.m.';
      subStatusText = 'Horario sabatino concluido (10:00 a.m. – 5:00 p.m.)';
    }
  }
  // Domingo: Cerrado
  else {
    isOpen = false;
    statusText = 'Cerrado hoy domingo • Abre lunes 10:00 a.m.';
    subStatusText = 'Puedes agendar tu cita para la semana vía WhatsApp';
  }

  // Actualizar todos los contenedores de estado en tiempo real
  const badges = document.querySelectorAll('[data-clinic-status-badge]');
  badges.forEach((badge) => {
    const dot = badge.querySelector('[data-status-dot]');
    const ping = badge.querySelector('[data-status-ping]');
    const label = badge.querySelector('[data-status-label]');

    if (label) {
      label.textContent = statusText;
    }

    if (isOpen) {
      badge.className =
        'inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-sm transition-all';
      if (dot) {
        dot.className = closingSoon
          ? 'relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500'
          : 'relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500';
      }
      if (ping) {
        ping.className = closingSoon
          ? 'animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75'
          : 'animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75';
      }
    } else {
      badge.className =
        'inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-slate-100 text-slate-700 border border-slate-200/90 shadow-sm transition-all';
      if (dot) {
        dot.className = 'relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500';
      }
      if (ping) {
        ping.className = 'hidden';
      }
    }
  });

  // Actualizar texto secundario en la sección de Contacto/Horarios
  const subLabels = document.querySelectorAll('[data-clinic-substatus]');
  subLabels.forEach((el) => {
    el.textContent = subStatusText;
  });

  // Resaltar fila correspondiente al día actual en la tabla de horarios
  const rowMonFri = document.getElementById('schedule-row-monfri');
  const rowSat = document.getElementById('schedule-row-sat');
  const rowSun = document.getElementById('schedule-row-sun');

  [rowMonFri, rowSat, rowSun].forEach((r) => {
    if (r) {
      r.classList.remove('bg-sky-50/90', 'border-sky-200', 'ring-1', 'ring-sky-500/20');
      const tag = r.querySelector('.today-pill');
      if (tag) tag.classList.add('hidden');
    }
  });

  let activeRow = null;
  if (day >= 1 && day <= 5) activeRow = rowMonFri;
  else if (day === 6) activeRow = rowSat;
  else activeRow = rowSun;

  if (activeRow) {
    activeRow.classList.add('bg-sky-50/90', 'border-sky-200', 'ring-1', 'ring-sky-500/20');
    const tag = activeRow.querySelector('.today-pill');
    if (tag) tag.classList.remove('hidden');
  }
}

/**
 * 2. Navbar Fija con Glassmorphism y Menú Móvil
 */
function initStickyNavbarAndMobileMenu() {
  const navbar = document.getElementById('main-navbar');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  window.addEventListener('scroll', () => {
    if (!navbar) return;
    if (window.scrollY > 24) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
      mobileMenuBtn.setAttribute('aria-expanded', String(!isExpanded));
      mobileMenu.classList.toggle('hidden');
    });

    mobileLinks.forEach((link) => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }
}

/**
 * 3. Preguntas Frecuentes (FAQ) en Acordeón JS
 */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach((item) => {
    const trigger = item.querySelector('.faq-trigger');
    if (!trigger) return;

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Cerrar otros acordeones abiertos para experiencia más limpia
      faqItems.forEach((otherItem) => {
        otherItem.classList.remove('open');
        const otherBtn = otherItem.querySelector('.faq-trigger');
        if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
      });

      // Alternar el actual
      if (!isOpen) {
        item.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

/**
 * 4. Animaciones de Aparición al Hacer Scroll
 */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal');

  if (!('IntersectionObserver' in window)) {
    revealElements.forEach((el) => el.classList.add('active'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    }
  );

  revealElements.forEach((el) => observer.observe(el));
}

/**
 * 5. Lightbox para la Galería Bento de Instalaciones Reales
 */
function initGalleryLightbox() {
  const modal = document.getElementById('lightbox-modal');
  const modalImg = document.getElementById('lightbox-image');
  const modalTitle = document.getElementById('lightbox-title');
  const modalDesc = document.getElementById('lightbox-desc');
  const closeBtn = document.getElementById('lightbox-close');
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');

  const triggers = Array.from(document.querySelectorAll('[data-lightbox-src]'));
  if (!modal || triggers.length === 0) return;

  let currentIndex = 0;

  function openLightbox(index) {
    currentIndex = (index + triggers.length) % triggers.length;
    const item = triggers[currentIndex];
    const src = item.getAttribute('data-lightbox-src');
    const title = item.getAttribute('data-lightbox-title') || '';
    const desc = item.getAttribute('data-lightbox-desc') || '';

    modalImg.src = src;
    modalImg.alt = title;
    modalTitle.textContent = title;
    modalDesc.textContent = desc;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = '';
  }

  triggers.forEach((trigger, index) => {
    trigger.addEventListener('click', () => openLightbox(index));
  });

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (prevBtn) prevBtn.addEventListener('click', () => openLightbox(currentIndex - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => openLightbox(currentIndex + 1));

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (modal.classList.contains('hidden')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') openLightbox(currentIndex - 1);
    if (e.key === 'ArrowRight') openLightbox(currentIndex + 1);
  });
}

/**
 * 6. Asistente Rápido de Cita por WhatsApp (Interactivo en Sección Contacto)
 */
function initQuickWhatsAppConfigurator() {
  const form = document.getElementById('quick-wa-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('wa-patient-name');
    const serviceSelect = document.getElementById('wa-service');
    const doctorSelect = document.getElementById('wa-doctor');
    const invoiceCheck = document.getElementById('wa-invoice');

    const name = nameInput && nameInput.value.trim() ? nameInput.value.trim() : '';
    const service = serviceSelect ? serviceSelect.value : 'Valoración General';
    const doctor = doctorSelect ? doctorSelect.value : 'Cualquier especialista disponible';
    const needsInvoice = invoiceCheck && invoiceCheck.checked;

    let msg = `Hola Consultorio Dental Tokio, vi su página web y me gustaría agendar una cita.`;
    if (name) {
      msg += `\n• Paciente: ${name}`;
    }
    msg += `\n• Tratamiento de interés: ${service}`;
    if (doctor && doctor !== 'Cualquier especialista disponible') {
      msg += `\n• Preferencia de atención: ${doctor}`;
    }
    if (needsInvoice) {
      msg += `\n• Nota: Requiero facturación fiscal.`;
    }

    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/525521494664?text=${encoded}`, '_blank', 'noopener,noreferrer');
  });
}
