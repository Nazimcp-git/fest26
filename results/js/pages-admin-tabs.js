// js/pages-admin-tabs.js
// Remaining admin tab renderers.

function renderPublishTab() {
  const results = getDataAsArray("results").sort((a, b) => b.timestamp - a.timestamp);
  
  const judgeSubmittedCount = results.filter(r => r.status === 'submitted_by_judge').length;
  const judgeAlertBanner = judgeSubmittedCount > 0 ? `
    <div class="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-500/30 flex items-center justify-between shadow-xs">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg shadow-md">
          <i class="fas fa-gavel"></i>
        </div>
        <div>
          <h4 class="font-bold text-gray-900 text-sm">⚖️ ${judgeSubmittedCount} ${judgeSubmittedCount === 1 ? 'Result' : 'Results'} Submitted by Judge</h4>
          <p class="text-xs text-gray-600 font-medium">Judges have submitted evaluations. Click "Approve & Publish" on any result to update live festival standings.</p>
        </div>
      </div>
    </div>` : '';

  return `
    <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col">
      
      ${judgeAlertBanner}

      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 flex-shrink-0">
        <h2 class="text-lg font-semibold text-gray-900">Manage Publication</h2>
        <div class="flex-grow max-w-md">
          <div class="relative">
            <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
            <input type="text" id="publish-search-input" placeholder="Search programs..." 
              class="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none">
          </div>
        </div>
        <div class="flex flex-wrap gap-2">
          <button id="print-all-ready-btn" class="px-3 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors">
            <i class="fas fa-print mr-1.5"></i>Print Ready
          </button>
          <button id="publish-all-ready-btn" class="px-3 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg text-sm font-medium transition-colors">
            Publish All Ready
          </button>
          <button id="update-all-scores-btn" class="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">
            <i class="fas fa-sync-alt mr-1.5"></i>Update Scores
          </button>
        </div>
      </div>
      
      <div id="publish-list" class="flex-grow overflow-y-auto space-y-3 custom-scrollbar pr-2">
        ${results.length === 0 ? emptyState('fa-upload', 'No results uploaded yet') : results.map(r => {
          
          // Calculate impact
          const impact = {};
          const cfg = r.programType === 'group' ? appData.groupPointsConfig : r.programType === 'team' ? appData.teamPointsConfig : appData.pointsConfig;
          
          (r.participants || []).forEach(p => {
            const s = appData.students[p.studentId];
            if (!s || !s.teamId) return;
            if (!impact[s.teamId]) impact[s.teamId] = { points: 0, name: appData.teams[s.teamId]?.name || 'Unknown' };
            let pts = 0;
            if (p.position && p.position !== 'none') pts += cfg[p.position] || 0;
            if (p.grade && p.grade !== 'none') pts += cfg[p.grade] || 0;
            impact[s.teamId].points += pts;
          });
          
          const impactArr = Object.values(impact).sort((a,b) => b.points - a.points);
          
          let badge, actions;
          if (r.status === 'published') {
            badge = statusBadge('published');
            actions = `
              <button class="unpublish-btn px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-medium transition-colors" data-id="${r.id}">Unpublish</button>
              <button class="print-btn w-8 h-8 flex items-center justify-center bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" data-id="${r.id}"><i class="fas fa-print text-xs"></i></button>`;
          } else if (r.status === 'ready') {
            badge = statusBadge('ready');
            actions = `
              <button class="unmark-ready-btn px-3 py-1.5 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-lg text-xs font-medium transition-colors" data-id="${r.id}">Unmark</button>
              <button class="publish-btn px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-medium transition-colors" data-id="${r.id}">Publish</button>`;
          } else if (r.status === 'submitted_by_judge') {
            badge = `<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-800 border border-amber-500/30"><i class="fas fa-gavel mr-1.5 text-amber-600"></i>Submitted by Judge (${sanitize(r.judgeName || r.judgeCode || 'Judge')})</span>`;
            actions = `
              <button class="publish-btn px-3.5 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-xs font-bold transition-colors shadow-xs" data-id="${r.id}"><i class="fas fa-check mr-1"></i>Approve & Publish</button>
              <button class="mark-ready-btn px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-medium transition-colors" data-id="${r.id}">Mark Ready</button>`;
          } else {
            badge = statusBadge('pending');
            actions = `<button class="mark-ready-btn px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-medium transition-colors" data-id="${r.id}">Mark Ready</button>`;
          }

          return `
            <div class="program-item-container bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow" data-program-name="${sanitize(r.programName).toLowerCase()}">
              <div class="flex items-start justify-between mb-3">
                <div class="program-item-clickable cursor-pointer group" data-result-id="${r.id}">
                  <div class="flex items-center gap-2 mb-1">
                    <h3 class="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">${sanitize(r.programName)}</h3>
                    ${badge}
                  </div>
                  <div class="flex items-center gap-2">
                    ${categoryBadge(r.category)}
                    ${stageTypeBadge(r.stageType || 'stage')}
                  </div>
                </div>
                <div class="flex items-center gap-2" data-no-modal-trigger="true">
                  ${actions}
                  <button class="delete-btn w-8 h-8 flex items-center justify-center bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors" data-id="${r.id}" data-collection="results"><i class="fas fa-trash text-xs"></i></button>
                </div>
              </div>
              
              <div class="program-item-clickable cursor-pointer" data-result-id="${r.id}">
                <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Team Point Impact</p>
                <div class="flex flex-wrap gap-2">
                  ${impactArr.map(imp => `<span class="inline-flex items-center px-2 py-1 bg-gray-50 rounded-lg text-xs"><span class="font-medium text-gray-700 mr-1">${sanitize(imp.name)}:</span><span class="font-bold text-emerald-600">+${imp.points}</span></span>`).join('')}
                  ${impactArr.length === 0 ? '<span class="text-xs text-gray-400">No impact</span>' : ''}
                </div>
              </div>
            </div>`;
        }).join('')}
      </div>
    </div>`;
}

function renderAnnounceLiveTab() {
  const readyResults = getDataAsArray("results").filter(r => r.status === "ready").sort((a, b) => {
    const ca = CATEGORIES.indexOf(a.category);
    const cb = CATEGORIES.indexOf(b.category);
    if (ca !== cb) return ca - cb;
    return a.programName.localeCompare(b.programName);
  });

  const grouped = readyResults.reduce((acc, r) => {
    if (!acc[r.category]) acc[r.category] = [];
    acc[r.category].push(r);
    return acc;
  }, {});

  const html = Object.keys(grouped).length === 0
    ? emptyState('fa-bullhorn', 'No results ready to announce', 'Mark results as "Ready" first.')
    : CATEGORIES.map(cat => {
        const list = grouped[cat];
        if (!list) return '';
        return `
          <div class="mb-10">
            <h2 class="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">${cat}</h2>
            <div class="space-y-4">
              ${list.map(r => `
                <div class="bg-white rounded-xl border border-indigo-100 p-6 shadow-md relative overflow-hidden">
                  <div class="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                  <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                      <h3 class="text-2xl font-bold text-gray-900">${sanitize(r.programName)}</h3>
                      <p class="text-sm text-gray-500 mt-1">${r.category} • ${r.stageType === 'non-stage' ? 'Non-Stage' : 'Stage'}</p>
                    </div>
                    <button class="publish-btn flex-shrink-0 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all hover:scale-105 shadow-sm" data-id="${r.id}">
                      <i class="fas fa-bullhorn mr-2"></i>Publish Now
                    </button>
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    ${(r.participants||[]).map(p => {
                      const s = appData.students[p.studentId];
                      const tn = s && appData.teams[s.teamId] ? appData.teams[s.teamId].name : 'N/A';
                      let prize = [];
                      if (p.position && p.position !== 'none') prize.push(POSITION_LABELS[p.position]);
                      if (p.grade && p.grade !== 'none') prize.push(GRADE_LABELS[p.grade]);
                      const dn = r.programType !== 'individual' ? `${p.name} & Team` : p.name;
                      return `
                        <div class="bg-indigo-50/50 rounded-lg p-3 border border-indigo-100/50">
                          <p class="font-bold text-gray-900">${sanitize(dn)} <span class="text-xs font-normal text-gray-500">(${sanitize(s.chestNo)})</span></p>
                          <p class="text-sm font-semibold text-indigo-700 mt-0.5">${prize.join(' • ')}</p>
                          <p class="text-xs text-gray-600 mt-1">${sanitize(tn)}</p>
                        </div>`;
                    }).join('')}
                  </div>
                </div>`).join('')}
            </div>
          </div>`;
      }).join('');

  return `
    <div class="max-w-5xl mx-auto space-y-6">
      <div class="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div class="flex gap-3">
          <i class="fas fa-exclamation-triangle text-amber-500 mt-0.5"></i>
          <div>
            <h3 class="text-sm font-bold text-amber-800">Live Announce Mode</h3>
            <p class="text-xs text-amber-700 mt-1">Publishing a result here immediately makes it visible to the public. Remember to click "Update Scores" to refresh the leaderboard.</p>
          </div>
        </div>
        <button id="update-all-scores-btn" class="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-bold transition-colors shadow-sm flex-shrink-0">
          <i class="fas fa-sync-alt mr-1.5"></i>Update Scores
        </button>
      </div>
      <div>${html}</div>
    </div>`;
}

function renderScorePreviewTab() {
  const { teamsArray, studentsArray, classesArray } = getProvisionalScores();

  const allResults = getDataAsArray("results");
  const readyCount     = allResults.filter(r => r.status === "ready").length;
  const publishedCount = allResults.filter(r => r.status === "published").length;
  const totalIncluded  = readyCount + publishedCount;

  const teamsHtml = teamsArray.length === 0 ? emptyState('fa-users', 'No provisional data') : teamsArray.map((team, i) => {
    const catChips = CATEGORIES.map(cat => {
      const pts = (team.categoryPoints && team.categoryPoints[cat]) || 0;
      return `<span class="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">${cat}: ${pts}</span>`;
    }).join(' ');

    return `
      <div class="bg-white rounded-xl border border-blue-200 p-5 shadow-sm flex flex-col justify-between">
        <div>
          <div class="flex justify-between items-center mb-2">
            <h3 class="font-semibold text-gray-900">${sanitize(team.name)}</h3>
            ${i < 3 ? `<i class="fas fa-medal text-${['yellow-500','gray-400','amber-600'][i]}"></i>` : `<span class="text-xs text-gray-400 font-medium">#${i+1}</span>`}
          </div>
          <p class="text-3xl font-bold text-blue-600 mb-3">${team.totalPoints}</p>
        </div>
        <div class="flex flex-wrap gap-1 pt-2 border-t border-blue-100 mt-2">
          ${catChips}
        </div>
      </div>`;
  }).join('');

  const classesHtml = !classesArray || classesArray.length === 0 ? emptyState('fa-chalkboard-teacher', 'No class data') : classesArray.slice(0, 10).map((c, i) => `
    <div class="bg-white rounded-xl border border-indigo-200 p-4 shadow-sm flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center font-bold text-indigo-700 text-xs">${i+1}</div>
        <h3 class="font-semibold text-gray-900">Class ${sanitize(c.name)}</h3>
      </div>
      <p class="text-xl font-bold text-indigo-600">${c.totalPoints}</p>
    </div>`).join('');

  const tableBody = studentsArray.length === 0 
    ? `<tr><td colspan="5" class="text-center py-8 text-gray-500">No provisional students yet</td></tr>`
    : studentsArray.slice(0, 50).map((s, i) => `
      <tr class="hover:bg-blue-50/30">
        <td class="px-5 py-3 font-medium text-gray-400">${i+1}</td>
        <td class="px-5 py-3 font-medium text-blue-600"><a href="#/student/${s.id}" class="hover:underline" target="_blank">${sanitize(s.name)}</a></td>
        <td class="px-5 py-3 text-gray-500">${sanitize(appData.teams[s.teamId]?.name || 'N/A')}</td>
        <td class="px-5 py-3">${categoryBadge(s.category)}</td>
        <td class="px-5 py-3 font-bold text-gray-900">${s.totalPoints || 0}</td>
      </tr>`).join('');

  return `
    <div class="space-y-8">
      <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
        <i class="fas fa-eye text-blue-500 mt-0.5"></i>
        <div>
          <h4 class="text-sm font-semibold text-blue-800">Provisional Score Preview (Ready + Published Programs)</h4>
          <p class="text-xs text-blue-700 mt-1">This shows projected scores including results marked as "Ready to Publish". Useful for double-checking rankings before live announcement.</p>
        </div>
      </div>

      <!-- Stage Summary for Preview -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-white rounded-xl border border-blue-200/60 p-4 shadow-sm">
          <div class="flex items-center justify-between text-xs text-blue-700 font-medium mb-1">
            <span>Ready Programs Included</span>
            <i class="fas fa-clock text-blue-500"></i>
          </div>
          <p class="text-2xl font-bold text-blue-700">${readyCount}</p>
        </div>
        <div class="bg-white rounded-xl border border-emerald-200/60 p-4 shadow-sm">
          <div class="flex items-center justify-between text-xs text-emerald-700 font-medium mb-1">
            <span>Published Programs Included</span>
            <i class="fas fa-check-circle text-emerald-500"></i>
          </div>
          <p class="text-2xl font-bold text-emerald-700">${publishedCount}</p>
        </div>
        <div class="bg-blue-600 rounded-xl p-4 shadow-sm text-white">
          <div class="flex items-center justify-between text-xs opacity-80 font-medium mb-1">
            <span>Total Programs in Preview</span>
            <i class="fas fa-calculator"></i>
          </div>
          <p class="text-2xl font-bold">${totalIncluded}</p>
        </div>
      </div>

      <div>
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Projected Team Standings (Ready + Published)</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">${teamsHtml}</div>
      </div>
      <div>
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Projected Class Standings (Ready + Published)</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">${classesHtml}</div>
      </div>
      <div>
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Projected Top Students (Ready + Published)</h2>
        ${TableComponents.wrapper(`
          ${TableComponents.header([{label:'Rank'},{label:'Student'},{label:'Team'},{label:'Category'},{label:'Points'}])}
          <tbody class="divide-y divide-gray-50">${tableBody}</tbody>
        `)}
      </div>
    </div>`;
}

function renderStudentsTab() {
  const teams = getDataAsArray("teams");
  return `
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div class="lg:col-span-8 bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm h-[calc(100vh-200px)] flex flex-col order-2 lg:order-1">
        <h2 class="text-lg font-semibold text-gray-900 mb-4 flex-shrink-0">Directory</h2>
        <div id="items-list" class="flex-grow overflow-y-auto space-y-2 custom-scrollbar pr-2"></div>
      </div>
      
      <div class="lg:col-span-4 space-y-6 order-1 lg:order-2">
        <div class="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Add Student</h2>
          <form id="add-student-form" class="space-y-4">
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Chest No</label>
              <input type="text" id="student-chest-no" required class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none">
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Name</label>
              <input type="text" id="student-name" required class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none">
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Class</label>
              <input type="text" id="student-class" required placeholder="e.g. 10th A" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none">
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Category</label>
              <select id="student-category" required class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none">${categoryOptions()}</select>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Team</label>
              <select id="student-team" required class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none">
                <option value="">Select Team</option>
                ${teams.map(t => `<option value="${t.id}">${sanitize(t.name)}</option>`).join('')}
              </select>
            </div>
            <button type="submit" class="w-full py-2.5 bg-gray-800 hover:bg-gray-900 text-white rounded-lg text-sm font-medium transition-colors">Add</button>
          </form>
        </div>
        
        <div class="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Bulk Import</h2>
          <form id="bulk-upload-students-form" class="space-y-4">
            <div class="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <p class="text-xs text-gray-500 mb-2">Upload .xlsx with columns:</p>
              <code class="text-[11px] font-mono bg-white px-1.5 py-0.5 rounded border border-gray-200 text-gray-700">ChestNo, Name, Class, Category, TeamName</code>
            </div>
            <input type="file" id="student-file-input" accept=".xlsx" required class="block w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100">
            <div class="flex gap-2">
              <button type="submit" class="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">Upload</button>
              <button type="button" id="download-student-template" class="flex-1 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors">Template</button>
            </div>
          </form>
        </div>
      </div>
    </div>`;
}

function renderTeamsTab() {
  return `
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div class="lg:col-span-8 bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm h-[calc(100vh-200px)] flex flex-col order-2 lg:order-1">
        <h2 class="text-lg font-semibold text-gray-900 mb-4 flex-shrink-0">All Teams</h2>
        <div id="items-list" class="flex-grow overflow-y-auto space-y-2 custom-scrollbar pr-2"></div>
      </div>
      
      <div class="lg:col-span-4 bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm order-1 lg:order-2 h-fit">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Add Team</h2>
        <form id="add-team-form" class="space-y-4">
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">Team Name</label>
            <input type="text" id="team-name" required class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none">
          </div>
          <button type="submit" class="w-full py-2.5 bg-gray-800 hover:bg-gray-900 text-white rounded-lg text-sm font-medium transition-colors">Create Team</button>
        </form>
      </div>
    </div>`;
}

function renderProgramsTab() {
  return `
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div class="lg:col-span-8 bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm h-[calc(100vh-200px)] flex flex-col order-2 lg:order-1">
        <h2 class="text-lg font-semibold text-gray-900 mb-4 flex-shrink-0">Program Directory</h2>
        <div id="items-list" class="flex-grow overflow-y-auto space-y-2 custom-scrollbar pr-2"></div>
      </div>
      
      <div class="lg:col-span-4 space-y-6 order-1 lg:order-2">
        <div class="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Add Program</h2>
          <form id="add-program-form" class="space-y-4">
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Name</label>
              <input type="text" id="program-name" required class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none">
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Category</label>
              <select id="program-category" required class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none">${categoryOptions()}</select>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-2">Stage Type</label>
              <div class="flex gap-4">
                <label class="flex items-center gap-2 text-sm cursor-pointer"><input type="radio" name="programStageType" value="stage" checked class="text-indigo-600 focus:ring-indigo-500"> Stage</label>
                <label class="flex items-center gap-2 text-sm cursor-pointer"><input type="radio" name="programStageType" value="non-stage" class="text-indigo-600 focus:ring-indigo-500"> Non-Stage</label>
              </div>
            </div>
            <button type="submit" class="w-full py-2.5 bg-gray-800 hover:bg-gray-900 text-white rounded-lg text-sm font-medium transition-colors">Add Program</button>
          </form>
        </div>
        
        <div class="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Bulk Import</h2>
          <form id="bulk-upload-programs-form" class="space-y-4">
            <div class="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <p class="text-xs text-gray-500 mb-2">Upload .xlsx with columns:</p>
              <code class="text-[11px] font-mono bg-white px-1.5 py-0.5 rounded border border-gray-200 text-gray-700">ProgramName, Category, StageType</code>
            </div>
            <input type="file" id="program-file-input" accept=".xlsx" required class="block w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100">
            <div class="flex gap-2">
              <button type="submit" class="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">Upload</button>
              <button type="button" id="download-program-template" class="flex-1 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors">Template</button>
            </div>
          </form>
        </div>
      </div>
    </div>`;
}

function renderPointsConfigTab() {
  const c1 = appData.pointsConfig || {};
  const c2 = appData.groupPointsConfig || {};
  const c3 = appData.teamPointsConfig || {};

  const field = (id, val, label) => `
    <div>
      <label for="${id}" class="block text-xs font-medium text-gray-700 mb-1">${label}</label>
      <input type="number" id="${id}" value="${val}" required min="0" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none">
    </div>`;

  return `
    <div class="max-w-4xl mx-auto">
      <form id="update-points-form" class="space-y-6">
        <div class="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm">
          <h2 class="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-3 mb-4">Individual Event Points</h2>
          <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
            ${field('points-first', c1.first, '1st Place')} ${field('points-second', c1.second, '2nd Place')} ${field('points-third', c1.third, '3rd Place')}
            ${field('points-a_grade', c1.a_grade, 'A Grade')} ${field('points-b_grade', c1.b_grade, 'B Grade')}
          </div>
        </div>
        <div class="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm">
          <h2 class="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-3 mb-4">Group Event Points</h2>
          <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
            ${field('group-points-first', c2.first, '1st Place')} ${field('group-points-second', c2.second, '2nd Place')} ${field('group-points-third', c2.third, '3rd Place')}
            ${field('group-points-a_grade', c2.a_grade, 'A Grade')} ${field('group-points-b_grade', c2.b_grade, 'B Grade')}
          </div>
        </div>
        <div class="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm">
          <h2 class="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-3 mb-4">Team Event Points</h2>
          <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
            ${field('team-points-first', c3.first, '1st Place')} ${field('team-points-second', c3.second, '2nd Place')} ${field('team-points-third', c3.third, '3rd Place')}
            ${field('team-points-a_grade', c3.a_grade, 'A Grade')} ${field('team-points-b_grade', c3.b_grade, 'B Grade')}
          </div>
        </div>
        <button type="submit" class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm">
          Save Point Configuration & Recalculate
        </button>
      </form>
    </div>`;
}

function renderPenaltyTab() {
  const teams = getDataAsArray("teams");
  const students = getDataAsArray("students").sort((a,b) => (a.chestNo || '').localeCompare(b.chestNo || ''));
  const classes = Array.from(new Set(students.map(s => s.className).filter(Boolean))).sort();

  return `
    <div class="space-y-6">

      <!-- Header Info Banner -->
      <div class="bg-red-50 border border-red-200 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600 font-bold flex-shrink-0">
            <i class="fas fa-minus-circle text-lg"></i>
          </div>
          <div>
            <h3 class="text-sm font-bold text-red-900">Student & Team Minus Points</h3>
            <p class="text-xs text-red-700 mt-0.5">Direct minus points applied to a student automatically reduce both the student's individual score and their team's overall score.</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- Left: Student Penalty Form & Quick Search -->
        <div class="lg:col-span-6 bg-white rounded-xl border border-red-200 p-6 shadow-sm flex flex-col gap-5">
          <div class="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 class="text-base font-bold text-red-700 flex items-center gap-2">
              <i class="fas fa-user-minus"></i> Apply Student Penalty
            </h2>
            <span class="text-xs text-gray-400 font-medium">Minus Points</span>
          </div>

          <!-- Student Search & Filter Controls -->
          <div class="space-y-3 bg-gray-50/80 p-3.5 rounded-xl border border-gray-100">
            <div class="relative">
              <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
              <input type="text" id="penalty-student-search" placeholder="Search by name or Chest No..." 
                class="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-red-500/20 outline-none">
            </div>

            <div class="grid grid-cols-3 gap-2">
              <select id="penalty-filter-team" class="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs outline-none">
                <option value="">All Teams</option>
                ${teams.map(t => `<option value="${t.id}">${sanitize(t.name)}</option>`).join('')}
              </select>
              <select id="penalty-filter-category" class="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs outline-none">
                <option value="">All Categories</option>
                ${CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}
              </select>
              <select id="penalty-filter-class" class="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs outline-none">
                <option value="">All Classes</option>
                ${classes.map(c => `<option value="${c}">${c}</option>`).join('')}
              </select>
            </div>
          </div>

          <!-- Form -->
          <form id="apply-student-penalty-form" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Select Student</label>
              <select id="student-penalty-student-id" required class="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500/20 outline-none">
                <option value="">Select Student...</option>
                ${students.map(s => `
                  <option value="${s.id}" data-search="${sanitize(s.name).toLowerCase()} ${sanitize(s.chestNo).toLowerCase()}" data-team="${s.teamId}" data-category="${s.category}" data-class="${s.className}">
                    [Chest ${sanitize(s.chestNo)}] ${sanitize(s.name)} — ${sanitize(appData.teams[s.teamId]?.name || 'No Team')} (${s.totalPoints || 0} pts)
                  </option>`).join('')}
              </select>
            </div>

            <div>
              <div class="flex justify-between items-center mb-1">
                <label class="block text-xs font-semibold text-gray-700">Minus Points (Deduction)</label>
                <div class="flex gap-1">
                  <button type="button" class="preset-penalty-btn px-2 py-0.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded text-[11px] font-bold" data-pts="1">-1</button>
                  <button type="button" class="preset-penalty-btn px-2 py-0.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded text-[11px] font-bold" data-pts="2">-2</button>
                  <button type="button" class="preset-penalty-btn px-2 py-0.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded text-[11px] font-bold" data-pts="5">-5</button>
                  <button type="button" class="preset-penalty-btn px-2 py-0.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded text-[11px] font-bold" data-pts="10">-10</button>
                </div>
              </div>
              <input type="number" id="student-penalty-points" min="1" placeholder="e.g. 5" required class="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500/20 outline-none">
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Reason for Penalty</label>
              <textarea id="student-penalty-reason" required rows="2" placeholder="e.g. Late stage entry, misconduct..." class="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500/20 outline-none resize-none"></textarea>
            </div>

            <button type="submit" class="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold transition-colors shadow-sm flex items-center justify-center gap-2">
              <i class="fas fa-minus-circle"></i> Deduct Student Points
            </button>
          </form>

          <!-- Team Penalty Option Collapsible Header -->
          <div class="border-t border-gray-100 pt-4 mt-2">
            <details class="group">
              <summary class="flex items-center justify-between cursor-pointer text-xs font-bold text-gray-600 hover:text-gray-900 select-none">
                <span><i class="fas fa-users-slash mr-1.5 text-gray-400"></i>Apply Direct Team-Level Penalty</span>
                <i class="fas fa-chevron-down text-gray-400 group-open:rotate-180 transition-transform text-[10px]"></i>
              </summary>
              <form id="apply-penalty-form" class="space-y-3 mt-3 pt-3 border-t border-gray-100">
                <div>
                  <label class="block text-xs font-medium text-gray-700 mb-1">Target Team</label>
                  <select id="penalty-team" required class="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs outline-none">
                    <option value="">Select Team</option>
                    ${teams.map(t => `<option value="${t.id}">${sanitize(t.name)}</option>`).join('')}
                  </select>
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <label class="block text-xs font-medium text-gray-700 mb-1">Deduct Points</label>
                    <input type="number" id="penalty-points" min="1" required class="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs outline-none">
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-gray-700 mb-1">Reason</label>
                    <input type="text" id="penalty-reason" required class="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs outline-none">
                  </div>
                </div>
                <button type="submit" class="w-full py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg text-xs font-bold transition-colors">Deduct Team Score</button>
              </form>
            </details>
          </div>

        </div>

        <!-- Right: Applied Penalties History -->
        <div class="lg:col-span-6 bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm flex flex-col h-[calc(100vh-200px)]">
          <div class="flex items-center justify-between mb-4 flex-shrink-0">
            <h2 class="text-base font-bold text-gray-900 flex items-center gap-2">
              <i class="fas fa-history text-gray-400"></i> Applied Penalties History
            </h2>
            <div id="penalty-type-toggle" class="flex gap-1 bg-gray-100 p-0.5 rounded-lg text-xs">
              <button data-type="student" class="penalty-toggle-btn px-2.5 py-1 rounded-md font-bold bg-white text-gray-900 shadow-xs">Students</button>
              <button data-type="team" class="penalty-toggle-btn px-2.5 py-1 rounded-md font-medium text-gray-500 hover:text-gray-900">Teams</button>
            </div>
          </div>

          <div id="items-list" class="flex-grow overflow-y-auto space-y-3 custom-scrollbar pr-2"></div>
        </div>

      </div>
    </div>`;
}

// ── Shared Loaders ────────────────────────────────────────────────────────

function loadRecentResults() {
  const c = document.getElementById("recent-results-list");
  if (!c) return;
  const res = getDataAsArray("results").sort((a,b) => b.timestamp - a.timestamp);
  c.innerHTML = res.length === 0 ? emptyState('fa-clock', 'No recent uploads') : res.map(r => `
    <div class="p-4 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between">
      <div>
        <p class="text-sm font-semibold text-gray-900">${sanitize(r.programName)}</p>
        <p class="text-xs text-gray-500 mt-0.5">${categoryBadge(r.category)}</p>
      </div>
      <div class="flex gap-2">
        <button class="edit-result-btn w-8 h-8 flex items-center justify-center bg-white border border-gray-200 text-gray-600 hover:text-indigo-600 rounded-lg shadow-sm" data-id="${r.id}"><i class="fas fa-edit text-xs"></i></button>
        <button class="delete-btn w-8 h-8 flex items-center justify-center bg-white border border-red-100 text-red-500 hover:bg-red-50 rounded-lg shadow-sm" data-id="${r.id}" data-collection="results"><i class="fas fa-trash text-xs"></i></button>
      </div>
    </div>`).join('');
}

let activePenaltyViewType = 'student';

function loadItemsList(col) {
  const c = col === 'judges' ? document.getElementById("judges-list-container") : document.getElementById("items-list");
  if (!c) return;
  
  if (col === 'penalty') {
    if (activePenaltyViewType === 'student') {
      const studentPenalties = getDataAsArray('studentPenalties').sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0));
      c.innerHTML = studentPenalties.length === 0 ? emptyState('fa-user-check', 'No student penalties applied') : studentPenalties.map(p => {
        const student = appData.students[p.studentId] || {};
        const teamName = appData.teams[p.teamId || student.teamId]?.name || 'No Team';
        const chestNo = p.chestNo || student.chestNo || '—';
        const studentName = p.studentName || student.name || 'Unknown Student';

        return `
          <div class="p-4 bg-red-50/60 border border-red-100 rounded-xl flex items-start justify-between gap-3 hover:border-red-200 transition-colors">
            <div class="min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="px-2 py-0.5 bg-red-600 text-white rounded text-xs font-black">-${p.points} PTS</span>
                <h4 class="font-bold text-gray-900 text-sm truncate">${sanitize(studentName)}</h4>
                <span class="text-xs font-semibold text-gray-400">(Chest ${sanitize(chestNo)})</span>
              </div>
              <p class="text-xs font-semibold text-gray-500 mb-1">Team: ${sanitize(teamName)}</p>
              <p class="text-xs text-gray-700 bg-white/80 p-2 rounded-lg border border-red-100/60 mt-1">${sanitize(p.reason)}</p>
              <p class="text-[10px] text-gray-400 mt-1.5"><i class="far fa-clock mr-1"></i>${formatDateTime(p.createdAt)}</p>
            </div>
            <button class="delete-btn flex-shrink-0 w-8 h-8 flex items-center justify-center bg-white border border-red-200 text-red-500 hover:bg-red-100 rounded-lg shadow-xs transition-colors" data-id="${p.id}" data-collection="studentPenalties" title="Undo / Delete penalty"><i class="fas fa-trash text-xs"></i></button>
          </div>`;
      }).join('');
      return;
    } else {
      const pens = getDataAsArray('teamPenalties').sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0));
      c.innerHTML = pens.length === 0 ? emptyState('fa-shield-alt', 'No team penalties applied') : pens.map(p => `
        <div class="p-4 bg-red-50/60 border border-red-100 rounded-xl flex items-start justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="px-2 py-0.5 bg-red-600 text-white rounded text-xs font-black">-${p.points} PTS</span>
              <h4 class="font-bold text-gray-900 text-sm">${sanitize(appData.teams[p.teamId]?.name || 'Unknown Team')}</h4>
            </div>
            <p class="text-xs text-gray-700 bg-white/80 p-2 rounded-lg border border-red-100/60 mt-1">${sanitize(p.reason)}</p>
            <p class="text-[10px] text-gray-400 mt-1.5"><i class="far fa-clock mr-1"></i>${formatDateTime(p.createdAt)}</p>
          </div>
          <button class="delete-btn flex-shrink-0 w-8 h-8 flex items-center justify-center bg-white border border-red-200 text-red-500 hover:bg-red-100 rounded-lg shadow-xs transition-colors" data-id="${p.id}" data-collection="teamPenalties" title="Delete team penalty"><i class="fas fa-trash text-xs"></i></button>
        </div>`).join('');
      return;
    }
  }

  if (col === 'judges') {
    const judges = getDataAsArray('teacherJudges').sort((a,b) => (a.name||'').localeCompare(b.name||''));
    c.innerHTML = judges.length === 0 ? emptyState('fa-gavel', 'No teacher judges configured yet') : judges.map(j => {
      const assignedCount = Array.isArray(j.assignedPrograms) ? j.assignedPrograms.length : 0;
      const progNames = (j.assignedPrograms || []).map(pid => appData.programs[pid]?.name).filter(Boolean);
      
      return `
        <div class="p-4 bg-white border border-gray-100 rounded-xl shadow-xs hover:border-gray-200 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="min-w-0 flex-grow">
            <div class="flex flex-wrap items-center gap-2 mb-1">
              <h4 class="font-bold text-gray-900 text-sm">${sanitize(j.name)}</h4>
              <span class="px-2 py-0.5 bg-gray-900 text-white font-mono text-[10px] font-bold rounded">CODE: ${sanitize(j.code)}</span>
              <span class="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-full border border-indigo-100">${assignedCount} Assigned Programs</span>
            </div>
            <div class="flex flex-wrap gap-1.5 mt-2 max-h-24 overflow-y-auto custom-scrollbar p-1 bg-gray-50/50 rounded-lg">
              ${progNames.map(pn => `<span class="px-2 py-0.5 bg-white border border-gray-200/60 text-gray-700 rounded text-[10px] font-semibold">${sanitize(pn)}</span>`).join('')}
              ${progNames.length === 0 ? '<span class="text-xs text-gray-400 p-1">No programs assigned yet. Click Edit to assign programs.</span>' : ''}
            </div>
          </div>
          <div class="flex items-center gap-2 flex-shrink-0">
            <button type="button" onclick='editTeacherJudge(${JSON.stringify(j).replace(/'/g, "&#39;")})' class="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5">
              <i class="fas fa-edit"></i> Edit / Bulk Assign
            </button>
            <button class="delete-btn w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" data-id="${j.id}" data-collection="teacherJudges" title="Delete Judge"><i class="fas fa-trash text-xs"></i></button>
          </div>
        </div>`;
    }).join('');
    return;
  }

  const items = getDataAsArray(col).sort((a,b) => (a.name||'').localeCompare(b.name||''));
  c.innerHTML = items.length === 0 ? emptyState('fa-folder-open', `No ${col} added`) : items.map(item => `
    <div class="p-3 bg-white border border-gray-100 rounded-xl flex items-center justify-between hover:border-gray-300 transition-colors">
      <div>
        <p class="text-sm font-medium text-gray-900">${sanitize(item.name)}</p>
        <p class="text-xs text-gray-500 mt-0.5">
          ${col === 'students' ? `Chest: ${sanitize(item.chestNo)} · Class: ${sanitize(item.className || 'N/A')} · ` : ''}
          ${item.category ? `${item.category}` : ''}
          ${col === 'programs' ? ` · ${item.stageType === 'non-stage' ? 'Non-Stage' : 'Stage'}` : ''}
          ${item.teamId ? ` · ${sanitize(appData.teams[item.teamId]?.name || 'Unknown')}` : ''}
        </p>
      </div>
      <button class="delete-btn w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" data-id="${item.id}" data-collection="${col}"><i class="fas fa-trash text-xs"></i></button>
    </div>`).join('');
}

function renderJudgesTab() {
  const programs = getDataAsArray("programs").sort((a,b) => (a.category || '').localeCompare(b.category || '') || (a.name || '').localeCompare(b.name || ''));

  const progCheckboxesHtml = programs.length === 0 ? `<p class="text-xs text-gray-400 font-medium py-2">No programs added yet. Add programs first.</p>` : programs.map(p => `
    <label class="judge-prog-label flex items-center gap-2 p-2 bg-gray-50 hover:bg-gray-100 border border-gray-200/60 rounded-lg cursor-pointer text-xs transition-colors" data-category="${sanitize(p.category)}" data-name="${sanitize(p.name).toLowerCase()}">
      <input type="checkbox" name="judgeAssignedPrograms" value="${p.id}" class="judge-prog-cb rounded text-indigo-600 focus:ring-indigo-500">
      <span class="font-bold text-gray-800 flex-grow">${sanitize(p.name)}</span>
      <span class="px-1.5 py-0.5 bg-gray-200 text-gray-700 text-[9px] font-black uppercase rounded">${sanitize(p.category)}</span>
    </label>`).join('');

  return `
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <!-- Left Column: Add / Edit Form -->
      <div class="lg:col-span-5">
        <div class="bg-gray-50/50 rounded-xl border border-gray-200/80 p-5">
          <div class="flex items-center justify-between mb-2">
            <h2 id="judge-form-title" class="text-sm font-bold text-gray-900 flex items-center gap-2">
              <i class="fas fa-gavel text-indigo-600"></i> Configure Teacher / Judge
            </h2>
            <button type="button" id="reset-judge-form-btn" onclick="resetTeacherJudgeForm()" class="hidden text-xs text-red-600 font-bold hover:underline">
              Cancel Editing
            </button>
          </div>
          <p class="text-xs text-gray-500 mb-4">Assign competition programs to a teacher/judge in bulk.</p>

          <form id="add-teacher-judge-form" class="space-y-4">
            <input type="hidden" id="judge-editing-id" value="">

            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Teacher / Judge Name</label>
              <input type="text" id="judge-teacher-name" required placeholder="e.g. Mr. Rahim / Dr. Salih" 
                class="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none">
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Passcode / Access Code</label>
              <input type="text" id="judge-teacher-code" required placeholder="e.g. J101" 
                class="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-mono font-bold uppercase focus:ring-2 focus:ring-indigo-500/20 outline-none">
              <p class="text-[10px] text-gray-400 mt-1">Passcode used by teacher to log in on judge portal.</p>
            </div>

            <!-- Program Selection & Bulk Filters -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="block text-xs font-semibold text-gray-700">Select Assigned Programs</label>
                <span id="judge-selected-count" class="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">0 Selected</span>
              </div>

              <!-- Search & Category Filters for Bulk Selection -->
              <div class="space-y-2 mb-2">
                <div class="relative">
                  <i class="fas fa-search absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                  <input type="text" id="judge-prog-search" placeholder="Search programs..." oninput="filterJudgeProgramList()"
                    class="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:border-indigo-500">
                </div>

                <div class="flex items-center gap-1 overflow-x-auto custom-scrollbar pb-1">
                  <button type="button" onclick="filterJudgeCategory('All')" class="judge-cat-btn text-[10px] font-bold px-2 py-1 bg-gray-900 text-white rounded-md">All</button>
                  ${CATEGORIES.map(cat => `
                    <button type="button" onclick="filterJudgeCategory('${cat}')" class="judge-cat-btn text-[10px] font-bold px-2 py-1 bg-white text-gray-700 border border-gray-200 rounded-md hover:bg-gray-100">${cat}</button>
                  `).join('')}
                </div>

                <!-- Bulk Selection Buttons -->
                <div class="flex items-center gap-2 pt-1 border-t border-gray-200/60">
                  <button type="button" onclick="bulkToggleJudgePrograms(true)" class="text-[10px] font-bold text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded border border-indigo-200 transition-colors">
                    <i class="fas fa-check-double mr-1"></i>Select Visible
                  </button>
                  <button type="button" onclick="bulkToggleJudgePrograms(false)" class="text-[10px] font-bold text-gray-600 hover:bg-gray-100 px-2 py-1 rounded border border-gray-200 transition-colors">
                    <i class="fas fa-times mr-1"></i>Deselect All
                  </button>
                  <button type="button" id="btn-select-cat" onclick="bulkSelectCurrentCategory()" class="text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded border border-emerald-200 transition-colors">
                    + Select Category
                  </button>
                </div>
              </div>

              <!-- Programs Checklist Container -->
              <div id="judge-prog-checklist" class="max-h-60 overflow-y-auto custom-scrollbar space-y-1.5 p-2 bg-white border border-gray-200 rounded-xl">
                ${progCheckboxesHtml}
              </div>
            </div>

            <button type="submit" id="judge-submit-btn" class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md">
              <i class="fas fa-save mr-1.5"></i>Save Teacher Judge Configuration
            </button>
          </form>
        </div>
      </div>

      <!-- Right Column: Configured Teacher Judges List -->
      <div class="lg:col-span-7">
        <h2 class="text-sm font-bold text-gray-900 mb-4 flex items-center justify-between">
          <span><i class="fas fa-list-check text-indigo-600 mr-2"></i>Configured Teacher Judges</span>
          <span class="text-xs text-gray-400 font-normal">Real-time sync to judge portal</span>
        </h2>
        <div id="judges-list-container" class="space-y-3">
          ${spinner('sm')}
        </div>
      </div>
    </div>`;
}

// Global JS Helper Functions for Judge Configuration UI
let activeJudgeCatFilter = 'All';

window.filterJudgeCategory = function(cat) {
  activeJudgeCatFilter = cat;
  document.querySelectorAll('.judge-cat-btn').forEach(btn => {
    const match = btn.textContent.trim() === cat;
    btn.className = `judge-cat-btn text-[10px] font-bold px-2 py-1 rounded-md transition-all ${match ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'}`;
  });
  filterJudgeProgramList();
};

window.filterJudgeProgramList = function() {
  const query = (document.getElementById('judge-prog-search')?.value || '').toLowerCase().trim();
  document.querySelectorAll('.judge-prog-label').forEach(label => {
    const cat = label.dataset.category || '';
    const name = label.dataset.name || '';
    const catMatch = activeJudgeCatFilter === 'All' || cat === activeJudgeCatFilter;
    const searchMatch = !query || name.includes(query);
    label.style.display = (catMatch && searchMatch) ? 'flex' : 'none';
  });
  updateJudgeSelectedCount();
};

window.bulkToggleJudgePrograms = function(select) {
  document.querySelectorAll('.judge-prog-label').forEach(label => {
    if (label.style.display !== 'none') {
      const cb = label.querySelector('.judge-prog-cb');
      if (cb) cb.checked = select;
    }
  });
  updateJudgeSelectedCount();
};

window.bulkSelectCurrentCategory = function() {
  document.querySelectorAll('.judge-prog-label').forEach(label => {
    const cat = label.dataset.category || '';
    if (activeJudgeCatFilter === 'All' || cat === activeJudgeCatFilter) {
      const cb = label.querySelector('.judge-prog-cb');
      if (cb) cb.checked = true;
    }
  });
  updateJudgeSelectedCount();
};

window.updateJudgeSelectedCount = function() {
  const count = document.querySelectorAll('.judge-prog-cb:checked').length;
  const el = document.getElementById('judge-selected-count');
  if (el) el.textContent = `${count} Selected`;
};

window.editTeacherJudge = function(judge) {
  if (!judge) return;
  document.getElementById('judge-editing-id').value = judge.id || '';
  document.getElementById('judge-teacher-name').value = judge.name || '';
  document.getElementById('judge-teacher-code').value = judge.code || '';
  
  const assigned = Array.isArray(judge.assignedPrograms) ? judge.assignedPrograms : [];
  document.querySelectorAll('.judge-prog-cb').forEach(cb => {
    cb.checked = assigned.includes(cb.value);
  });

  document.getElementById('judge-form-title').innerHTML = `<i class="fas fa-edit text-indigo-600"></i> Edit Teacher Judge`;
  document.getElementById('reset-judge-form-btn').classList.remove('hidden');
  document.getElementById('judge-submit-btn').innerHTML = `<i class="fas fa-check mr-1.5"></i>Update Teacher Judge Configuration`;
  
  updateJudgeSelectedCount();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.resetTeacherJudgeForm = function() {
  const form = document.getElementById('add-teacher-judge-form');
  if (form) form.reset();
  document.getElementById('judge-editing-id').value = '';
  document.getElementById('judge-form-title').innerHTML = `<i class="fas fa-gavel text-indigo-600"></i> Configure Teacher / Judge`;
  document.getElementById('reset-judge-form-btn').classList.add('hidden');
  document.getElementById('judge-submit-btn').innerHTML = `<i class="fas fa-save mr-1.5"></i>Save Teacher Judge Configuration`;
  updateJudgeSelectedCount();
};
