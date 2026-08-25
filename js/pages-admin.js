// js/pages-admin.js
// Admin panel layout and sub-page render functions.

async function renderAdminPage() {
  if (!currentUser) {
    return `
      <div class="flex items-center justify-center min-h-[calc(100vh-160px)]">
        <div class="w-full max-w-md bg-white rounded-2xl border border-gray-200/60 p-8 shadow-sm">
          <div class="text-center mb-8">
            <div class="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-lock text-indigo-600"></i>
            </div>
            <h2 class="text-2xl font-bold text-gray-900 tracking-tight">Admin Access</h2>
            <p class="text-sm text-gray-500 mt-1">Sign in to manage the festival data.</p>
          </div>
          <form id="login-form" class="space-y-5">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input id="email" name="email" type="email" required 
                class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" 
                placeholder="admin@example.com">
            </div>
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input id="password" name="password" type="password" required 
                class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" 
                placeholder="••••••••">
            </div>
            <button type="submit" class="w-full flex justify-center items-center py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Sign in
            </button>
            <p id="login-error" class="text-red-500 text-xs text-center mt-2"></p>
          </form>
        </div>
      </div>`;
  }
  return renderAdminDashboard();
}

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
    { id: 'points', icon: 'fa-cog', label: 'Points Config' },
    { id: 'penalty', icon: 'fa-minus-circle', label: 'Penalty' }
  ];

  const tabsHtml = tabs.map(t => `
    <button data-tab="${t.id}" class="admin-tab w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 hover:text-gray-900 hover:bg-white/40 border border-transparent hover:border-white/60 rounded-2xl transition-all text-left group">
      <div class="w-8 h-8 rounded-xl bg-black/5 flex items-center justify-center border border-black/5 group-hover:bg-orange-500/10 group-hover:text-orange-600 transition-colors">
        <i class="fas ${t.icon} text-sm"></i>
      </div>
      ${t.label}
    </button>`).join('');

  return `
    <div class="max-w-7xl mx-auto pb-12 px-4 sm:px-6 lg:px-8 animate-fade-in flex flex-col lg:flex-row gap-6 mt-8 relative z-10">
      
      <!-- Sidebar Toggle Button (Mobile Only) -->
      <button id="admin-sidebar-toggle" class="lg:hidden fixed top-[5.5rem] left-4 z-[60] w-10 h-10 flex items-center justify-center bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl shadow-lg text-gray-700 hover:bg-white/60 hover:text-orange-600 transition-all" title="Toggle sidebar">
        <i class="fas fa-bars text-sm"></i>
      </button>

      <!-- Sidebar Backdrop (Mobile Only) -->
      <div id="admin-sidebar-backdrop" class="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-[59] hidden transition-opacity"></div>
      
      <!-- Sidebar -->
      <aside id="admin-sidebar" class="fixed lg:sticky top-0 lg:top-24 left-0 h-full lg:h-auto w-72 z-[60] lg:z-10 transform -translate-x-full lg:translate-x-0 transition-transform duration-300 ease-in-out flex-shrink-0">
        <div class="h-full overflow-y-auto lg:overflow-visible pt-24 lg:pt-0 pb-8 lg:pb-0 px-4 lg:px-0">
          <div class="bg-gradient-to-br from-white/80 to-white/30 backdrop-blur-3xl backdrop-saturate-[2.5] border-[0.5px] border-white/60 shadow-[0_8px_32px_0_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.8)] rounded-[2rem] p-6 lg:top-24">
            <div class="flex items-center justify-between mb-6 px-2">
              <div>
                <h1 class="text-2xl font-black text-gray-900 tracking-tighter">Admin Panel</h1>
                <p class="text-xs text-gray-500 font-medium mt-1 uppercase tracking-widest">Manage Festival</p>
              </div>
              <button id="admin-sidebar-close" class="lg:hidden w-8 h-8 flex items-center justify-center rounded-xl text-gray-500 hover:text-gray-900 hover:bg-black/5 transition-colors">
                <i class="fas fa-times text-sm"></i>
              </button>
            </div>
            <div class="flex flex-col gap-2" id="admin-tabs">
              ${tabsHtml}
            </div>
          </div>
        </div>
      </aside>
      
      <!-- Main Content -->
      <main class="flex-grow min-w-0">
        <div class="bg-gradient-to-br from-white/60 to-white/10 backdrop-blur-3xl backdrop-saturate-[2.5] border-[0.5px] border-white/60 shadow-[0_8px_32px_0_rgba(0,0,0,0.05),inset_0_1px_1px_rgba(255,255,255,0.8)] rounded-[2rem] p-6 sm:p-8 min-h-[600px] relative overflow-hidden group">
          <div class="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-[2rem]"></div>
          <div id="admin-tab-content" class="relative z-10">
            ${spinner('lg')}
          </div>
        </div>
      </main>

    </div>`;
}

// Global reference for table components
const TableComponents = {
  header: (columns) => `
    <thead class="bg-gray-50/50">
      <tr>${columns.map(c => `<th class="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${c.cls || ''}">${c.label}</th>`).join('')}</tr>
    </thead>`,
  wrapper: (content) => `
    <div class="bg-white rounded-xl border border-gray-200/60 overflow-hidden">
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
    tab.classList.toggle("bg-white/60", isActive);
    tab.classList.toggle("shadow-sm", isActive);
    tab.classList.toggle("border-white/50", isActive);
    tab.classList.toggle("text-gray-900", isActive);
    tab.classList.toggle("text-gray-600", !isActive);
    tab.classList.toggle("border-transparent", !isActive);
    
    // Icon styling
    const iconContainer = tab.querySelector('div');
    if (iconContainer) {
       iconContainer.classList.toggle("bg-orange-500/10", isActive);
       iconContainer.classList.toggle("text-orange-600", isActive);
       iconContainer.classList.toggle("bg-black/5", !isActive);
    }
  });

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
    case 'points':    html = renderPointsConfigTab(); break;
    case 'penalty':   html = renderPenaltyTab(); break;
  }

  container.innerHTML = html;

  // Post-render actions
  if (tabId === "results") loadRecentResults();
  if (['students', 'teams', 'programs', 'penalty'].includes(tabId)) loadItemsList(tabId);
}

// ── Tab Renderers ────────────────────────────────────────────────────────

async function renderDashboardTab() {
  const { teamsArray, studentsArray } = calculateAllScoresInternal();

  const teamsHtml = teamsArray.length === 0 ? emptyState('fa-users', 'No teams data') : teamsArray.map((team, i) => `
    <div class="bg-white rounded-xl border border-gray-200/60 p-5 shadow-sm">
      <div class="flex justify-between items-center mb-3">
        <h3 class="font-semibold text-gray-900">${sanitize(team.name)}</h3>
        ${i < 3 ? `<i class="fas fa-medal text-${['yellow-500','gray-400','amber-600'][i]}"></i>` : `<span class="text-xs text-gray-400 font-medium">#${i+1}</span>`}
      </div>
      <p class="text-3xl font-bold text-gray-900">${team.totalPoints}</p>
    </div>`).join('');

  const { classesArray } = calculateAllScoresInternal();
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
      <div>
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Live Team Standings</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">${teamsHtml}</div>
      </div>
      <div>
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Live Class Standings</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">${classesHtml}</div>
      </div>
      <div>
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Live Student Leaders (Top 50)</h2>
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
