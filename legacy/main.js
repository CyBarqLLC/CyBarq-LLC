/* CyBarq Technology — main.js
   Theme toggle, mobile nav, marquee duplication, scroll reveal,
   smooth page polish. Vanilla JS only.
*/

(function () {
  "use strict";

  /* ---------- Theme handling ---------- */
  const THEME_KEY = "cybarq-theme";
  const root = document.documentElement;

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
  }

  function initTheme() {
    let saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch (e) {}
    if (saved === "dark" || saved === "light") {
      applyTheme(saved);
    } else {
      applyTheme("light");
    }
  }
  initTheme();

  document.addEventListener("DOMContentLoaded", function () {
    const toggle = document.querySelector(".theme-toggle");
    if (toggle) {
      toggle.addEventListener("click", function () {
        const current = root.getAttribute("data-theme") || "light";
        applyTheme(current === "dark" ? "light" : "dark");
      });
    }

    /* ---------- Mobile menu ---------- */
    const menuBtn = document.querySelector(".menu-toggle");
    const mobileMenu = document.querySelector(".mobile-menu");
    if (menuBtn && mobileMenu) {
      menuBtn.addEventListener("click", function () {
        const isOpen = mobileMenu.classList.toggle("open");
        menuBtn.classList.toggle("open", isOpen);
        menuBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
        document.body.style.overflow = isOpen ? "hidden" : "";
      });
      mobileMenu.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () {
          mobileMenu.classList.remove("open");
          menuBtn.classList.remove("open");
          menuBtn.setAttribute("aria-expanded", "false");
          document.body.style.overflow = "";
        });
      });
    }

    /* ---------- Marquee duplication for seamless loop ---------- */
    document.querySelectorAll(".marquee-track").forEach(function (track) {
      const html = track.innerHTML;
      track.innerHTML = html + html;
    });

    /* ---------- Scroll reveal ---------- */
    const els = document.querySelectorAll(".reveal, .reveal-stagger");
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
      els.forEach(function (el) { io.observe(el); });
    } else {
      els.forEach(function (el) { el.classList.add("visible"); });
    }

    /* ---------- Active nav link ---------- */
    const path = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav-links a, .mobile-menu a").forEach(function (a) {
      const href = a.getAttribute("href");
      if (!href) return;
      if (href === path || (path === "" && href === "index.html")) {
        a.classList.add("active");
      }
      // Services parent highlight
      const servicePages = [
        "services.html","penetration-testing.html","dfir.html","training.html",
        "compromise-assessment.html","professional-services.html","development.html"
      ];
      if (href === "services.html" && servicePages.includes(path)) {
        a.classList.add("active");
      }
    });

    /* ---------- Smooth subtle parallax on hero glow ---------- */
    const glow = document.querySelector(".logo-3d-glow");
    if (glow && window.matchMedia("(min-width: 900px)").matches) {
      window.addEventListener("mousemove", function (e) {
        const x = (e.clientX / window.innerWidth - 0.5) * 12;
        const y = (e.clientY / window.innerHeight - 0.5) * 12;
        glow.style.transform = "translate(" + x + "px," + y + "px)";
      });
    }
  });
})();
