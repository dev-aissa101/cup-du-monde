/* login.js - validation and the demo login behaviour for pages/login.html. */

"use strict";

// Get the login form elements once.
const loginForm = document.getElementById("login-form");
const loginIdentifier = document.getElementById("identifier");
const loginPassword = document.getElementById("password");
const loginError = document.getElementById("form-error");

// Show one short error message under the login form.
function showError(message) {
  loginError.textContent = message;
  loginError.hidden = false;
  loginIdentifier.setAttribute("aria-invalid", "true");
  loginPassword.setAttribute("aria-invalid", "true");
}

// Remove the error message from the login form.
function clearError() {
  loginError.textContent = "";
  loginError.hidden = true;
  loginIdentifier.removeAttribute("aria-invalid");
  loginPassword.removeAttribute("aria-invalid");
}

// Clear the login error when the user starts typing again.
function clearErrorOnInput() {
  if (loginError.hidden === false) {
    clearError();
  }
}

// Check the login fields and return the username, or null if something is wrong.
function checkLoginForm() {
  const user = loginIdentifier.value.trim();
  const pass = loginPassword.value;

  if (user === "" || pass === "") {
    showError("Please fill in both fields.");
    return null;
  }

  if (pass.length < 6) {
    showError("Password must be at least 6 characters.");
    return null;
  }

  clearError();
  return user;
}

// Handle the demo login. There is no real backend on this static site.
function handleLoginSubmit(event) {
  event.preventDefault();

  const user = checkLoginForm();
  if (user === null) {
    if (loginIdentifier.value.trim() === "") {
      loginIdentifier.focus();
    } else {
      loginPassword.focus();
    }
    return;
  }

  // DEMO ONLY - NOT REAL AUTHENTICATION. Replace with a real backend before launch.
  try {
    localStorage.setItem("wc2030DemoLoggedIn", "true");
    localStorage.setItem("wc2030DemoUser", user);
  } catch (error) {
    // Storage can be blocked, but the demo still continues.
  }

  window.location.href = "../index.html";
}

// Set up the login form only on the login page.
if (loginForm) {
  loginIdentifier.addEventListener("input", clearErrorOnInput);
  loginPassword.addEventListener("input", clearErrorOnInput);
  loginForm.addEventListener("submit", handleLoginSubmit);
}
