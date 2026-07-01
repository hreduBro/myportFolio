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
        <a href="${project.demo_url}" class="project__link">
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
      const aAbout = document.createElement("a");
      aAbout.href = socials[soc.key];
      aAbout.target = "_blank";
      aAbout.ariaLabel = soc.key;
      aAbout.innerHTML = `<i class='${soc.icon}'></i>`;
      aboutSocials.appendChild(aAbout);

      const aFooter = document.createElement("a");
      aFooter.href = socials[soc.key];
      aFooter.target = "_blank";
      aFooter.ariaLabel = soc.key;
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
          <img src="${test.avatar_url}" alt="${testLang.name}" class="testimonial__img">
          <div>
            <h4 class="testimonial__name">${testLang.name}</h4>
            <span class="testimonial__role">${testLang.role}</span>
          </div>
        </div>
        <img src="${test.logo_url}" alt="${testLang.name} Company Logo" class="testimonial__company-logo">
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

  const roles = activeLang === "en" 
    ? ["React Developer", "Frontend Engineer", "Angular Expert", "UX Designer"] 
    : ["রিয়েক্ট ডেভেলপার", "ফ্রন্টএন্ড ইঞ্জিনিয়ার", "অ্যাঙ্গুলার এক্সপার্ট", "ইউআই/ইউএক্স ডিজাইনার"];
    
  staticTextEl.textContent = activeLang === "en" ? "I am a" : "আমি একজন";

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

// Kick off initialization
document.addEventListener("DOMContentLoaded", initPortfolio);
