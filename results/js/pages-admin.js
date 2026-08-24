// js/pages-admin.js
// Admin panel layout and sub-page render functions.

async function renderAdminPage() {
  if (!currentUser) {
    return `
      <div class="flex items-center justify-center min-h-[calc(100vh-160px)]">
        <div class="w-full max-w-sm bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div class="text-center mb-6">
            <h2 class="text-xl font-bold text-gray-900">Admin Sign In</h2>
            <p class="text-xs text-gray-500 mt-1">Enter your credentials to access the admin panel.</p>
          </div>
          <form id="login-form" class="space-y-4">
            <div>
              <label for="email" class="block text-xs font-semibold text-gray-700 mb-1">Email</label>
              <input id="email" name="email" type="email" required 
                class="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:border-gray-900" 
                placeholder="admin@example.com">
            </div>
            <div>
              <label for="password" class="block text-xs font-semibold text-gray-700 mb-1">Password</label>
              <input id="password" name="password" type="password" required 
                class="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:border-gray-900" 
                placeholder="••••••••">
            </div>
            <button type="submit" class="w-full py-2 px-4 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-lg transition-colors">
              Sign in
            </button>
            <p id="login-error" class="text-red-500 text-xs text-center mt-2"></p>
          </form>
        </div>
      </div>`;
  }
  return renderAdminDashboard();
}

let isAdminNavMinimized = false;

async function renderAdminDashboard() {
  setTimeout(() => renderAdminTab(activeAdminTab), 0);
  
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
    { id: 'judges', icon: 'fa-gavel', label: 'Judges Config' },
    { id: 'points', icon: 'fa-cog', label: 'Points Config' },
    { id: 'penalty', icon: 'fa-minus-circle', label: 'Penalty' }
  ];

  const activeTabObj = tabs.find(t => t.id === activeAdminTab) || tabs[0];

  const tabsHtml = tabs.map(t => `
    <button data-tab="${t.id}" class="admin-tab flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors border border-gray-200/80 bg-gray-50/50">
      <i class="fas ${t.icon} text-xs"></i>
      <span>${t.label}</span>
    </button>`).join('');

  return `
    <div class="max-w-7xl mx-auto pb-12 px-4 sm:px-6 lg:px-8 space-y-4 mt-6">
      
      <!-- Top Minimizable Admin Header & Navigation Bar -->
      <div class="bg-white border border-gray-200 rounded-xl p-4 shadow-sm" id="admin-top-nav-card">
        <div class="flex items-center justify-between gap-3 ${isAdminNavMinimized ? '' : 'pb-3 mb-3 border-b border-gray-100'}">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-gray-900 text-white flex items-center justify-center text-xs font-bold">
              <i class="fas fa-user-shield"></i>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-sm font-bold text-gray-900 leading-none">Admin Panel</h1>
                ${isAdminNavMinimized ? `<span id="minimized-tab-badge" class="px-2.5 py-0.5 bg-gray-900 text-white rounded text-[11px] font-bold"><i class="fas ${activeTabObj.icon} mr-1"></i>${activeTabObj.label}</span>` : ''}
              </div>
              <p class="text-[10px] text-gray-400 font-medium mt-0.5">Festival Management</p>
            </div>
          </div>
          <button id="toggle-admin-nav-btn" class="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5">
            <i class="fas ${isAdminNavMinimized ? 'fa-chevron-down' : 'fa-chevron-up'} text-xs"></i>
            <span>${isAdminNavMinimized ? 'Expand Menu' : 'Minimize Menu'}</span>
          </button>
        </div>

        <!-- Non-scrollable All-in-One Flex Wrap Grid -->
        <div id="admin-tabs-wrapper" class="${isAdminNavMinimized ? 'hidden' : ''}">
          <div class="flex flex-wrap items-center gap-2" id="admin-tabs">
            ${tabsHtml}
          </div>
        </div>
      </div>
      
      <!-- Main Content Container -->
      <main class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm min-h-[600px]">
        <div id="admin-tab-content">
          ${spinner('lg')}
        </div>
      </main>

    </div>`;
}

// Global reference for table components
const TableComponents = {
  header: (columns) => `
    <thead class="bg-gray-50 border-b border-gray-200">
      <tr>${columns.map(c => `<th class="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider ${c.cls || ''}">${c.label}</th>`).join('')}</tr>
    </thead>`,
  wrapper: (content) => `
    <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          ${content}
        </table>
      </div>
    </div>`
};

async function renderAdminTab(tabId) {
  const container = document.getElementById('admin-tab-content');
  if (!container) return;

  document.querySelectorAll(".admin-tab").forEach(tab => {
    const isActive = tab.dataset.tab === tabId;
    tab.classList.toggle("bg-gray-900", isActive);
    tab.classList.toggle("text-white", isActive);
    tab.classList.toggle("font-semibold", isActive);
    tab.classList.toggle("shadow-xs", isActive);
    tab.classList.toggle("border-gray-900", isActive);
    tab.classList.toggle("text-gray-700", !isActive);
    tab.classList.toggle("hover:bg-gray-100", !isActive);
    tab.classList.toggle("hover:text-gray-900", !isActive);
  });

  const minBadge = document.getElementById('minimized-tab-badge');
  if (minBadge) {
    const tabObj = [
      { id: 'dashboard', icon: 'fa-chart-pie', label: 'Dashboard' },
      { id: 'status', icon: 'fa-tasks', label: 'Program Status' },
      { id: 'results', icon: 'fa-upload', label: 'Upload Results' },
      { id: 'publish', icon: 'fa-check-double', label: 'Publish' },
      { id: 'announce', icon: 'fa-bullhorn', label: 'Announce Live' },
      { id: 'preview', icon: 'fa-eye', label: 'Score Preview' },
      { id: 'students', icon: 'fa-user-graduate', label: 'Students' },
      { id: 'teams', icon: 'fa-users', label: 'Teams' },
      { id: 'programs', icon: 'fa-list-alt', label: 'Programs' },
      { id: 'judges', icon: 'fa-gavel', label: 'Judges Config' },
      { id: 'points', icon: 'fa-cog', label: 'Points Config' },
      { id: 'penalty', icon: 'fa-minus-circle', label: 'Penalty' }
    ].find(t => t.id === tabId);
    if (tabObj) minBadge.innerHTML = `<i class="fas ${tabObj.icon} mr-1"></i>${tabObj.label}`;
  }

  let html = '';
  switch (tabId) {
    case 'dashboard': html = await renderDashboardTab(); break;
    case 'status':    html = renderProgramStatusTab(activeStatusFilter, activeStatusCategoryFilter, activeStatusStageFilter); break;
    case 'results':   html = renderUploadResultsTab(); break;
    case 'publish':   html = renderPublishTab(); break;
    case 'announce':  html = renderAnnounceLiveTab(); break;
    case 'preview':   html = renderScorePreviewTab(); break;
    case 'students':  html = renderStudentsTab(); break;
    case 'teams':     html = renderTeamsTab(); break;
    case 'programs':  html = renderProgramsTab(); break;
    case 'judges':    html = renderJudgesTab(); break;
    case 'points':    html = renderPointsConfigTab(); break;
    case 'penalty':   html = renderPenaltyTab(); break;
  }

  container.innerHTML = html;

  // Post-render actions
  if (tabId === "results") loadRecentResults();
  if (['students', 'teams', 'programs', 'penalty', 'judges'].includes(tabId)) loadItemsList(tabId);
}

// ── Tab Renderers ────────────────────────────────────────────────────────

async function renderDashboardTab() {
  const { teamsArray, studentsArray, classesArray } = calculateAllScoresInternal();

  const allResults = getDataAsArray("results");
  const pendingCount   = allResults.filter(r => r.status === "pending" || !r.status).length;
  const readyCount     = allResults.filter(r => r.status === "ready").length;
  const publishedCount = allResults.filter(r => r.status === "published").length;
  const totalPrograms  = Object.keys(appData.programs || {}).length;

  const teamsHtml = teamsArray.length === 0 ? emptyState('fa-users', 'No teams data') : teamsArray.map((team, i) => {
    const catChips = CATEGORIES.map(cat => {
      const pts = (team.categoryPoints && team.categoryPoints[cat]) || 0;
      return `<span class="text-[10px] font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-600">${cat}: ${pts}</span>`;
    }).join(' ');

    return `
      <div class="bg-white rounded-xl border border-gray-200/60 p-5 shadow-sm flex flex-col justify-between">
        <div>
          <div class="flex justify-between items-center mb-2">
            <h3 class="font-semibold text-gray-900">${sanitize(team.name)}</h3>
            ${i < 3 ? `<i class="fas fa-medal text-${['yellow-500','gray-400','amber-600'][i]}"></i>` : `<span class="text-xs text-gray-400 font-medium">#${i+1}</span>`}
          </div>
          <p class="text-3xl font-bold text-gray-900 mb-3">${team.totalPoints}</p>
        </div>
        <div class="flex flex-wrap gap-1 pt-2 border-t border-gray-100 mt-2">
          ${catChips}
        </div>
      </div>`;
  }).join('');

  const classesHtml = !classesArray || classesArray.length === 0 ? emptyState('fa-chalkboard-teacher', 'No class data') : classesArray.slice(0, 10).map((c, i) => `
    <div class="bg-white rounded-xl border border-indigo-200/60 p-4 shadow-sm flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center font-bold text-indigo-700 text-xs">${i+1}</div>
        <h3 class="font-semibold text-gray-900">Class ${sanitize(c.name)}</h3>
      </div>
      <p class="text-xl font-bold text-indigo-600">${c.totalPoints}</p>
    </div>`).join('');

  const tableBody = studentsArray.length === 0 
    ? `<tr><td colspan="5" class="text-center py-8 text-gray-500">No students yet</td></tr>`
    : studentsArray.slice(0, 50).map((s, i) => `
      <tr class="hover:bg-gray-50/50">
        <td class="px-5 py-3 font-medium text-gray-400">${i+1}</td>
        <td class="px-5 py-3 font-medium text-indigo-600"><a href="#/student/${s.id}" class="hover:underline" target="_blank">${sanitize(s.name)}</a></td>
        <td class="px-5 py-3 text-gray-500">${sanitize(appData.teams[s.teamId]?.name || 'N/A')}</td>
        <td class="px-5 py-3">${categoryBadge(s.category)}</td>
        <td class="px-5 py-3 font-semibold text-gray-900">${s.totalPoints || 0}</td>
      </tr>`).join('');

  return `
    <div class="space-y-8">
      <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
        <i class="fas fa-info-circle text-amber-500 mt-0.5"></i>
        <div>
          <h4 class="text-sm font-semibold text-amber-800">Internal Live Dashboard</h4>
          <p class="text-xs text-amber-700 mt-1">This view shows ALL scores (Pending + Ready + Published). It is not the public leaderboard.</p>
        </div>
      </div>

      <!-- Program Result Stages Summary -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="bg-white rounded-xl border border-gray-200/60 p-4 shadow-sm">
          <div class="flex items-center justify-between text-xs text-gray-500 font-medium mb-1">
            <span>Total Programs</span>
            <i class="fas fa-list-alt text-gray-400"></i>
          </div>
          <p class="text-2xl font-bold text-gray-900">${totalPrograms}</p>
        </div>
        <div class="bg-amber-50/50 rounded-xl border border-amber-200/60 p-4 shadow-sm">
          <div class="flex items-center justify-between text-xs text-amber-700 font-medium mb-1">
            <span>Pending Results</span>
            <i class="fas fa-hourglass-half text-amber-500"></i>
          </div>
          <p class="text-2xl font-bold text-amber-700">${pendingCount}</p>
        </div>
        <div class="bg-blue-50/50 rounded-xl border border-blue-200/60 p-4 shadow-sm">
          <div class="flex items-center justify-between text-xs text-blue-700 font-medium mb-1">
            <span>Ready to Publish</span>
            <i class="fas fa-clock text-blue-500"></i>
          </div>
          <p class="text-2xl font-bold text-blue-700">${readyCount}</p>
        </div>
        <div class="bg-emerald-50/50 rounded-xl border border-emerald-200/60 p-4 shadow-sm">
          <div class="flex items-center justify-between text-xs text-emerald-700 font-medium mb-1">
            <span>Published Live</span>
            <i class="fas fa-check-circle text-emerald-500"></i>
          </div>
          <p class="text-2xl font-bold text-emerald-700">${publishedCount}</p>
        </div>
      </div>

      <div>
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Live Team Standings (All Results Included)</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">${teamsHtml}</div>
      </div>
      <div>
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Live Class Standings (All Results Included)</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">${classesHtml}</div>
      </div>
      <div>
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Live Student Leaders (Top 50 - All Results Included)</h2>
        ${TableComponents.wrapper(`
          ${TableComponents.header([{label:'Rank'},{label:'Student'},{label:'Team'},{label:'Category'},{label:'Points'}])}
          <tbody class="divide-y divide-gray-50">${tableBody}</tbody>
        `)}
      </div>
    </div>`;
}

function renderProgramStatusTab(statusFilter, categoryFilter, stageFilter) {
  const programs = getDataAsArray("programs").sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
  const results = getDataAsArray("results");
  
  let statuses = programs.map(p => {
    const res = results.find(r => r.programId === p.id);
    let st = "Not Entered";
    if (res) {
      if (res.status === "published") st = "Published";
      else if (res.status === "ready") st = "Ready to Publish";
      else st = "Pending";
    }
    return { ...p, status: st };
  });

  if (statusFilter !== "All") statuses = statuses.filter(p => p.status === statusFilter);
  if (categoryFilter !== "All") statuses = statuses.filter(p => p.category === categoryFilter);
  if (stageFilter !== "All") {
    const sv = stageFilter === 'Stage' ? 'stage' : 'non-stage';
    statuses = statuses.filter(p => (p.stageType || 'stage') === sv);
  }

  const tableBody = statuses.length === 0 
    ? `<tr><td colspan="4" class="text-center py-8 text-gray-500">No programs match filters</td></tr>`
    : statuses.map(p => `
      <tr class="hover:bg-gray-50/50">
        <td class="px-5 py-3 font-medium text-gray-900">${sanitize(p.name)}</td>
        <td class="px-5 py-3">${categoryBadge(p.category)}</td>
        <td class="px-5 py-3">${stageTypeBadge(p.stageType || 'stage')}</td>
        <td class="px-5 py-3">${statusBadge(p.status)}</td>
      </tr>`).join('');

  return `
    <div class="space-y-6">
      <div class="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar">
        <div class="flex sm:flex-wrap gap-4 items-center w-max sm:w-auto">
          <div id="category-filter-container" class="flex gap-2">
            ${['All', ...CATEGORIES].map(c => `<button data-category="${c}" class="category-filter-btn px-3 py-1.5 text-xs font-medium rounded-lg border flex-shrink-0 ${categoryFilter === c ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-200'}">${c}</button>`).join('')}
          </div>
          <div class="w-px h-6 bg-gray-200 hidden sm:block"></div>
          <div id="status-filter-container" class="flex gap-2">
            ${['All', 'Published', 'Ready to Publish', 'Pending', 'Not Entered'].map(s => `<button data-status="${s}" class="category-filter-btn px-3 py-1.5 text-xs font-medium rounded-lg border flex-shrink-0 ${statusFilter === s ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-200'}">${s}</button>`).join('')}
          </div>
          <div class="w-px h-6 bg-gray-200 hidden sm:block"></div>
          <div id="stage-filter-container" class="flex gap-2">
            ${['All', 'Stage', 'Non-Stage'].map(s => `<button data-stage="${s}" class="category-filter-btn px-3 py-1.5 text-xs font-medium rounded-lg border flex-shrink-0 ${stageFilter === s ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-200'}">${s}</button>`).join('')}
          </div>
        </div>
      </div>
      ${TableComponents.wrapper(`
        ${TableComponents.header([{label:'Program'},{label:'Category'},{label:'Type'},{label:'Status'}])}
        <tbody class="divide-y divide-gray-50">${tableBody}</tbody>
      `)}
    </div>`;
}

function renderUploadResultsTab() {
  if (editingResultId) resetResultForm();
  tempParticipants = [];
  
  return `
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div class="lg:col-span-5 bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm">
        <h2 class="text-lg font-semibold text-gray-900 mb-5">Upload Result</h2>
        <form id="add-result-form" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Category</label>
              <select id="res-category" name="category" required class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none">
                ${categoryOptions()}
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Program Type</label>
              <select name="programType" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none">
                <option value="individual">Individual</option>
                <option value="group">Group</option>
                <option value="team">Team</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">Program</label>
            <select id="res-program" name="program" required disabled class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm disabled:opacity-50">
              <option>Select Category First</option>
            </select>
          </div>
          
          <div class="bg-gray-50 rounded-xl border border-gray-100 p-4 mt-6">
            <h3 class="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">Participants</h3>
            <div class="flex gap-2 mb-3">
              <select id="res-student-select" disabled class="flex-grow px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm disabled:opacity-50">
                <option>Select Program First</option>
              </select>
              <button type="button" id="add-participant-btn" disabled class="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex-shrink-0">
                Add
              </button>
            </div>
            <div id="participants-list" class="space-y-2 max-h-60 overflow-y-auto"></div>
          </div>
          
          <button type="submit" class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">
            Upload for Review
          </button>
        </form>
      </div>
      
      <div class="lg:col-span-7 bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm flex flex-col h-[calc(100vh)]">
        <h2 class="text-lg font-semibold text-gray-900 mb-4 flex-shrink-0">Recent Uploads</h2>
        <div id="recent-results-list" class="flex-grow overflow-y-auto space-y-3 custom-scrollbar pr-2"></div>
      </div>
    </div>`;
}
