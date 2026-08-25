// js/events.js
// Global document-level event listeners, Firebase auth observer, and app bootstrap.

// ── Global click delegation ───────────────────────────────────────────────────
document.addEventListener('click', e => {
  // Logout
  if (e.target.closest("#logout-btn")) {
    auth.signOut().then(() => {
      ToastEngine.success('Logged out successfully');
    }).catch(err => {
      ToastEngine.error('Logout failed: ' + err.message);
    });
  }

  // Mobile hamburger menu
  const mobileMenuBtn = e.target.closest('#mobile-menu-btn');
  if (mobileMenuBtn) {
    const mobileNav = document.getElementById('mobile-nav-container');
    const icon = mobileMenuBtn.querySelector('i');
    const isOpen = mobileNav.style.maxHeight !== '0px';
    
    if (isOpen) {
      mobileNav.style.maxHeight = '0px';
      icon.className = 'fas fa-bars text-sm';
    } else {
      mobileNav.innerHTML = `<div class="p-4 space-y-1">${generateNavLinks(true)}</div>`;
      mobileNav.style.maxHeight = mobileNav.scrollHeight + 'px';
      icon.className = 'fas fa-times text-sm';
    }
  }

  // Team card → open modal
  const teamCard = e.target.closest('.team-card-clickable');
  if (teamCard) openTeamModal(teamCard.dataset.teamId);

  // Close mobile nav when any nav-link or logout is tapped
  if (e.target.closest(".nav-link") || e.target.closest("#logout-btn")) {
    const mobileNav = document.getElementById("mobile-nav-container");
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    if (mobileNav && mobileNav.style.maxHeight !== '0px') {
      mobileNav.style.maxHeight = '0px';
      if (mobileMenuBtn) mobileMenuBtn.querySelector('i').className = 'fas fa-bars text-sm';
    }
  }
});

// ── Login form submission ─────────────────────────────────────────────────────
document.addEventListener("submit", async e => {
  if (e.target.id === "login-form") {
    e.preventDefault();
    const email    = e.target.email.value;
    const password = e.target.password.value;
    const errorEl  = document.getElementById("login-error");
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    try {
      errorEl.textContent = '';
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin mr-2"></i>Signing in...';
      
      await auth.signInWithEmailAndPassword(email, password);
      ToastEngine.success('Logged in successfully');
      window.location.hash = "/admin";
    } catch (err) {
      errorEl.textContent = err.message;
      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign in';
    }
  }
});

// ── Firebase Auth state observer ──────────────────────────────────────────────
auth.onAuthStateChanged(user => {
  const authChanged = !!currentUser !== !!user;
  currentUser = user;
  if (authChanged) {
    isInitialLoad = true;
    router();
  }
});

// ── SPA routing hooks ─────────────────────────────────────────────────────────
window.addEventListener('hashchange', () => router());

// ── Bootstrap: start data sync when DOM is ready ──────────────────────────────
window.addEventListener("DOMContentLoaded", syncData);
