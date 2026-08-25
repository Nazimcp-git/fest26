// js/router.js
// Hash-based single-page-app router.
// Maps URL hashes to render functions and sets up per-page listeners.

/** Builds navigation link HTML. */
const generateNavLinks = (mobile = false) => {
  const base = mobile
    ? "block px-4 py-3 text-sm font-medium rounded-lg transition-colors"
    : "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200";

  const links = `
    <a href="#/" class="nav-link text-gray-600 hover:text-gray-900 hover:bg-gray-100 ${base}"><i class="fas fa-home mr-1.5 text-xs"></i>Home</a>
    <a href="#/results" class="nav-link text-gray-600 hover:text-gray-900 hover:bg-gray-100 ${base}"><i class="fas fa-trophy mr-1.5 text-xs"></i>Results</a>
    <a href="#/leaderboard" class="nav-link text-gray-600 hover:text-gray-900 hover:bg-gray-100 ${base}"><i class="fas fa-chart-bar mr-1.5 text-xs"></i>Leaderboard</a>
    <a href="#/search" class="nav-link text-gray-600 hover:text-gray-900 hover:bg-gray-100 ${base}"><i class="fas fa-search mr-1.5 text-xs"></i>Search</a>
  `;

  const adminLink = currentUser
    ? `<a href="#/admin" class="nav-link text-gray-600 hover:text-gray-900 hover:bg-gray-100 ${base}"><i class="fas fa-cog mr-1.5 text-xs"></i>Admin</a>
       <button id="logout-btn" class="${mobile ? 'w-full text-left ' : ''}text-red-600 hover:text-red-700 hover:bg-red-50 ${base}"><i class="fas fa-sign-out-alt mr-1.5 text-xs"></i>Logout</button>`
    : `<a href="#/admin" class="nav-link text-gray-600 hover:text-gray-900 hover:bg-gray-100 ${base}"><i class="fas fa-lock mr-1.5 text-xs"></i>Admin Login</a>`;

  return links + adminLink;
};

/**
 * Main router. Called on hash change and after data sync.
 * @param {boolean} softUpdate  true = only refresh content, keep shell HTML
 */
async function router(softUpdate = false) {
  const hash    = window.location.hash.slice(1) || '/';
  const appEl   = document.getElementById("app");

  const isPublic = !hash.startsWith('/admin');

  // ── TV Display / Score ATM: Full-screen modes ──
  if (hash === '/atm') {
    window.location.href = '../atm/score-atm.html';
    return;
  }

  if (hash === '/tv') {
    document.body.className = "font-sans antialiased overflow-hidden";
    document.body.style.backgroundImage = 'none';
    const content = renderTVDisplayPage();
    appEl.innerHTML = content;
    // Start the live clock
    startTVClock();
    return;
  }
  
  if (hash.startsWith('/admin')) {
    document.body.className = "bg-gray-100/70 font-sans text-gray-800 antialiased overflow-y-scroll relative";
    document.body.style.backgroundImage = 'none';
  } else {
    document.body.className = "bg-[#f5f3ef] font-sans text-gray-800 antialiased selection:bg-orange-200 overflow-y-scroll relative";
    document.body.style.backgroundImage = "radial-gradient(at 0% 0%, hsla(28,100%,74%,0.15) 0px, transparent 50%), radial-gradient(at 100% 0%, hsla(189,100%,56%,0.15) 0px, transparent 50%), radial-gradient(at 100% 100%, hsla(355,100%,93%,0.15) 0px, transparent 50%), radial-gradient(at 0% 100%, hsla(340,100%,76%,0.15) 0px, transparent 50%)";
  }

  if (!softUpdate) {
    appEl.innerHTML = `
      <div class="min-h-screen flex flex-col relative z-10 overflow-hidden">
        <!-- Aurora Background (Public Only) -->
        ${isPublic ? `
        <div class="fixed inset-0 pointer-events-none z-0">
          <div class="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-pink-400/30 mix-blend-multiply filter blur-[120px] animate-blob"></div>
          <div class="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-orange-400/30 mix-blend-multiply filter blur-[120px] animate-blob animation-delay-2000"></div>
          <div class="absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] rounded-full bg-teal-400/30 mix-blend-multiply filter blur-[120px] animate-blob animation-delay-4000"></div>
        </div>` : ''}
        <!-- Navigation -->
        <nav class="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-6xl bg-white/20 backdrop-blur-3xl backdrop-saturate-[2.5] border-[0.5px] border-white/60 shadow-[0_8px_32px_0_rgba(0,0,0,0.05),inset_0_1px_1px_rgba(255,255,255,0.8)] rounded-[2rem] z-50 transition-all">
          <div class="px-6">
            <div class="flex items-center justify-between h-16">
              <a href="#/" class="flex items-center gap-3 group">
                <div class="w-10 h-10 rounded-[1.25rem] bg-orange-500/10 text-orange-600 border border-orange-500/20 flex items-center justify-center transition-all group-hover:scale-105">
                  <i class="fas fa-trophy text-sm"></i>
                </div>
                <span class="font-bold text-gray-900 text-lg tracking-tight">ART FEST <span class="text-orange-600">2K25</span></span>
              </a>
              <div class="hidden md:flex items-center gap-2" id="desktop-nav">
                ${generateNavLinks()}
              </div>
              <button id="mobile-menu-btn" class="md:hidden w-10 h-10 flex items-center justify-center rounded-[1.25rem] text-gray-600 hover:text-gray-900 hover:bg-white/50 transition-colors border border-transparent hover:border-white/60">
                <i class="fas fa-bars text-sm"></i>
              </button>
            </div>
          </div>
          <div id="mobile-nav-container" class="md:hidden border-t border-white/30 rounded-b-[2rem] overflow-hidden transition-all duration-300 ease-in-out" style="max-height:0;"></div>
        </nav>

        <!-- Main Content -->
        <main id="main-content" class="flex-grow pt-28">
          <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
            ${spinner('md')}
          </div>
        </main>

        <!-- Footer -->
        <footer class="mt-auto border-t border-white/50 bg-white/30 backdrop-blur-xl">
          <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
            <p class="text-xs text-gray-500 font-medium">© 2025 ART FEST 2K25</p>
            <p class="text-xs text-gray-500 font-medium">Darunnajath Islamic Complex</p>
          </div>
        </footer>

        <!-- Modal Container -->
        <div id="modal-container" class="hidden"></div>
        <!-- Print Area -->
        <div id="print-area" class="hidden"></div>
      </div>
    `;
  } else {
    // Soft update: refresh nav
    const desktopNav = document.getElementById('desktop-nav');
    if (desktopNav) desktopNav.innerHTML = generateNavLinks();

    if (hash.startsWith('/admin') && document.getElementById("admin-tabs")) {
      const activeTab = document.querySelector(".admin-tab.active");
      renderAdminTab(activeTab ? activeTab.dataset.tab : 'dashboard');
      return;
    }
  }

  const mainContent = appEl.querySelector("#main-content");
  if (!mainContent) return;

  // Highlight active nav link
  const currentHash = window.location.hash.slice(1) || '/';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute("href")?.slice(1) || '';
    const isActive = currentHash === href || (currentHash === '' && href === '/');
    link.classList.toggle("bg-white/60", isActive);
    link.classList.toggle("shadow-sm", isActive);
    link.classList.toggle("border", isActive);
    link.classList.toggle("border-white/50", isActive);
    link.classList.toggle("text-gray-900", isActive);
    
    link.classList.toggle("hover:bg-white/20", !isActive);
    link.classList.toggle("border-transparent", !isActive);
    link.classList.toggle("font-bold", isActive);
    link.classList.toggle("font-medium", !isActive);
  });

  // Route to render function
  const previousScroll = window.scrollY;


  let content;
  if (hash === '/judge') {
    window.location.href = '../judge/judge.html';
    return;
  }

  if (hash === '/penalty') {
    window.location.href = '../penalty/penalty.html';
    return;
  }

  if (hash.startsWith('/student/')) {
    const studentId = hash.split('/')[2];
    content = await renderStudentPage(studentId);
  } else if (hash.startsWith('/team/')) {
    const teamId = hash.split('/')[2];
    content = await renderTeamDetailPage(teamId);
  } else {
    const routes = {
      '/':            renderHomePage,
      '/results':     renderResultsPage,
      '/leaderboard': renderLeaderboardPage,
      '/search':      renderSearchPage,
      '/admin':       renderAdminPage,
      '/tv':          renderTVDisplayPage
    };
    const renderFn = routes[hash] || renderNotFoundPage;
    content = await renderFn();
  }

  mainContent.innerHTML = `<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><div class="page">${content}</div></div>`;
  attachPageEventListeners(hash);

  if (softUpdate) {
    requestAnimationFrame(() => window.scrollTo(0, previousScroll));
  }
}

/**
 * Attaches route-specific DOM event listeners after a page renders.
 * @param {string} hash  current URL hash path
 */
function attachPageEventListeners(hash) {
  if (hash.startsWith("/admin")) {

    // ── Tab switching ──
    document.getElementById("admin-tabs")?.addEventListener("click", e => {
      const tab = e.target.closest(".admin-tab");
      if (tab) {
        activeAdminTab = tab.dataset.tab;
        renderAdminTab(activeAdminTab);
      }
    });

    // ── Minimize / Expand Top Navigation Bar ──
    document.getElementById("toggle-admin-nav-btn")?.addEventListener("click", () => {
      isAdminNavMinimized = !isAdminNavMinimized;
      const wrapper = document.getElementById("admin-tabs-wrapper");
      const btn = document.getElementById("toggle-admin-nav-btn");
      const card = document.getElementById("admin-top-nav-card");
      
      if (wrapper) wrapper.classList.toggle("hidden", isAdminNavMinimized);
      if (card) {
        const titleRow = card.firstElementChild;
        if (titleRow) {
          titleRow.classList.toggle("pb-3", !isAdminNavMinimized);
          titleRow.classList.toggle("mb-3", !isAdminNavMinimized);
          titleRow.classList.toggle("border-b", !isAdminNavMinimized);
          titleRow.classList.toggle("border-gray-100", !isAdminNavMinimized);
        }
      }
      
      // Update badge in title
      const titleFlex = card?.querySelector('.flex.items-center.gap-2');
      if (titleFlex) {
        let badge = titleFlex.querySelector('#minimized-tab-badge');
        if (isAdminNavMinimized) {
          if (!badge) {
            const tabs = [
              { id: 'dashboard', icon: 'fa-chart-pie', label: 'Dashboard' },
              { id: 'status', icon: 'fa-tasks', label: 'Program Status' },
              { id: 'results', icon: 'fa-upload', label: 'Upload Results' },
              { id: 'publish', icon: 'fa-check-double', label: 'Publish' },
              { id: 'announce', icon: 'fa-bullhorn', label: 'Announce Live' },
              { id: 'preview', icon: 'fa-eye', label: 'Score Preview' },
              { id: 'students', icon: 'fa-user-graduate', label: 'Students' },
              { id: 'teams', icon: 'fa-users', label: 'Teams' },
              { id: 'programs', icon: 'fa-list-alt', label: 'Programs' },
              { id: 'points', icon: 'fa-cog', label: 'Points Config' },
              { id: 'penalty', icon: 'fa-minus-circle', label: 'Penalty' }
            ];
            const activeObj = tabs.find(t => t.id === activeAdminTab) || tabs[0];
            titleFlex.insertAdjacentHTML('beforeend', `<span id="minimized-tab-badge" class="px-2.5 py-0.5 bg-gray-900 text-white rounded text-[11px] font-bold"><i class="fas ${activeObj.icon} mr-1"></i>${activeObj.label}</span>`);
          }
        } else {
          if (badge) badge.remove();
        }
      }

      if (btn) {
        btn.innerHTML = `<i class="fas ${isAdminNavMinimized ? 'fa-chevron-down' : 'fa-chevron-up'} text-xs"></i><span>${isAdminNavMinimized ? 'Expand Menu' : 'Minimize Menu'}</span>`;
      }
    });

    const adminContent = document.getElementById("admin-tab-content");
    adminContent?.addEventListener("submit",  handleAdminFormSubmit);
    adminContent?.addEventListener("change",  handleAdminFormChange);
    adminContent?.addEventListener("click",   handleAdminListClick);

    adminContent?.addEventListener("click", e => {
      if (e.target.id === "add-participant-btn")        addParticipantToTempList();
      if (e.target.matches(".remove-participant-btn"))  removeParticipantFromTempList(e.target.dataset.index);
      if (e.target.id === "download-student-template")  downloadTemplate("student");
      if (e.target.id === "download-program-template")  downloadTemplate('program');
      if (e.target.matches("#status-filter-container .category-filter-btn")) {
        activeStatusFilter = e.target.dataset.status;
        renderAdminTab('status');
      }
      if (e.target.matches("#category-filter-container .category-filter-btn")) {
        activeStatusCategoryFilter = e.target.dataset.category;
        renderAdminTab('status');
      }
      if (e.target.matches("#stage-filter-container .category-filter-btn")) {
        activeStatusStageFilter = e.target.dataset.stage;
        renderAdminTab('status');
      }

      // Penalty Tab: Preset Minus Points Buttons
      const presetBtn = e.target.closest('.preset-penalty-btn');
      if (presetBtn) {
        const pts = presetBtn.dataset.pts;
        const ptsInput = document.getElementById('student-penalty-points');
        if (ptsInput) ptsInput.value = pts;
      }

      // Penalty Tab: History View Toggle (Students / Teams)
      const toggleBtn = e.target.closest('.penalty-toggle-btn');
      if (toggleBtn) {
        document.querySelectorAll('.penalty-toggle-btn').forEach(btn => {
          btn.classList.remove('bg-white', 'text-gray-900', 'shadow-xs', 'font-bold');
          btn.classList.add('text-gray-500', 'font-medium');
        });
        toggleBtn.classList.add('bg-white', 'text-gray-900', 'shadow-xs', 'font-bold');
        toggleBtn.classList.remove('text-gray-500', 'font-medium');
        activePenaltyViewType = toggleBtn.dataset.type;
        loadItemsList('penalty');
      }
    });

    // Student Filter helper in Penalty tab
    const filterPenaltyStudents = () => {
      const searchTerm = (document.getElementById('penalty-student-search')?.value || '').toLowerCase().trim();
      const teamId     = document.getElementById('penalty-filter-team')?.value || '';
      const category   = document.getElementById('penalty-filter-category')?.value || '';
      const className  = document.getElementById('penalty-filter-class')?.value || '';

      const selectEl = document.getElementById('student-penalty-student-id');
      if (!selectEl) return;

      Array.from(selectEl.options).forEach(opt => {
        if (!opt.value) return; // Skip placeholder option
        const matchSearch   = !searchTerm || opt.dataset.search?.includes(searchTerm);
        const matchTeam     = !teamId     || opt.dataset.team === teamId;
        const matchCategory = !category   || opt.dataset.category === category;
        const matchClass    = !className  || opt.dataset.class === className;

        if (matchSearch && matchTeam && matchCategory && matchClass) {
          opt.style.display = '';
        } else {
          opt.style.display = 'none';
        }
      });
    };

    // Debounced publish search and penalty student filtering
    const publishSearchHandler = debounce((term) => {
      document.querySelectorAll('#publish-list .program-item-container').forEach(item => {
        item.style.display = item.dataset.programName?.includes(term) ? '' : 'none';
      });
    }, 250);

    adminContent?.addEventListener('input', e => {
      if (e.target.id === 'publish-search-input') {
        publishSearchHandler(e.target.value.toLowerCase());
      }
      if (e.target.id === 'penalty-student-search') {
        filterPenaltyStudents();
      }
    });

    adminContent?.addEventListener('change', e => {
      if (['penalty-filter-team', 'penalty-filter-category', 'penalty-filter-class'].includes(e.target.id)) {
        filterPenaltyStudents();
      }
    });
  }

  if (hash === '/search') {
    document.getElementById('profile-search-form')?.addEventListener('submit', handleProfileSearch);
  }

  if (hash === "/results") {
    const mainEl = document.getElementById("main-content");

    mainEl?.addEventListener("submit", e => {
      if (e.target.id === "results-search-form") {
        e.preventDefault();
        const val = document.getElementById("results-search-input").value;
        const activeStageFilter = document.querySelector("#results-stage-filter-container .active")?.dataset.stage || 'All';
        renderResultsPage(val, activeStageFilter).then(html => {
          mainEl.innerHTML = `<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><div class="page">${html}</div></div>`;
          attachPageEventListeners('/results');
        });
      }
    });

    mainEl?.addEventListener("click", e => {
      if (e.target.matches("#results-stage-filter-container .category-filter-btn")) {
        const stage = e.target.dataset.stage;
        const val = document.getElementById("results-search-input")?.value || '';
        renderResultsPage(val, stage).then(html => {
          mainEl.innerHTML = `<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><div class="page">${html}</div></div>`;
          attachPageEventListeners('/results');
        });
      }
    });
  }

  if (hash === "/leaderboard") {
    document.getElementById("leaderboard-filter-container")?.addEventListener("click", e => {
      if (e.target.classList.contains("category-filter-btn")) {
        renderLeaderboardPage(e.target.dataset.category).then(html => {
          const mainEl = document.getElementById("main-content");
          mainEl.innerHTML = `<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><div class="page">${html}</div></div>`;
          attachPageEventListeners('/leaderboard');
        });
      }
    });
  }
}
