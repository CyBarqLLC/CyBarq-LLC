/* CyBarq — main.js
   Light theme only. Vanilla JS.
   Nav state, mobile menu, scroll reveal, seamless marquees, count-up stats,
   magnetic buttons, hero parallax, scroll progress, contact form, page transitions.
*/

(function () {
  "use strict";

  var docEl = document.documentElement;
  docEl.classList.add("js");

  /* Airbag: any runtime error anywhere must never leave content hidden */
  window.addEventListener("error", function () {
    docEl.classList.add("reveal-fallback");
  });

  /* ============ Media protection ============
     Blocks the context menu, dragging and long-press saving across the
     site (form fields stay usable so people can paste).
     This deters casual copying only: it is not real protection, since
     any browser must download media in order to display it. */
  function allowsMenu(el) {
    return el && el.closest && el.closest("input, textarea, select, [contenteditable='true']");
  }
  document.addEventListener("contextmenu", function (e) {
    if (!allowsMenu(e.target)) e.preventDefault();
  }, true);
  document.addEventListener("dragstart", function (e) {
    e.preventDefault();
  }, true);
  /* iOS/Safari long-press callout */
  document.addEventListener("touchstart", function () {}, { passive: true });

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;
  var isAr = (docEl.lang || "en").indexOf("ar") === 0;

  /* ============ Seamless infinite marquees (no visible restart) ============ */
  function initMarquees() {
    document.querySelectorAll(".marquee-track").forEach(function (track) {
      var originals = Array.prototype.slice.call(track.children).filter(function (ch) {
        return !ch.dataset.clone;
      });
      if (!originals.length) return;

      function build() {
        if (track._anim) { track._anim.cancel(); track._anim = null; }
        Array.prototype.slice.call(track.children).forEach(function (ch) {
          if (ch.dataset.clone) ch.remove();
        });
        var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
        var setW = 0;
        originals.forEach(function (el) { setW += el.getBoundingClientRect().width; });
        setW += gap * originals.length; /* includes the seam gap */
        if (setW <= 0) return;

        var parentW = (track.parentElement && track.parentElement.getBoundingClientRect().width) || window.innerWidth;
        var copies = Math.max(2, Math.ceil((parentW + setW) / setW) + 1);
        for (var i = 1; i < copies; i++) {
          originals.forEach(function (el) {
            var c = el.cloneNode(true);
            c.dataset.clone = "1";
            track.appendChild(c);
          });
        }
        if (reduceMotion || !track.animate) return;
        var dir = docEl.dir === "rtl" ? 1 : -1;
        track._anim = track.animate(
          [{ transform: "translateX(0px)" }, { transform: "translateX(" + (dir * setW) + "px)" }],
          { duration: Math.max(setW * 24, 14000), iterations: Infinity }
        );
        var host = track.closest(".marquee");
        if (host) {
          host.onmouseenter = function () { if (track._anim) track._anim.pause(); };
          host.onmouseleave = function () { if (track._anim) track._anim.play(); };
        }
      }

      build();
      /* Rebuild only on real width changes; ignore mobile URL-bar height
         resizes so scrolling never causes a visible marquee jump. */
      var t, lastW = window.innerWidth;
      window.addEventListener("resize", function () {
        if (Math.abs(window.innerWidth - lastW) < 2) return;
        lastW = window.innerWidth;
        clearTimeout(t);
        t = setTimeout(build, 300);
      });
    });
  }
  function whenReady(fn) {
    var fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    fontsReady.then(function () {
      if (document.readyState === "complete") fn();
      else window.addEventListener("load", fn, { once: true });
    });
  }
  whenReady(initMarquees);

  document.addEventListener("DOMContentLoaded", function () {

    /* ---------- Footer year ---------- */
    var y = document.getElementById("y");
    if (y) y.textContent = new Date().getFullYear();

    /* ---------- Scroll progress hairline ---------- */
    var progress = document.createElement("div");
    progress.className = "scroll-progress";
    progress.setAttribute("aria-hidden", "true");
    document.body.appendChild(progress);

    /* ---------- Nav scrolled state + progress ---------- */
    var nav = document.querySelector(".nav");
    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var sc = window.scrollY;
        if (nav) nav.classList.toggle("scrolled", sc > 24);
        var max = docEl.scrollHeight - window.innerHeight;
        progress.style.transform = "scaleX(" + (max > 0 ? Math.min(sc / max, 1) : 0) + ")";
        ticking = false;
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    /* ---------- Mobile menu ---------- */
    var menuBtn = document.querySelector(".menu-toggle");
    var mobileMenu = document.querySelector(".mobile-menu");
    function closeMenu() {
      if (!menuBtn || !mobileMenu) return;
      mobileMenu.classList.remove("open");
      menuBtn.classList.remove("open");
      menuBtn.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }
    if (menuBtn && mobileMenu) {
      menuBtn.addEventListener("click", function () {
        var isOpen = mobileMenu.classList.toggle("open");
        menuBtn.classList.toggle("open", isOpen);
        menuBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
        document.body.style.overflow = isOpen ? "hidden" : "";
      });
      mobileMenu.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", closeMenu);
      });
    }

    /* ---------- Scroll reveal ---------- */
    var els = document.querySelectorAll(".reveal, .reveal-stagger, .reveal-list");
    if ("IntersectionObserver" in window && !reduceMotion) {
      var io = new IntersectionObserver(function (entries) {
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

    /* ---------- Count-up stats ---------- */
    var stats = document.querySelectorAll(".stat-num");
    if (stats.length && "IntersectionObserver" in window && !reduceMotion) {
      var animateStat = function (el) {
        var raw = el.textContent.trim();
        var m = raw.match(/(\d+)/);
        if (!m) return;
        var target = parseInt(m[1], 10);
        var prefix = raw.slice(0, m.index);
        var suffix = raw.slice(m.index + m[1].length);
        var t0 = null, dur = 1400;
        function step(ts) {
          if (!t0) t0 = ts;
          var p = Math.min((ts - t0) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 4);
          el.textContent = prefix + Math.round(target * eased) + suffix;
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      };
      var statIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateStat(entry.target);
            statIO.unobserve(entry.target);
          }
        });
      }, { threshold: 0.6 });
      stats.forEach(function (el) { statIO.observe(el); });
    }

    /* ---------- Magnetic buttons ---------- */
    if (finePointer && !reduceMotion) {
      document.querySelectorAll(".btn").forEach(function (btn) {
        btn.addEventListener("mousemove", function (e) {
          var r = btn.getBoundingClientRect();
          var x = (e.clientX - r.left - r.width / 2) * 0.18;
          var yv = (e.clientY - r.top - r.height / 2) * 0.28;
          btn.style.transform = "translate(" + x + "px," + yv + "px)";
        });
        btn.addEventListener("mouseleave", function () {
          btn.style.transform = "";
        });
      });
    }

    /* ---------- Hero parallax ---------- */
    var visual = document.querySelector(".hero-visual");
    if (visual && finePointer && !reduceMotion) {
      var logo = visual.querySelector(".logo-3d");
      var glow = visual.querySelector(".logo-3d-glow");
      var chips = visual.querySelectorAll(".float-chip");
      var raf = null;
      window.addEventListener("mousemove", function (e) {
        if (raf) return;
        raf = requestAnimationFrame(function () {
          var x = e.clientX / window.innerWidth - 0.5;
          var yv = e.clientY / window.innerHeight - 0.5;
          if (logo) logo.style.translate = (x * 16) + "px " + (yv * 16) + "px";
          if (glow) glow.style.translate = (x * 28) + "px " + (yv * 28) + "px";
          chips.forEach(function (chip, i) {
            var f = 8 + i * 5;
            chip.style.translate = (-x * f) + "px " + (-yv * f) + "px";
          });
          raf = null;
        });
      }, { passive: true });
    }

    /* ---------- Active nav link ---------- */
    var path = location.pathname.split("/").pop() || "index.html";
    var servicePages = [
      "services.html", "penetration-testing.html", "dfir.html", "training.html",
      "compromise-assessment.html", "professional-services.html", "development.html"
    ];
    document.querySelectorAll(".nav-links a, .mobile-menu a").forEach(function (a) {
      var href = (a.getAttribute("href") || "").split("/").pop();
      if (!href) return;
      if (href === path) a.classList.add("active");
      if (href === "services.html" && servicePages.indexOf(path) > -1) a.classList.add("active");
    });

    /* ---------- Contact form: localized country list ---------- */
    var countrySel = document.getElementById("cf-country");
    if (countrySel) {
      var lang = isAr ? "ar" : "en";
      var CODES = ("AF AL DZ AD AO AG AR AM AU AT AZ BS BH BD BB BY BE BZ BJ BT BO BA BW BR BN BG BF BI CV KH CM CA CF TD CL CN CO KM CG CD CR CI HR CU CY CZ DK DJ DM DO EC EG SV GQ ER EE SZ ET FJ FI FR GA GM GE DE GH GR GD GT GN GW GY HT HN HU IS IN ID IR IQ IE IT JM JP JO KZ KE KI KP KR KW KG LA LV LB LS LR LY LI LT LU MG MW MY MV ML MT MH MR MU MX FM MD MC MN ME MA MZ MM NA NR NP NL NZ NI NE NG MK NO OM PK PW PS PA PG PY PE PH PL PT QA RO RU RW KN LC VC WS SM ST SA SN RS SC SL SG SK SI SB SO ZA SS ES LK SD SR SE CH SY TJ TZ TH TL TG TO TT TN TR TM TV UG UA AE GB US UY UZ VU VA VE VN YE ZM ZW").split(" ");
      var dn = null;
      try {
        if (window.Intl && Intl.DisplayNames) dn = new Intl.DisplayNames([lang], { type: "region" });
      } catch (err) { dn = null; }
      var items = CODES.map(function (c) {
        var name;
        if (c === "PS") name = lang === "ar" ? "فلسطين" : "Palestine";
        else name = dn ? (dn.of(c) || c) : c;
        return name;
      }).sort(function (a, b) { return a.localeCompare(b, lang); });
      items.forEach(function (name) {
        var opt = document.createElement("option");
        opt.value = name;
        opt.textContent = name;
        countrySel.appendChild(opt);
      });
    }

    /* ---------- Premium success overlay ---------- */
    var successEl = null;
    function showSuccess(form) {
      if (!successEl) {
        successEl = document.createElement("div");
        successEl.className = "form-success";
        successEl.setAttribute("role", "status");
        successEl.setAttribute("aria-live", "polite");
        successEl.innerHTML =
          '<div class="fs-card">' +
            '<svg class="fs-icon" viewBox="0 0 52 52" aria-hidden="true">' +
              '<circle cx="26" cy="26" r="24"/>' +
              '<path d="M15 27l7 7 15-16"/>' +
            "</svg>" +
            "<h3>" + (isAr ? "تم إرسال رسالتك" : "Message sent") + "</h3>" +
            "<p>" + (isAr
              ? "شكرًا لك، وصلتنا رسالتك وسنتواصل معك قريبًا."
              : "Thank you! Your message has arrived and we will get back to you shortly.") + "</p>" +
            '<button type="button" class="btn btn-primary fs-again">' +
              (isAr ? "أرسل رسالة أخرى" : "Send another message") +
            "</button>" +
          "</div>";
        document.body.appendChild(successEl);
        successEl.querySelector(".fs-again").addEventListener("click", function () {
          hideSuccess();
          var first = form.querySelector("input");
          if (first) first.focus();
        });
        successEl.addEventListener("click", function (e) {
          if (e.target === successEl) hideSuccess();
        });
      }
      requestAnimationFrame(function () { successEl.classList.add("show"); });
      clearTimeout(successEl._t);
      successEl._t = setTimeout(hideSuccess, 7000);
    }
    function hideSuccess() {
      if (successEl) {
        successEl.classList.remove("show");
        clearTimeout(successEl._t);
      }
    }

    /* ---------- Contact form: async submit to Formspree ---------- */
    var form = document.getElementById("contact-form");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!form.checkValidity()) { form.reportValidity(); return; }
        var btn = form.querySelector(".btn-submit");
        var note = form.querySelector(".form-note");
        var noteDefault = note ? note.textContent : "";
        var btnHTML = btn ? btn.innerHTML : "";
        if (btn) {
          btn.disabled = true;
          btn.textContent = isAr ? "جارٍ الإرسال..." : "Sending...";
        }
        if (note) { note.classList.remove("err"); note.textContent = noteDefault; }

        fetch(form.action, {
          method: "POST",
          body: new FormData(form),
          headers: { "Accept": "application/json" }
        }).then(function (res) {
          if (res.ok) {
            form.reset();
            showSuccess(form);
          } else {
            throw new Error("submit-failed");
          }
        }).catch(function () {
          if (note) {
            note.classList.add("err");
            note.textContent = isAr
              ? "تعذر الإرسال. حاول مرة أخرى أو راسلنا مباشرة على info@cybarq.com"
              : "Something went wrong. Please try again, or email us directly at info@cybarq.com";
          }
        }).finally(function () {
          if (btn) { btn.disabled = false; btn.innerHTML = btnHTML; }
        });
      });
    }

    /* ---------- Page transition (fade out on internal nav) ---------- */
    if (!reduceMotion) {
      document.addEventListener("click", function (e) {
        var a = e.target.closest ? e.target.closest("a") : null;
        if (!a) return;
        var href = a.getAttribute("href") || "";
        if (
          e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey ||
          a.target === "_blank" || !href || href.charAt(0) === "#" ||
          /^(mailto:|tel:)/.test(href) ||
          (/^https?:\/\//.test(href) && a.host !== location.host)
        ) return;
        /* Same-page anchors (e.g. index.html#registration on index): smooth scroll */
        var hashIdx = href.indexOf("#");
        if (hashIdx > -1) {
          var targetPage = href.slice(0, hashIdx).split("/").pop();
          var currentPage = location.pathname.split("/").pop() || "index.html";
          if (!targetPage || targetPage === currentPage) return;
        }
        e.preventDefault();
        document.body.classList.add("page-leaving");
        setTimeout(function () { location.href = href; }, 200);
      });
    }
  });
})();
