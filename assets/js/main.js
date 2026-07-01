/*=============== GLOBAL STATE & UTILITIES ===============*/
let activeLang = localStorage.getItem("portfolio-lang") || "en";
let portfolioData = typeof rawPortfolioData !== 'undefined' ? rawPortfolioData : null;

// Traverse nested object keys (e.g., "nav.home")
function getTranslationByKey(obj, keyPath) {
  if (!obj) return "";
  return keyPath.split('.').reduce((acc, part) => acc && acc[part], obj);
}

/*=============== DYNAMIC CONTENT RENDERING ===============*/
function renderContent() {
  if (!portfolioData) return;

  const langData = portfolioData.i18n[activeLang];

  // Set RTL direction for Arabic support
  if (activeLang === "ar") {
    document.documentElement.dir = "rtl";
    document.documentElement.lang = "ar";
  } else {
    document.documentElement.dir = "ltr";
    document.documentElement.lang = activeLang;
  }

  // 1. Update static labels (text & placeholders)
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    const translation = getTranslationByKey(langData, key);
    if (translation !== undefined) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = translation;
      } else {
        if (translation.includes('<') && translation.includes('>')) {
          el.innerHTML = translation;
        } else {
          el.textContent = translation;
        }
      }
    }
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.getAttribute("data-i18n-placeholder");
    const translation = getTranslationByKey(langData, key);
    if (translation !== undefined) {
      el.placeholder = translation;
    }
  });

  // Update active language indicator text
  document.getElementById("active-lang-text").textContent = activeLang.toUpperCase();

  // 2. Render Projects Grid
  const projectsGrid = document.getElementById("projects-grid");
  projectsGrid.innerHTML = "";
  
  portfolioData.projects.forEach(project => {
    const projLang = project[activeLang];
    const projectCard = document.createElement("article");
    projectCard.className = `project__card project-${project.category}`;
    projectCard.setAttribute("data-category", project.category);
    
    projectCard.innerHTML = `
      <div class="project__img-wrapper">
        <img src="${project.image}" alt="${projLang.title}" class="project__img" loading="lazy" width="360" height="225">
      </div>
      <div class="project__content">
        <span class="project__tag">${project.category}</span>
        <h3 class="project__title">${projLang.title}</h3>
        <p class="project__desc">${projLang.description}</p>
        <a href="${project.demo_url}" target="_blank" class="project__link" aria-label="${langData.projects_section.demo} - ${projLang.title}">
          ${langData.projects_section.demo} <i class='bx bx-right-arrow-alt'></i>
        </a>
      </div>
    `;
    projectsGrid.appendChild(projectCard);
  });

  // 3. Render Services Grid
  const servicesGrid = document.getElementById("services-grid");
  servicesGrid.innerHTML = "";

  portfolioData.services.forEach(service => {
    const servLang = service[activeLang];
    const featuresList = servLang.features.map(f => `
      <li class="services__item">
        <i class='bx bx-check-circle'></i>
        <span>${f}</span>
      </li>
    `).join("");

    const serviceCard = document.createElement("div");
    serviceCard.className = "services__card";
    serviceCard.innerHTML = `
      <div class="services__icon-wrapper">
        <i class="${service.icon}"></i>
      </div>
      <h3 class="services__card-title">${servLang.title}</h3>
      <p class="services__card-desc">${servLang.description}</p>
      <ul class="services__list">
        ${featuresList}
      </ul>
    `;
    servicesGrid.appendChild(serviceCard);
  });

  // 4. Render Stats counter grid
  const statsGrid = document.getElementById("stats-grid");
  statsGrid.innerHTML = "";
  
  portfolioData.stats.forEach(stat => {
    const statLabel = getTranslationByKey(langData, stat.label_key);
    const statItem = document.createElement("div");
    statItem.className = "stats__item";
    statItem.innerHTML = `
      <span class="stats__number">${stat.value}</span>
      <span class="stats__label">${statLabel}</span>
    `;
    statsGrid.appendChild(statItem);
  });

  // 5. Render Social Links & Profile in About section
  const aboutSocials = document.getElementById("about-socials");
  const footerSocials = document.getElementById("footer-socials");
  aboutSocials.innerHTML = "";
  footerSocials.innerHTML = "";

  const socials = portfolioData.personal.socials;
  
  const socialIcons = [
    { key: "linkedin", icon: "bx bxl-linkedin" },
    { key: "github", icon: "bx bxl-github" },
    { key: "fiverr", icon: "bx bx-globe" },
    { key: "whatsapp", icon: "bx bxl-whatsapp" }
  ];

  socialIcons.forEach(soc => {
    if (socials[soc.key]) {
      const label = soc.key.charAt(0).toUpperCase() + soc.key.slice(1);
      
      const aAbout = document.createElement("a");
      aAbout.href = socials[soc.key];
      aAbout.target = "_blank";
      aAbout.setAttribute("aria-label", `${label} profile`);
      aAbout.innerHTML = `<i class='${soc.icon}'></i>`;
      aboutSocials.appendChild(aAbout);

      const aFooter = document.createElement("a");
      aFooter.href = socials[soc.key];
      aFooter.target = "_blank";
      aFooter.setAttribute("aria-label", `${label} profile`);
      aFooter.innerHTML = `<i class='${soc.icon}'></i>`;
      footerSocials.appendChild(aFooter);
    }
  });

  // 6. Render Tech Stack Badges (Infinite Scrolling Marquee)
  const techStackGrid = document.getElementById("tech-stack-grid");
  techStackGrid.innerHTML = "";
  
  // Duplicate three times for seamless scroll loop
  const fullStack = [...portfolioData.tech_stack, ...portfolioData.tech_stack, ...portfolioData.tech_stack];
  fullStack.forEach(tech => {
    const badge = document.createElement("div");
    badge.className = "tech-icon-badge";
    badge.innerHTML = `<i class='${tech.icon}'></i>`;
    badge.title = tech.name;
    techStackGrid.appendChild(badge);
  });

  // 7. Render Experience timeline
  const experienceList = document.getElementById("experience-list");
  experienceList.innerHTML = "";
  
  portfolioData.experiences.forEach(exp => {
    const expLang = exp[activeLang];
    const expItem = document.createElement("div");
    expItem.className = "exp-item";
    expItem.innerHTML = `
      <span class="exp-role">${expLang.role}</span>
      <span class="exp-company">${expLang.company}</span>
      <span class="exp-year">${exp.year}</span>
    `;
    experienceList.appendChild(expItem);
  });

  // 8. Render Testimonials Section
  const testimonialsGrid = document.getElementById("testimonials-grid");
  testimonialsGrid.innerHTML = "";

  portfolioData.testimonials.forEach(test => {
    const testLang = test[activeLang];
    const card = document.createElement("div");
    card.className = "testimonial__card";
    card.innerHTML = `
      <p class="testimonial__text">"${testLang.text}"</p>
      <div class="testimonial__author">
        <div class="testimonial__author-info">
          <img src="${test.avatar_url}" alt="${testLang.name}" class="testimonial__img" width="48" height="48" loading="lazy">
          <div>
            <h3 class="testimonial__name">${testLang.name}</h3>
            <span class="testimonial__role">${testLang.role}</span>
          </div>
        </div>
        <img src="${test.logo_url}" alt="${testLang.name} Company Logo" class="testimonial__company-logo" width="40" height="40" loading="lazy">
      </div>
    `;
    testimonialsGrid.appendChild(card);
  });

  // 9. Render FAQs Accordion with mutual exclusion fallback
  const faqsAccordion = document.getElementById("faqs-accordion");
  faqsAccordion.innerHTML = "";

  portfolioData.faqs.forEach((faq, index) => {
    const faqLang = faq[activeLang];
    const faqItem = document.createElement("details");
    faqItem.className = "faq__item";
    faqItem.setAttribute("name", "faq-accordion");
    if (index === 0) {
      faqItem.setAttribute("open", "");
    }

    faqItem.innerHTML = `
      <summary class="faq__question">
        <span>${faqLang.question}</span>
        <i class='bx bx-plus faq__toggle-icon'></i>
      </summary>
      <div class="faq__answer">
        <p>${faqLang.answer}</p>
      </div>
    `;
    faqsAccordion.appendChild(faqItem);
  });

  // Support details toggle mutual exclusion programmatically for older browsers
  const detailsElements = faqsAccordion.querySelectorAll(".faq__item");
  detailsElements.forEach(details => {
    details.addEventListener("toggle", (e) => {
      if (details.open) {
        detailsElements.forEach(other => {
          if (other !== details) {
            other.removeAttribute("open");
          }
        });
      }
    });
  });

  // 10. Update footer copyright year dynamically
  const currentYear = new Date().getFullYear();
  document.getElementById("footer-copy").innerHTML = `&#169; ${currentYear} Hredoy Sen. ${langData.footer.rights}`;

  // Re-run filter projects check
  filterProjects(activeFilter);
  
  // Re-run Typewriter logic
  initTypewriter();
  
  // Initialize dynamic interactive visual animations (skip during first load preloader phase)
  if (!document.body.classList.contains("loading")) {
    initFuturisticAnimations();
  }
}

/*=============== TYPEWRITER EFFECT ===============*/
let typewriterTimeout = null;
function initTypewriter() {
  if (typewriterTimeout) {
    clearTimeout(typewriterTimeout);
  }

  const staticTextEl = document.getElementById("home-static-text");
  const dynamicTextEl = document.getElementById("home-dynamic-text");
  
  if (!staticTextEl || !dynamicTextEl || !portfolioData) return;

  let roles = ["React Developer", "Frontend Engineer", "Angular Expert", "UX Designer"];
  if (activeLang === "bn") {
    roles = ["রিয়েক্ট ডেভেলপার", "ফ্রন্টএন্ড ইঞ্জিনিয়ার", "অ্যাঙ্গুলার এক্সপার্ট", "ইউআই/ইউএক্স ডিজাইনার"];
  } else if (activeLang === "zh") {
    roles = ["React 开发者", "前端工程师", "Angular 专家", "UX 设计师"];
  } else if (activeLang === "ar") {
    roles = ["مطور ريآكت", "مهندس واجهات", "خبير أنجولار", "مصمم واجهات"];
  }
    
  if (activeLang === "en") {
    staticTextEl.textContent = "I am a";
  } else if (activeLang === "bn") {
    staticTextEl.textContent = "আমি একজন";
  } else if (activeLang === "zh") {
    staticTextEl.textContent = "我是一名";
  } else if (activeLang === "ar") {
    staticTextEl.textContent = "أنا";
  }

  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  const typeSpeed = 100;
  const eraseSpeed = 50;
  const delayBetweenWords = 2000;

  function type() {
    const currentWord = roles[roleIndex];
    
    if (isDeleting) {
      dynamicTextEl.textContent = currentWord.substring(0, charIndex - 1);
      charIndex--;
    } else {
      dynamicTextEl.textContent = currentWord.substring(0, charIndex + 1);
      charIndex++;
    }

    let nextTimeoutSpeed = isDeleting ? eraseSpeed : typeSpeed;

    if (!isDeleting && charIndex === currentWord.length) {
      isDeleting = true;
      nextTimeoutSpeed = delayBetweenWords; // Pause before erasing
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      nextTimeoutSpeed = 500; // Pause briefly before typing next
    }

    typewriterTimeout = setTimeout(type, nextTimeoutSpeed);
  }

  type();
}

/*=============== PROJECTS FILTER LOGIC ===============*/
let activeFilter = "all";

function filterProjects(category) {
  activeFilter = category;
  document.querySelectorAll(".projects__filter-btn").forEach(btn => {
    if (btn.getAttribute("data-filter") === category) {
      btn.classList.add("active-filter");
    } else {
      btn.classList.remove("active-filter");
    }
  });

  const cards = document.querySelectorAll(".project__card");
  cards.forEach(card => {
    const cardCat = card.getAttribute("data-category");
    if (category === "all" || cardCat === category) {
      card.classList.remove("project-hidden");
    } else {
      card.classList.add("project-hidden");
    }
  });
}

// Bind filter click handlers
document.querySelector(".projects__filters").addEventListener("click", (e) => {
  const filterBtn = e.target.closest(".projects__filter-btn");
  if (!filterBtn) return;
  const category = filterBtn.getAttribute("data-filter");
  filterProjects(category);
});

/*=============== THEME LIGHT/DARK OPTIMIZATION ===============*/
const themeButton = document.getElementById("theme-button");
const darkTheme = "dark";
const lightTheme = "light";

function getCurrentTheme() {
  return document.documentElement.getAttribute("data-theme") || darkTheme;
}

function setTheme(theme) {
  document.documentElement.className = theme + "-theme";
  document.documentElement.setAttribute('data-theme', theme);
  document.querySelector('meta[name="color-scheme"]').content = theme;
  
  localStorage.setItem("selected-theme", theme);
  
  // Update icon
  const icon = themeButton.querySelector("i");
  if (theme === "dark") {
    icon.className = "bx bx-sun";
  } else {
    icon.className = "bx bx-moon";
  }
}

themeButton.addEventListener("click", () => {
  const current = getCurrentTheme();
  const next = current === darkTheme ? lightTheme : darkTheme;
  setTheme(next);
});

// React to OS system changes if user hasn't explicitly chosen a preference
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
  if (!localStorage.getItem("selected-theme")) {
    setTheme(e.matches ? darkTheme : lightTheme);
  }
});

// Set initial theme icon correctly
const initialTheme = getCurrentTheme();
setTheme(initialTheme);

/*=============== SCROLL ACTIVE NAVIGATION LINKS ===============*/
const sections = document.querySelectorAll("section[id]");

function scrollActive() {
  const scrollY = window.pageYOffset;

  sections.forEach((current) => {
    const sectionHeight = current.offsetHeight,
      sectionTop = current.offsetTop - 58,
      sectionId = current.getAttribute("id");

    const navLink = document.querySelector(".nav__menu a[href*=" + sectionId + "]");
    if (navLink) {
      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLink.classList.add("active-link");
      } else {
        navLink.classList.remove("active-link");
      }
    }
  });
}
window.addEventListener("scroll", scrollActive);

/*=============== SHRINKS NAVBAR ON SCROLL ===============*/
function scrollHeader() {
  const header = document.getElementById("header");
  if (window.scrollY >= 50) {
    header.classList.add("scroll-header");
    header.style.backgroundColor = "rgba(var(--first-color-rgb), 0.05)";
  } else {
    header.classList.remove("scroll-header");
    header.style.backgroundColor = "rgba(var(--first-color-rgb), 0.02)";
  }
}
window.addEventListener("scroll", scrollHeader);

/*=============== LANGUAGE DROPDOWN CONTROLS ===============*/
const langBtn = document.getElementById("lang-btn");
const langDropdown = document.getElementById("lang-dropdown");

langBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  langDropdown.classList.toggle("show-dropdown");
});

document.addEventListener("click", () => {
  langDropdown.classList.remove("show-dropdown");
});

langDropdown.addEventListener("click", (e) => {
  const opt = e.target.closest(".lang-opt");
  if (!opt) return;
  const nextLang = opt.getAttribute("data-lang");
  if (nextLang !== activeLang) {
    activeLang = nextLang;
    localStorage.setItem("portfolio-lang", activeLang);
    renderContent();
  }
});

/*=============== STARTUP DATA INITIALIZATION ===============*/
async function initPortfolio() {
  try {
    if (!portfolioData) {
      const response = await fetch("assets/data/portfolio.json");
      if (!response.ok) {
        throw new Error(`Failed to load config: ${response.statusText}`);
      }
      portfolioData = await response.json();
    }
    
    // Inject email and contact link directly in Talk To Me cards
    const contactCards = document.getElementById("contact-cards");
    const socials = portfolioData.personal.socials;
    const cardsLang = portfolioData.i18n[activeLang].contact_section;
    
    // Update contact cards template dynamically
    contactCards.innerHTML = `
      <div class="contact__card">
        <i class='bx bx-mail-send contact__card-icon'></i>
        <h3 class="contact__card-title">${cardsLang.card_email}</h3>
        <span class="contact__card-data">${socials.email}</span>
        <a href="mailto:${socials.email}" target="_blank" class="contact__button">
          ${cardsLang.write_me} <i class='bx bx-right-arrow-alt'></i>
        </a>
      </div>

      <div class="contact__card">
        <i class='bx bxl-whatsapp contact__card-icon'></i>
        <h3 class="contact__card-title">${cardsLang.card_whatsapp}</h3>
        <span class="contact__card-data">+880-1319-839-449</span>
        <a href="${socials.whatsapp}" target="_blank" class="contact__button">
          ${cardsLang.write_me} <i class='bx bx-right-arrow-alt'></i>
        </a>
      </div>

      <div class="contact__card">
        <i class='bx bxl-linkedin contact__card-icon'></i>
        <h3 class="contact__card-title">${cardsLang.card_linkedin}</h3>
        <span class="contact__card-data">@hredoy-sen</span>
        <a href="${socials.linkedin}" target="_blank" class="contact__button">
          ${cardsLang.write_me} <i class='bx bx-right-arrow-alt'></i>
        </a>
      </div>
    `;
    
    renderContent();
  } catch (error) {
    console.error("Initialization Error:", error);
  }
}

// Kick off initialization and PWA service worker registration
document.addEventListener("DOMContentLoaded", () => {
  runPreloader();
  initPortfolio();
  
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then(reg => console.log('ServiceWorker registered:', reg.scope))
        .catch(err => console.log('ServiceWorker registration failed:', err));
    });
  }
});

/*=============== FUTURISTIC PRELOADER LOGIC ===============*/
function runPreloader() {
  const fill = document.getElementById("preloader-fill");
  const perc = document.getElementById("preloader-perc");
  const status = document.getElementById("preloader-status");
  const preloader = document.getElementById("preloader");

  if (!fill || !perc || !status || !preloader) return;

  // Dynamically load heavy icon stylesheets asynchronously to exclude them from critical render path
  const loadDeferredStyles = () => {
    const styles = [
      'assets/css/boxicons.min.css',
      'assets/css/devicon.min.css'
    ];
    styles.forEach(src => {
      if (!document.querySelector(`link[href="${src}"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = src;
        document.head.appendChild(link);
      }
    });
  };

  // Start style load immediately in background
  loadDeferredStyles();

  const logs = [
    "Initializing Core...",
    "Loading Brand Assets...",
    "Parsing Tech Stack...",
    "Compiling Experience...",
    "Starting System..."
  ];

  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.floor(Math.random() * 12) + 3;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);

      fill.style.transform = "scaleX(1)";
      perc.textContent = "100%";
      status.textContent = "System ready.";

      setTimeout(() => {
        preloader.classList.add("preloader--hidden");
        document.body.classList.remove("loading");
        
        // Defer CPU-heavy observers and interactive animations initialization by 250ms
        setTimeout(initFuturisticAnimations, 250);
      }, 400);
    } else {
      // GPU compositor accelerated scaling (no reflows/repaints)
      fill.style.transform = `scaleX(${progress / 100})`;
      perc.textContent = `${progress}%`;

      const logIndex = Math.min(Math.floor(progress / 20), logs.length - 1);
      status.textContent = logs[logIndex];
    }
  }, 45);
}

/*=============== FUTURISTIC INTERACTIVE ANIMATIONS ===============*/
function initFuturisticAnimations() {
  const isMouse = window.matchMedia("(pointer: fine)").matches;

  // 1. Interactive Pointer Glow (Mouse Tracking)
  if (isMouse) {
    let glow = document.querySelector(".pointer-glow");
    if (!glow) {
      glow = document.createElement("div");
      glow.className = "pointer-glow";
      document.body.appendChild(glow);
    }

    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;
    let isMoving = false;
    let rafId = null;
    let isIdle = true;

    // Smooth physics loop
    function updateGlow() {
      const dx = targetX - currentX;
      const dy = targetY - currentY;
      
      // If pointer catches up completely, halt animation frame loop to free main thread
      if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) {
        currentX = targetX;
        currentY = targetY;
        glow.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate3d(-50%, -50%, 0)`;
        rafId = null;
        isIdle = true;
        return;
      }

      currentX += dx * 0.12;
      currentY += dy * 0.12;
      glow.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate3d(-50%, -50%, 0)`;
      
      rafId = requestAnimationFrame(updateGlow);
    }

    document.addEventListener("mousemove", e => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (isIdle) {
        glow.style.opacity = "1";
        isIdle = false;
        if (!rafId) {
          rafId = requestAnimationFrame(updateGlow);
        }
      }
    });

    document.addEventListener("mouseleave", () => {
      glow.style.opacity = "0";
      isMoving = false;
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      isIdle = true;
    });
    
    document.addEventListener("mouseenter", () => {
      glow.style.opacity = "1";
    });
  }

  // 2. 3D Tilt Effect on hover
  if (isMouse) {
    const tiltCards = document.querySelectorAll(".project__card, .about__profile-card, .services__card, .contact__card");
    tiltCards.forEach(card => {
      card.addEventListener("mousemove", e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const xc = rect.width / 2;
        const yc = rect.height / 2;
        
        const angleX = (yc - y) / 18;
        const angleY = (x - xc) / 18;
        
        card.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg) scale3d(1.02, 1.02, 1.02)`;
      });
      
      card.addEventListener("mouseleave", () => {
        card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
      });
    });
  }

  // 3. Magnetic Hover Attraction
  if (isMouse) {
    const magneticItems = document.querySelectorAll(".home__social-link, .nav__link, .theme-button, .button, .contact__button");
    magneticItems.forEach(item => {
      item.addEventListener("mousemove", e => {
        const rect = item.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        item.style.transform = `translate3d(${x * 0.3}px, ${y * 0.3}px, 0)`;
      });
      
      item.addEventListener("mouseleave", () => {
        item.style.transform = `translate3d(0, 0, 0)`;
      });
    });
  }

  // 4. Reveal on Scroll (Intersection Observer)
  const revealTargets = document.querySelectorAll(
    ".home__data, .home__profile-wrapper, .about__profile-card, .about__content, " +
    ".services__card, .project__card, .testimonial__card, .faq__item, .contact__card, " +
    ".contact__form, .section__title, .section__subtitle"
  );

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("reveal-element--visible");
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.05,
    rootMargin: "0px 0px -20px 0px"
  });

  revealTargets.forEach(el => {
    if (!el.classList.contains("reveal-element")) {
      el.classList.add("reveal-element");
    }
    observer.observe(el);
  });
}
