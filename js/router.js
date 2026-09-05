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
  
  document.body.className = "bg-[#f5f3ef] font-sans text-gray-800 antialiased selection:bg-orange-200 overflow-y-scroll relative";
  document.body.style.backgroundImage = "radial-gradient(at 0% 0%, hsla(28,100%,74%,0.15) 0px, transparent 50%), radial-gradient(at 100% 0%, hsla(189,100%,56%,0.15) 0px, transparent 50%), radial-gradient(at 100% 100%, hsla(355,100%,93%,0.15) 0px, transparent 50%), radial-gradient(at 0% 100%, hsla(340,100%,76%,0.15) 0px, transparent 50%)";

  // Dismiss loading screen if present
  const _loader = document.getElementById('loading-screen');
  if (_loader) { _loader.remove(); }

  if (!softUpdate) {
    appEl.innerHTML = `
      <div class="min-h-screen flex flex-col relative z-10 overflow-hidden">
        <!-- Aurora Background -->
        <div class="fixed inset-0 pointer-events-none z-0">
          <div class="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-pink-400/30 mix-blend-multiply filter blur-[120px] animate-blob"></div>
          <div class="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-orange-400/30 mix-blend-multiply filter blur-[120px] animate-blob animation-delay-2000"></div>
          <div class="absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] rounded-full bg-teal-400/30 mix-blend-multiply filter blur-[120px] animate-blob animation-delay-4000"></div>
        </div>
        <!-- Navigation -->
        <nav class="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-6xl bg-white/20 backdrop-blur-3xl backdrop-saturate-[2.5] border-[0.5px] border-white/60 shadow-[0_8px_32px_0_rgba(0,0,0,0.05),inset_0_1px_1px_rgba(255,255,255,0.8)] rounded-[2rem] z-50 transition-all">
          <div class="px-6">
            <div class="flex items-center justify-between h-16">
              <a href="#/" class="flex items-center gap-3 group">
                <div class="w-10 h-10 rounded-[1.25rem] bg-orange-500/10 text-orange-600 border border-orange-500/20 flex items-center justify-center transition-all group-hover:scale-105">
                  <i class="fas fa-trophy text-sm"></i>
                </div>
                <span class="font-bold text-gray-900 text-lg tracking-tight">Alert <span class="text-orange-600">2k26</span></span>
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
            <p class="text-xs text-gray-500 font-medium">© 2026 Alert 2k26</p>
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
  if (hash.startsWith('/student/')) {
    const studentId = hash.split('/')[2];
    content = await renderStudentPage(studentId);
  } else if (hash.startsWith('/team/')) {
    const teamId = decodeURIComponent(hash.split('/')[2]);
    content = await renderTeamPage(teamId);
  } else {
    const routes = {
      '/':            renderHomePage,
      '/results':     renderResultsPage,
      '/leaderboard': renderLeaderboardPage,
      '/search':      renderSearchPage,
      '/admin':       renderAdminPage
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

    // ── Sidebar slide toggle (Mobile Only) ──
    const sidebar = document.getElementById('admin-sidebar');
    const backdrop = document.getElementById('admin-sidebar-backdrop');
    
    const openSidebar = () => {
      sidebar?.classList.replace('-translate-x-full', 'translate-x-0');
      backdrop?.classList.remove('hidden');
    };
    const closeSidebar = () => {
      sidebar?.classList.replace('translate-x-0', '-translate-x-full');
      backdrop?.classList.add('hidden');
    };
    
    document.getElementById('admin-sidebar-toggle')?.addEventListener('click', openSidebar);
    document.getElementById('admin-sidebar-close')?.addEventListener('click', closeSidebar);
    backdrop?.addEventListener('click', closeSidebar);

    // ── Tab switching ──
    document.getElementById("admin-tabs")?.addEventListener("click", e => {
      const tab = e.target.closest(".admin-tab");
      if (tab) {
        activeAdminTab = tab.dataset.tab;
        renderAdminTab(activeAdminTab);
        // Automatically close on mobile after selecting a tab
        if (window.innerWidth < 1024) closeSidebar();
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
    });

    // Debounced publish search
    const publishSearchHandler = debounce((term) => {
      document.querySelectorAll('#publish-list .program-item-container').forEach(item => {
        item.style.display = item.dataset.programName?.includes(term) ? '' : 'none';
      });
    }, 250);

    adminContent?.addEventListener('input', e => {
      if (e.target.id === 'publish-search-input') {
        publishSearchHandler(e.target.value.toLowerCase());
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

  if (hash.startsWith("/team/")) {
    if (typeof attachTeamPageListeners === "function") {
      attachTeamPageListeners();
    }
  }
}
