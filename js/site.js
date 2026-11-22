/* site.js - shared behaviour for every page: menu, links, reveals and countdown. */

"use strict";

// Mark the page so CSS only hides reveal items when JavaScript can show them.
document.documentElement.classList.add("js");

// Remember whether the user prefers less movement.
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Get the shared menu buttons once, so every function can use them.
const menuButton = document.querySelector(".nav-toggle");
const primaryNav = document.getElementById("primary-nav");
const navLinks = document.querySelectorAll("[data-nav]");

// Get the footer year spans once.
const yearSpans = document.querySelectorAll("[data-year]");

// Get the home page countdown numbers once.
const countDays = document.querySelector('[data-count="days"]');
const countHours = document.querySelector('[data-count="hours"]');
const countMinutes = document.querySelector('[data-count="minutes"]');
const countSeconds = document.querySelector('[data-count="seconds"]');
let kickoffTime = 0;

// Put the current year in every footer span.
function setFooterYear() {
  const thisYear = String(new Date().getFullYear());
  for (let i = 0; i < yearSpans.length; i++) {
    yearSpans[i].textContent = thisYear;
  }
}

// Open the mobile menu.
function openMenu() {
  if (menuButton && primaryNav) {
    menuButton.setAttribute("aria-expanded", "true");
    menuButton.setAttribute("aria-label", "Close menu");
    primaryNav.classList.add("is-open");
  }
}

// Close the mobile menu.
function closeMenu() {
  if (menuButton && primaryNav) {
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open menu");
    primaryNav.classList.remove("is-open");
  }
}

// Open or close the menu when the hamburger button is clicked.
function toggleMenu() {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  if (isOpen) {
    closeMenu();
  } else {
    openMenu();
  }
}

// Close the menu when the Escape key is pressed.
function handleKeyDown(event) {
  if (event.key === "Escape") {
    closeMenu();
  }
}

// Close the menu when the user clicks outside the header.
function handleDocumentClick(event) {
  const insideHeader = event.target.closest(".site-header");
  if (!insideHeader) {
    closeMenu();
  }
}

// Close the menu after a link inside it is clicked.
function handleNavClick(event) {
  const clickedLink = event.target.closest("a");
  if (clickedLink) {
    closeMenu();
  }
}

// Mark one navigation link as active and clear the others.
function setActiveLink(key) {
  if (!key) {
    return;
  }

  for (let i = 0; i < navLinks.length; i++) {
    const link = navLinks[i];
    if (link.dataset.nav === key) {
      link.classList.add("is-active");
      link.setAttribute("aria-current", "true");
    } else {
      link.classList.remove("is-active");
      link.removeAttribute("aria-current");
    }
  }
}

// Treat index.html and page1.html as the same page as "/".
function normalizePath(path) {
  let result = path.replace(/\/index\.html$/, "/");
  result = result.replace(/\/page1\.html$/, "/");
  return result;
}

// Scroll to a section on the same page when its link is clicked.
function handleSectionLink(event) {
  const link = event.currentTarget;
  const url = new URL(link.href, window.location.href);
  const id = decodeURIComponent(url.hash.slice(1));
  const target = document.getElementById(id);

  if (!target) {
    return;
  }

  event.preventDefault();

  let scrollType = "smooth";
  if (reduceMotion) {
    scrollType = "auto";
  }

  target.scrollIntoView({ behavior: scrollType, block: "start" });
  closeMenu();
  setActiveLink(id);

  try {
    history.replaceState(null, "", url.hash);
  } catch (error) {
    // Changing the hash is optional in restricted browsers.
  }
}

// Change the active link while the user scrolls the home page.
function handleScrollSpy(entries) {
  for (let i = 0; i < entries.length; i++) {
    if (entries[i].isIntersecting) {
      setActiveLink(entries[i].target.id);
    }
  }
}

// Show a reveal item when it scrolls into view.
function handleReveal(entries, observer) {
  for (let i = 0; i < entries.length; i++) {
    if (entries[i].isIntersecting) {
      entries[i].target.classList.add("is-visible");
      observer.unobserve(entries[i].target);
    }
  }
}

// Add a zero in front of a small number.
function padNumber(value) {
  if (value < 10) {
    return "0" + value;
  }
  return String(value);
}

// Update the four countdown numbers.
function updateCountdown() {
  const remaining = kickoffTime - Date.now();

  if (remaining <= 0) {
    countDays.textContent = "00";
    countHours.textContent = "00";
    countMinutes.textContent = "00";
    countSeconds.textContent = "00";
    return;
  }

  const totalSeconds = Math.floor(remaining / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  countDays.textContent = String(days);
  countHours.textContent = padNumber(hours);
  countMinutes.textContent = padNumber(minutes);
  countSeconds.textContent = padNumber(seconds);
}

// Set up the footer year.
setFooterYear();

// Set up the mobile menu.
if (menuButton && primaryNav) {
  menuButton.addEventListener("click", toggleMenu);
  primaryNav.addEventListener("click", handleNavClick);
  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("click", handleDocumentClick);
}

// Highlight the link for the current page.
setActiveLink(document.body.dataset.navActive);

// Set up smooth scrolling for links that point to a section on this page.
const allLinks = document.querySelectorAll("a[href]");
for (let i = 0; i < allLinks.length; i++) {
  const link = allLinks[i];
  let url;

  try {
    url = new URL(link.href, window.location.href);
  } catch (error) {
    continue;
  }

  const samePage = url.origin === window.location.origin &&
    normalizePath(url.pathname) === normalizePath(window.location.pathname);

  if (samePage && url.hash) {
    link.addEventListener("click", handleSectionLink);
  }
}

// Set up the scroll spy on the home page sections.
const spySections = document.querySelectorAll("#home, #about, #stadiums, #contact");
if (spySections.length > 0 && "IntersectionObserver" in window) {
  const spyObserver = new IntersectionObserver(handleScrollSpy, {
    rootMargin: "-40% 0px -55% 0px",
    threshold: 0
  });

  for (let i = 0; i < spySections.length; i++) {
    spyObserver.observe(spySections[i]);
  }
}

// Set up the scroll reveal animation.
const revealItems = document.querySelectorAll(".reveal");
if (reduceMotion || !("IntersectionObserver" in window)) {
  for (let i = 0; i < revealItems.length; i++) {
    revealItems[i].classList.add("is-visible");
  }
} else {
  const revealObserver = new IntersectionObserver(handleReveal, {
    threshold: 0.12,
    rootMargin: "0px 0px -40px 0px"
  });

  for (let i = 0; i < revealItems.length; i++) {
    revealObserver.observe(revealItems[i]);
  }
}

// Start the countdown only on the home page.
if (countDays) {
  // DEMO DATE: change this if the official kick-off date changes (13 June 2030, UTC).
  kickoffTime = new Date("2030-06-13T00:00:00Z").getTime();
  updateCountdown();
  window.setInterval(updateCountdown, 1000);
}
