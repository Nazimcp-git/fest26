// js/pages-admin-tabs.js
// Remaining admin tab renderers.

function renderPublishTab() {
  const results = getDataAsArray("results").sort((a, b) => b.timestamp - a.timestamp);
  
  return `
    <div class="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm h-[calc(100vh)] flex flex-col">
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
  const { teamsArray, studentsArray } = getProvisionalScores();

  const teamsHtml = teamsArray.length === 0 ? emptyState('fa-users', 'No provisional data') : teamsArray.map((team, i) => `
    <div class="bg-white rounded-xl border border-blue-200 p-5 shadow-sm">
      <div class="flex justify-between items-center mb-3">
        <h3 class="font-semibold text-gray-900">${sanitize(team.name)}</h3>
        ${i < 3 ? `<i class="fas fa-medal text-${['yellow-500','gray-400','amber-600'][i]}"></i>` : `<span class="text-xs text-gray-400 font-medium">#${i+1}</span>`}
      </div>
      <p class="text-3xl font-bold text-blue-600">${team.totalPoints}</p>
    </div>`).join('');

  const { classesArray } = getProvisionalScores();
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
          <h4 class="text-sm font-semibold text-blue-800">Provisional Score Preview</h4>
          <p class="text-xs text-blue-700 mt-1">This shows projected scores including results marked as "Ready to Publish". Useful for double-checking rankings before live announcement.</p>
        </div>
      </div>
      <div>
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Projected Team Standings</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">${teamsHtml}</div>
      </div>
      <div>
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Projected Class Standings</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">${classesHtml}</div>
      </div>
      <div>
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Projected Top Students</h2>
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
  return `
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div class="lg:col-span-8 bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm h-[calc(100vh-200px)] flex flex-col order-2 lg:order-1">
        <h2 class="text-lg font-semibold text-gray-900 mb-4 flex-shrink-0">Applied Penalties</h2>
        <div id="items-list" class="flex-grow overflow-y-auto space-y-3 custom-scrollbar pr-2"></div>
      </div>
      
      <div class="lg:col-span-4 bg-white rounded-xl border border-red-200 p-6 shadow-sm order-1 lg:order-2 h-fit">
        <h2 class="text-lg font-semibold text-red-700 mb-4 flex items-center gap-2"><i class="fas fa-gavel"></i> Apply Penalty</h2>
        <form id="apply-penalty-form" class="space-y-4">
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">Target Team</label>
            <select id="penalty-team" required class="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500/20 outline-none">
              <option value="">Select Team</option>
              ${teams.map(t => `<option value="${t.id}">${sanitize(t.name)}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">Points to Deduct</label>
            <input type="number" id="penalty-points" min="1" required class="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500/20 outline-none">
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">Reason for Deduction</label>
            <textarea id="penalty-reason" required rows="2" class="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500/20 outline-none resize-none"></textarea>
          </div>
          <button type="submit" class="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">Enforce Penalty</button>
        </form>
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

function loadItemsList(col) {
  const c = document.getElementById("items-list");
  if (!c) return;
  
  if (col === 'penalty') {
    const pens = getDataAsArray('teamPenalties').sort((a,b) => b.createdAt - a.createdAt);
    c.innerHTML = pens.length === 0 ? emptyState('fa-shield-alt', 'No penalties applied') : pens.map(p => `
      <div class="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start justify-between gap-4">
        <div>
          <p class="text-sm text-gray-900"><span class="font-bold text-red-600">-${p.points}</span> pts to <span class="font-semibold">${sanitize(appData.teams[p.teamId]?.name || 'Unknown')}</span></p>
          <p class="text-xs text-gray-600 mt-1">${sanitize(p.reason)}</p>
          <p class="text-[10px] text-gray-400 mt-1">${formatDate(p.createdAt)}</p>
        </div>
        <button class="delete-btn flex-shrink-0 w-8 h-8 flex items-center justify-center bg-white border border-red-200 text-red-500 hover:bg-red-100 rounded-lg shadow-sm transition-colors" data-id="${p.id}" data-collection="teamPenalties"><i class="fas fa-trash text-xs"></i></button>
      </div>`).join('');
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
