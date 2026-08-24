// js/pages-public.js
// Public-facing page render functions with Apple-inspired Glassmorphism & Vintage Warmth.

/**
 * Soft Glassmorphism Category Badges
 */
function glassCategoryBadge(cat) {
  const map = {
    'BIDAYA': 'bg-pink-500/10 text-pink-700 border-pink-500/20',
    'ULA':    'bg-blue-500/10 text-blue-700 border-blue-500/20',
    'THANIYA':'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
    'THALITHA':'bg-orange-500/10 text-orange-700 border-orange-500/20',
    'RABIYA': 'bg-purple-500/10 text-purple-700 border-purple-500/20',
    'GENERAL':'bg-gray-500/10 text-gray-700 border-gray-500/20'
  };
  const cls = map[cat] || map['GENERAL'];
  return `<span class="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${cls} backdrop-blur-md">${sanitize(cat)}</span>`;
}

/**
 * HOME PAGE
 */
async function renderHomePage() {
  const { teamsArray, studentsArray, classesArray } = getStoredScores();

  const programCount = Object.keys(appData.programs || {}).length;
  const resultCount = getDataAsArray("results").filter(r => r.status === "published").length;
  const progressPct = programCount ? Math.round((resultCount / programCount) * 100) : 0;

  // Render Top Teams (Single Total Score)
  const teamsHtml = teamsArray.length === 0 
    ? `<div class="col-span-full py-12 text-center text-gray-500 font-medium">No scores published yet</div>`
    : teamsArray.map((t, i) => {
        const isFirst = i === 0;
        const medalCls = ['text-yellow-500', 'text-gray-400', 'text-amber-600'][i] || 'text-gray-300';
        return `
          <a href="#/team/${t.id}" class="block bg-gradient-to-br from-white/60 to-white/10 backdrop-blur-3xl backdrop-saturate-200 border-[0.5px] border-white/60 rounded-[2rem] p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.05),inset_0_1px_1px_rgba(255,255,255,0.8)] hover:shadow-[0_16px_48px_0_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
            ${isFirst ? '<div class="absolute -top-10 -right-10 w-32 h-32 bg-orange-400/20 rounded-full blur-2xl -z-0"></div>' : ''}
            <div class="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            
            <div class="flex justify-between items-start mb-6 relative z-10">
              <div>
                <h3 class="text-xl font-bold text-gray-900 tracking-tight group-hover:text-orange-600 transition-colors">${sanitize(t.name)}</h3>
                <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Click for session →</span>
              </div>
              <i class="fas fa-medal text-2xl ${medalCls}"></i>
            </div>
            
            <p class="text-5xl font-black text-gray-900 relative z-10 tracking-tighter">${t.totalPoints}</p>
          </a>
        `;
      }).join('');

  // Render Top Classes
  const classesHtml = (!classesArray || classesArray.length === 0)
    ? `<div class="col-span-full py-12 text-center text-gray-500 font-medium">No class scores yet</div>`
    : classesArray.slice(0, 4).map((c, i) => {
        return `
          <div class="bg-white/50 backdrop-blur-md rounded-2xl border border-white/60 p-4 shadow-sm hover:bg-white/80 transition-all flex justify-between items-center group">
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-xl bg-white border border-white/60 shadow-sm flex items-center justify-center font-bold text-gray-500 text-sm group-hover:text-orange-600 transition-colors">${i+1}</div>
              <h3 class="text-base font-bold text-gray-900">Class ${sanitize(c.name)}</h3>
            </div>
            <p class="text-2xl font-black text-gray-900">${c.totalPoints}</p>
          </div>
        `;
      }).join('');

  // Calculate Category Toppers
  const categoryToppers = {};
  CATEGORIES.forEach(cat => {
    const catStudents = studentsArray.filter(s => s.category === cat && s.totalPoints > 0);
    if (catStudents.length > 0) {
      categoryToppers[cat] = catStudents[0];
    }
  });

  const bentoClasses = [
    "md:col-span-2 md:row-span-2 min-h-[260px]",
    "md:col-span-1 md:row-span-1 min-h-[160px]",
    "md:col-span-1 md:row-span-1 min-h-[160px]",
    "md:col-span-2 md:row-span-1 min-h-[160px]",
    "md:col-span-1 md:row-span-1 min-h-[160px]",
    "md:col-span-1 md:row-span-1 min-h-[160px]"
  ];

  const categoryToppersHtml = CATEGORIES.map((cat, i) => {
    const s = categoryToppers[cat];
    const bentoCls = bentoClasses[i % bentoClasses.length];
    
    if (!s) {
       return `
         <div class="${bentoCls} bg-white/20 backdrop-blur-xl rounded-[2rem] border border-white/40 p-6 flex flex-col justify-center items-center text-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]">
            ${glassCategoryBadge(cat)}
            <p class="text-sm text-gray-500 mt-3 font-medium">No scores yet</p>
         </div>
       `;
    }

    return `
      <div class="${bentoCls} bg-gradient-to-br from-white/60 to-white/10 backdrop-blur-3xl backdrop-saturate-200 rounded-[2rem] border-[0.5px] border-white/60 p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.05),inset_0_1px_1px_rgba(255,255,255,0.8)] hover:shadow-[0_16px_48px_0_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group overflow-hidden relative">
        <div class="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
        <div class="relative z-10 flex items-start gap-4">
          <div class="w-14 h-14 rounded-2xl bg-white/80 border border-white/80 flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden relative group">
            <img src="https://raw.githubusercontent.com/Nazimcp-git/azinco/refs/heads/main/images/${encodeURIComponent(s.chestNo)}.jpg" alt="${sanitize(s.name)}"
              class="w-full h-full object-cover rounded-2xl"
              onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex';" />
            <div class="w-full h-full rounded-2xl flex items-center justify-center bg-orange-500/10 text-orange-600 font-black text-xs">
              #${sanitize(s.chestNo)}
            </div>
          </div>
          <div>
            <div class="mb-1">${glassCategoryBadge(cat)}</div>
            <a href="#/student/${s.id}" class="block">
              <h3 class="text-xl font-black text-gray-900 group-hover:text-orange-600 transition-colors tracking-tight leading-tight">${sanitize(s.name)}</h3>
            </a>
            <p class="text-xs text-gray-600 font-medium mt-0.5">${sanitize(appData.teams[s.teamId]?.name || 'N/A')} • Class ${sanitize(s.className || 'N/A')}</p>
          </div>
        </div>
        <div class="mt-6 pt-4 border-t border-black/5 flex justify-between items-end relative z-10">
          <span class="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Total Points</span>
          <span class="text-3xl font-black text-gray-900 leading-none">${s.totalPoints}</span>
        </div>
      </div>
    `;
  }).join('');

  // Category-Wise Team Points Table (Category points only)
  const categoryMatrixTableHtml = `
    <div class="bg-white/60 backdrop-blur-xl border border-white/60 rounded-3xl overflow-hidden shadow-lg shadow-black/5">
      <div class="p-6 border-b border-black/5 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center border border-orange-500/20">
            <i class="fas fa-table-list text-lg"></i>
          </div>
          <div>
            <h2 class="text-lg font-bold text-gray-900 tracking-tight">Category-Wise Points</h2>
            <p class="text-xs text-gray-500 font-medium">Score matrix across categories</p>
          </div>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead class="bg-black/5 border-b border-black/5 text-gray-600">
            <tr>
              <th class="px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest">Team</th>
              ${CATEGORIES.map(cat => `<th class="px-3 py-3.5 text-[10px] font-bold uppercase tracking-widest text-center">${cat}</th>`).join('')}
            </tr>
          </thead>
          <tbody class="divide-y divide-black/5">
            ${teamsArray.map((t, idx) => `
              <tr class="hover:bg-white/50 transition-colors group">
                <td class="px-5 py-3.5">
                  <a href="#/team/${t.id}" class="flex items-center gap-2.5 font-bold text-gray-900 group-hover:text-orange-600 transition-colors text-sm">
                    <span class="w-5 h-5 rounded-md ${idx === 0 ? 'bg-amber-500/20 text-amber-700 font-black' : 'bg-gray-200 text-gray-600 font-bold'} text-[10px] flex items-center justify-center flex-shrink-0">${idx + 1}</span>
                    <span class="truncate">${sanitize(t.name)}</span>
                  </a>
                </td>
                ${CATEGORIES.map(cat => {
                  const pts = t.categoryPoints?.[cat] || 0;
                  return `
                    <td class="px-3 py-3.5 text-center">
                      <span class="inline-block px-3 py-1 rounded-lg text-xs font-black ${pts > 0 ? 'bg-orange-500/10 text-orange-700 border border-orange-500/20' : 'text-gray-400 bg-gray-100/50'}">${pts}</span>
                    </td>`;
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>`;

  return `
    <div class="space-y-10 pb-12 animate-fade-in max-w-6xl mx-auto mt-8">
      
      <!-- Top Header & Progress -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6">
        <div>
          <h1 class="text-4xl font-black text-gray-900 tracking-tighter mb-1">Live Dashboard</h1>
          <p class="text-sm text-gray-600 font-medium">Real-time standings and festival progress</p>
        </div>
        
        <div class="w-full md:w-72 bg-gradient-to-br from-white/60 to-white/10 backdrop-blur-3xl backdrop-saturate-200 border-[0.5px] border-white/60 shadow-[0_8px_32px_0_rgba(0,0,0,0.05),inset_0_1px_1px_rgba(255,255,255,0.8)] rounded-[2rem] p-6 relative overflow-hidden group">
          <div class="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
          <div class="relative z-10">
            <div class="flex justify-between items-end mb-3">
              <span class="text-xs font-bold uppercase tracking-widest text-gray-500">Progress</span>
              <span class="text-xl font-black text-orange-600">${progressPct}%</span>
            </div>
            <div class="h-2.5 w-full bg-black/5 rounded-full overflow-hidden shadow-inner">
              <div class="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all duration-1000 ease-out" style="width: ${progressPct}%"></div>
            </div>
            <p class="text-[11px] text-gray-500 mt-3 font-medium text-right">${resultCount} of ${programCount} published</p>
          </div>
        </div>
      </div>

      <!-- Teams Section with Category Points -->
      <div>
        <h2 class="text-xl font-bold text-gray-900 tracking-tight mb-5 flex items-center gap-2">
          <i class="fas fa-crown text-yellow-500"></i> Team Standings
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          ${teamsHtml}
        </div>
      </div>

      <!-- Class-Wise & Category Matrix Row -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <!-- Class-Wise Standings (5 cols) -->
        <div class="lg:col-span-5">
          <div class="bg-white/60 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-lg shadow-black/5 h-full flex flex-col justify-between">
            <div>
              <div class="flex items-center gap-3 mb-5">
                <div class="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center border border-orange-500/20">
                  <i class="fas fa-chalkboard-user text-lg"></i>
                </div>
                <div>
                  <h2 class="text-lg font-bold text-gray-900 tracking-tight">Class-Wise Standings</h2>
                  <p class="text-xs text-gray-500 font-medium">Rankings across all classes</p>
                </div>
              </div>
              <div class="space-y-3">
                ${classesHtml}
              </div>
            </div>
            <a href="#/leaderboard" class="mt-6 block text-center w-full py-3 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 shadow-xs hover:bg-white text-sm font-bold text-gray-800 transition-all">
              View Full Leaderboard →
            </a>
          </div>
        </div>

        <!-- Category Matrix Table (7 cols) -->
        <div class="lg:col-span-7">
          ${categoryMatrixTableHtml}
        </div>

      </div>

      <!-- Single Unified Category Toppers Section -->
      <div class="pt-4">
        <div class="flex justify-between items-center mb-5">
          <h2 class="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <i class="fas fa-star text-orange-500"></i> Category Toppers
          </h2>
          <a href="#/leaderboard" class="text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors">View All Leaders →</a>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
          ${categoryToppersHtml}
        </div>
      </div>

    </div>
  `;
}

/**
 * RESULTS PAGE
 */
async function renderResultsPage(search = '', stageFilter = 'All') {
  const results = getDataAsArray("results")
    .filter(r => r.status === "published")
    .filter(r => search ? r.programName.toLowerCase().includes(search.toLowerCase()) : true)
    .filter(r => {
      if (stageFilter === 'All') return true;
      const type = r.stageType || 'stage';
      return stageFilter === 'Stage' ? type === 'stage' : type === 'non-stage';
    })
    .sort((a, b) => b.timestamp - a.timestamp);

  const resultsHtml = results.length === 0 
    ? `<div class="py-20 text-center text-gray-500 col-span-full border border-black/10 rounded-3xl border-dashed bg-white/30 backdrop-blur-md">
         <i class="fas fa-search text-3xl mb-3 opacity-30"></i>
         <p class="font-medium">No published results found.</p>
       </div>`
    : results.map(r => {
        let participantsHtml = '';
        if (r.participants && r.participants.length > 0) {
          participantsHtml = r.participants.map(p => {
            const student = appData.students[p.studentId];
            const teamName = student ? appData.teams[student.teamId]?.name : 'Unknown';
            let prize = [];
            if (p.position && p.position !== 'none') prize.push(POSITION_LABELS[p.position]);
            if (p.grade && p.grade !== 'none') prize.push(GRADE_LABELS[p.grade]);
            
            const prizeStr = prize.length > 0 
              ? `<span class="inline-block mt-1 px-2.5 py-0.5 rounded-lg bg-orange-500/10 text-orange-700 border border-orange-500/20 text-[10px] font-bold tracking-wide">${prize.join(' • ')}</span>`
              : '';
            
            return `
              <div class="py-3 flex justify-between items-start group border-b border-black/5 last:border-0">
                <div>
                  <a href="#/student/${p.studentId}" class="font-bold text-gray-900 group-hover:text-orange-600 transition-colors text-sm">${sanitize(p.name)}</a>
                  <p class="text-[11px] text-gray-500 mt-0.5">${sanitize(teamName)} ${student?.className ? `• Class ${sanitize(student.className)}` : ''}</p>
                </div>
                <div class="text-right">${prizeStr}</div>
              </div>`;
          }).join('');
        } else {
          participantsHtml = `<p class="text-sm text-gray-500 py-3 italic">No participants recorded.</p>`;
        }

        return `
          <div class="bg-white/60 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-lg shadow-black/5 flex flex-col h-full hover:bg-white/80 transition-all">
            <div class="flex justify-between items-start mb-5 pb-4 border-b border-black/5">
              <div>
                <h3 class="text-lg font-bold text-gray-900 tracking-tight mb-2 leading-tight">${sanitize(r.programName)}</h3>
                <div class="flex gap-2 items-center">
                  ${glassCategoryBadge(r.category)}
                  <span class="text-[9px] uppercase tracking-widest font-bold text-gray-500 bg-black/5 px-2 py-1 rounded-lg">${r.stageType === 'non-stage' ? 'Non-Stage' : 'Stage'}</span>
                </div>
              </div>
              <span class="text-[11px] font-medium text-gray-500 whitespace-nowrap ml-4">${formatDate(r.timestamp)}</span>
            </div>
            <div class="flex-grow">
              ${participantsHtml}
            </div>
          </div>`;
      }).join('');

  return `
    <div class="animate-fade-in max-w-6xl mx-auto pb-12 mt-8">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
        <div>
          <h1 class="text-4xl font-black text-gray-900 tracking-tighter">Official Results</h1>
          <p class="text-gray-600 mt-1 font-medium text-sm">Browse verified competition outcomes</p>
        </div>
        
        <div class="w-full md:w-auto flex flex-col sm:flex-row gap-3">
          <form id="results-search-form" class="relative">
            <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
            <input type="text" id="results-search-input" value="${sanitize(search)}" placeholder="Search programs..." 
              class="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-white/60 backdrop-blur-md border border-white/60 shadow-sm rounded-2xl text-gray-900 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all">
          </form>
          <div class="overflow-x-auto hide-scrollbar pb-1 max-w-full">
            <div id="results-stage-filter-container" class="flex w-max bg-white/40 backdrop-blur-md border border-white/60 rounded-2xl p-1 shadow-sm">
              ${['All', 'Stage', 'Non-Stage'].map(s => `
                <button data-stage="${s}" class="category-filter-btn flex-shrink-0 px-4 py-1.5 text-xs font-bold rounded-xl transition-all ${stageFilter === s ? 'bg-white text-gray-900 shadow-sm border border-white/60' : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'}">${s}</button>
              `).join('')}
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${resultsHtml}
      </div>
    </div>`;
}

/**
 * LEADERBOARD PAGE
 */
async function renderLeaderboardPage(categoryFilter = 'All') {
  const { teamsArray, studentsArray, classesArray } = getStoredScores();

  let filteredStudents = studentsArray;
  if (categoryFilter !== 'All') {
    filteredStudents = studentsArray.filter(s => s.category === categoryFilter);
  }

  const classesHtml = (!classesArray || classesArray.length === 0)
    ? `<tr><td colspan="3" class="py-8 text-center text-gray-500">No class data available</td></tr>`
    : classesArray.map((c, i) => `
        <tr class="border-b border-black/5 hover:bg-white/40 transition-colors group">
          <td class="px-5 py-4 w-16">
            <div class="w-8 h-8 rounded-xl bg-white border border-white/60 shadow-sm flex items-center justify-center font-bold text-gray-500 text-sm">${i+1}</div>
          </td>
          <td class="px-5 py-4 font-bold text-gray-900 text-sm">Class ${sanitize(c.name)}</td>
          <td class="px-5 py-4 text-right font-black text-lg text-gray-900">${c.totalPoints}</td>
        </tr>
      `).join('');

  const tableBody = filteredStudents.length === 0 
    ? `<tr><td colspan="5" class="py-12 text-center text-gray-500">No students found</td></tr>`
    : filteredStudents.map((s, i) => `
      <tr class="border-b border-black/5 hover:bg-white/40 transition-colors group">
        <td class="px-5 py-4">
          <div class="w-8 h-8 rounded-xl ${i<3 ? 'bg-orange-500/10 text-orange-600 font-bold border border-orange-500/20' : 'bg-transparent text-gray-500 font-medium'} flex items-center justify-center text-sm">
            ${i+1}
          </div>
        </td>
        <td class="px-5 py-4">
          <a href="#/student/${s.id}" class="font-bold text-gray-900 group-hover:text-orange-600 transition-colors text-sm">${sanitize(s.name)}</a>
        </td>
        <td class="px-5 py-4 text-gray-600 text-sm">${sanitize(appData.teams[s.teamId]?.name || 'N/A')}</td>
        <td class="px-5 py-4">${glassCategoryBadge(s.category)}</td>
        <td class="px-5 py-4 text-right font-black text-gray-900 text-lg">${s.totalPoints || 0}</td>
      </tr>`).join('');

  return `
    <div class="animate-fade-in max-w-6xl mx-auto pb-12 space-y-10 mt-8">
      
      <div>
        <h1 class="text-4xl font-black text-gray-900 tracking-tighter">Overall Standings</h1>
        <p class="text-sm text-gray-600 font-medium mt-1 mb-8">Detailed rankings across teams, classes, and individuals.</p>
      </div>
        
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Class Leaderboard -->
        <div class="bg-white/60 backdrop-blur-xl border border-white/60 rounded-3xl overflow-hidden shadow-lg shadow-black/5 flex flex-col h-[500px]">
          <div class="p-6 border-b border-white/60 bg-white/40 flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center border border-orange-500/20"><i class="fas fa-chalkboard-teacher text-lg"></i></div>
            <h2 class="text-lg font-bold text-gray-900 tracking-tight">Class Rankings</h2>
          </div>
          <div class="overflow-y-auto flex-grow custom-scrollbar">
            <table class="w-full text-left">
              <tbody>${classesHtml}</tbody>
            </table>
          </div>
        </div>

        <!-- Team Points Breakdown -->
        <div class="bg-white/60 backdrop-blur-xl border border-white/60 rounded-3xl overflow-hidden shadow-lg shadow-black/5 flex flex-col h-[500px]">
          <div class="p-6 border-b border-white/60 bg-white/40 flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-yellow-500/10 text-yellow-600 flex items-center justify-center border border-yellow-500/20"><i class="fas fa-crown text-lg"></i></div>
            <h2 class="text-lg font-bold text-gray-900 tracking-tight">Team Points</h2>
          </div>
          <div class="overflow-y-auto flex-grow custom-scrollbar p-6 space-y-6">
            ${teamsArray.map(t => `
              <a href="#/team/${t.id}" class="block bg-white/40 hover:bg-white/70 p-4 rounded-2xl border border-white/60 transition-all hover:scale-[1.01] group">
                <div class="flex justify-between items-end mb-3">
                  <div>
                    <h3 class="font-bold text-base text-gray-900 group-hover:text-orange-600 transition-colors">${sanitize(t.name)}</h3>
                    <span class="text-[11px] font-bold text-gray-400">Click for full team session →</span>
                  </div>
                  <span class="font-black text-2xl text-gray-900">${t.totalPoints}</span>
                </div>
                <div class="grid grid-cols-3 gap-2">
                  ${CATEGORIES.map(cat => `
                    <div class="bg-white/60 rounded-xl p-2 border border-white/60 text-center shadow-sm">
                      <p class="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">${cat}</p>
                      <p class="text-sm font-black text-gray-800">${t.categoryPoints?.[cat] || 0}</p>
                    </div>
                  `).join('')}
                </div>
              </a>
            `).join('')}
          </div>
        </div>
      </div>

      <div>
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 mt-8">
          <h2 class="text-xl font-bold text-gray-900 tracking-tight">Top Students</h2>
          <div class="overflow-x-auto hide-scrollbar pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 max-w-full">
            <div id="leaderboard-filter-container" class="flex flex-nowrap w-max gap-2 bg-white/40 backdrop-blur-md border border-white/60 p-1.5 rounded-2xl shadow-sm">
              ${['All', ...CATEGORIES].map(c => `
                <button data-category="${c}" class="category-filter-btn flex-shrink-0 px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all border ${categoryFilter === c ? 'bg-white text-orange-600 border-white/60 shadow-sm' : 'bg-transparent text-gray-600 border-transparent hover:bg-white/50'}">${c}</button>
              `).join('')}
            </div>
          </div>
        </div>
        
        <div class="bg-white/60 backdrop-blur-xl border border-white/60 rounded-3xl overflow-hidden shadow-lg shadow-black/5">
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead class="bg-black/5 border-b border-black/5">
                <tr>
                  <th class="px-5 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Rank</th>
                  <th class="px-5 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Student Name</th>
                  <th class="px-5 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Team</th>
                  <th class="px-5 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Category</th>
                  <th class="px-5 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Points</th>
                </tr>
              </thead>
              <tbody>${tableBody}</tbody>
            </table>
          </div>
        </div>
      </div>
    </div>`;
}

/**
 * SEARCH PAGE
 */
async function renderSearchPage() {
  return `
    <div class="animate-fade-in max-w-xl mx-auto py-20">
      <div class="text-center mb-10">
        <div class="w-20 h-20 rounded-3xl bg-white/60 backdrop-blur-xl flex items-center justify-center mx-auto mb-6 border border-white/60 shadow-lg shadow-black/5">
          <i class="fas fa-search text-3xl text-orange-500"></i>
        </div>
        <h1 class="text-4xl font-black text-gray-900 tracking-tighter mb-3">Find Participant</h1>
        <p class="text-gray-600 font-medium text-sm">Enter Chest Number to view student profile and achievements.</p>
      </div>

      <form id="profile-search-form" class="bg-white/60 backdrop-blur-xl p-2.5 rounded-3xl border border-white/60 shadow-lg shadow-black/5 flex items-center focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-500 transition-all">
        <i class="fas fa-id-badge text-gray-400 ml-4 text-xl"></i>
        <input type="text" id="chest-no-input" required placeholder="e.g. 101" 
          class="w-full bg-transparent border-none text-gray-900 px-4 py-3 focus:outline-none focus:ring-0 font-bold text-lg placeholder-gray-400">
        <button type="submit" class="px-8 py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black transition-colors text-sm shadow-md">
          Search
        </button>
      </form>
      <div id="search-error" class="hidden mt-4 p-4 bg-red-500/10 backdrop-blur-md border border-red-500/20 rounded-2xl text-center text-red-600 font-medium text-sm"></div>
    </div>`;
}

/**
 * STUDENT PROFILE PAGE
 */
async function renderStudentPage(studentId) {
  const student = appData.students[studentId];
  if (!student) return `<div class="py-20 text-center text-gray-500 font-medium bg-white/60 backdrop-blur-xl rounded-3xl border border-white/60 max-w-2xl mx-auto mt-12">Student not found.</div>`;

  const teamName = appData.teams[student.teamId]?.name || 'Unknown Team';
  const partMap = {};

  // 1. Registered Programs from appData.participantRegistrations
  Object.entries(appData.participantRegistrations || {}).forEach(([progId, teamsObj]) => {
    if (!teamsObj || typeof teamsObj !== 'object') return;
    const rawTeamRegs = teamsObj[student.teamId];
    if (!rawTeamRegs) return;

    // Normalize: Firebase may store arrays as objects with numeric keys
    let teamRegs = [];
    if (Array.isArray(rawTeamRegs)) {
      teamRegs = rawTeamRegs;
    } else if (typeof rawTeamRegs === 'object') {
      teamRegs = Object.values(rawTeamRegs);
    } else if (typeof rawTeamRegs === 'string') {
      teamRegs = [rawTeamRegs];
    }

    if (teamRegs.includes(studentId)) {
      const p = appData.programs?.[progId];
      if (p) {
        partMap[progId] = {
          programId: progId,
          programName: p.name || 'Program',
          category: p.category || student.category || 'GENERAL',
          status: 'registered',
          position: 'none',
          grade: 'none',
          points: 0,
          timestamp: 0
        };
      }
    }
  });

  // 2. Published Results & Overwrites
  Object.values(appData.results || {}).forEach(r => {
    if (!r || !r.participants) return;
    const pt = r.participants.find(p => p.studentId === studentId);
    if (pt) {
      const isPrized = (pt.position && pt.position !== 'none') || (pt.grade && pt.grade !== 'none');
      partMap[r.programId] = {
        programId: r.programId,
        programName: r.programName || appData.programs?.[r.programId]?.name || 'Program',
        category: r.category || appData.programs?.[r.programId]?.category || student.category,
        position: pt.position || 'none',
        grade: pt.grade || 'none',
        points: pt.points || 0,
        status: r.status === 'published' ? (isPrized ? 'prized' : 'participated') : 'registered',
        timestamp: r.timestamp || 0
      };
    } else if (r.status === 'published' && partMap[r.programId]) {
      partMap[r.programId].status = 'participated';
      partMap[r.programId].timestamp = r.timestamp || 0;
    }
  });

  const allParts = Object.values(partMap);
  const prizedPrograms = allParts.filter(p => (p.position && p.position !== 'none') || (p.grade && p.grade !== 'none'));

  // Prized Programs Item Renderer
  const renderPrizedItem = (p) => {
    let prizeStr = '';
    if (p.position && p.position !== 'none') {
      prizeStr += `<span class="px-3 py-1.5 bg-yellow-500/10 text-yellow-700 border border-yellow-500/20 rounded-xl font-bold text-xs uppercase tracking-wider mr-2 backdrop-blur-md flex items-center gap-1.5"><i class="fas fa-trophy text-amber-500"></i>${POSITION_LABELS[p.position] || p.position}</span>`;
    }
    if (p.grade && p.grade !== 'none') {
      prizeStr += `<span class="px-3 py-1.5 bg-blue-500/10 text-blue-700 border border-blue-500/20 rounded-xl font-bold text-xs uppercase tracking-wider mr-2 backdrop-blur-md flex items-center gap-1.5"><i class="fas fa-certificate text-blue-500"></i>${GRADE_LABELS[p.grade] || p.grade}</span>`;
    }

    return `
      <div class="bg-white/60 backdrop-blur-md border border-white/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group">
        <div>
          <p class="font-bold text-gray-900 text-base group-hover:text-orange-600 transition-colors">${sanitize(p.programName)}</p>
          <p class="text-[11px] text-gray-500 mt-1 font-bold tracking-widest uppercase">${sanitize(p.category)}</p>
        </div>
        <div class="flex items-center gap-3 flex-shrink-0">
          ${prizeStr}
          ${p.points ? `<span class="px-3 py-1.5 bg-orange-500/10 text-orange-700 border border-orange-500/20 rounded-xl font-black text-sm">+${p.points} Pts</span>` : ''}
        </div>
      </div>`;
  };

  // Registered Programs Item Renderer
  const renderRegisteredItem = (p) => {
    let statusBadge = '';
    if (p.status === 'prized') {
      statusBadge = `<span class="px-3 py-1 bg-amber-500/10 text-amber-700 border border-amber-500/20 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5"><i class="fas fa-trophy text-amber-500"></i>Prized Winner</span>`;
    } else if (p.status === 'participated') {
      statusBadge = `<span class="px-3 py-1 bg-white/70 text-gray-700 border border-white/80 rounded-xl font-bold text-xs uppercase tracking-wider shadow-xs flex items-center gap-1.5"><i class="fas fa-user-check text-gray-400"></i>Participated</span>`;
    } else {
      statusBadge = `<span class="px-3 py-1 bg-blue-500/10 text-blue-700 border border-blue-500/20 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5"><i class="fas fa-clock text-blue-500"></i>Registered / Upcoming</span>`;
    }

    return `
      <div class="bg-white/40 backdrop-blur-md border border-white/60 rounded-2xl p-4 shadow-2xs hover:bg-white/70 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 group">
        <div>
          <p class="font-bold text-gray-900 text-sm group-hover:text-orange-600 transition-colors">${sanitize(p.programName)}</p>
          <p class="text-[10px] text-gray-500 mt-0.5 font-bold tracking-widest uppercase">${sanitize(p.category)}</p>
        </div>
        <div class="flex-shrink-0">
          ${statusBadge}
        </div>
      </div>`;
  };

  const prizedHtml = prizedPrograms.length === 0 
    ? `<div class="py-8 text-center border border-dashed border-black/10 rounded-3xl text-gray-500 font-medium bg-white/30 backdrop-blur-sm">No recorded prizes or positions yet.</div>`
    : prizedPrograms.map(renderPrizedItem).join('');

  const registeredHtml = allParts.length === 0 
    ? `<div class="py-8 text-center border border-dashed border-black/10 rounded-3xl text-gray-500 font-medium bg-white/30 backdrop-blur-sm">No registered programs found.</div>`
    : allParts.map(renderRegisteredItem).join('');

  const studentImgUrl = `https://raw.githubusercontent.com/Nazimcp-git/azinco/refs/heads/main/images/${encodeURIComponent(student.chestNo)}.jpg`;

  return `
    <div class="animate-fade-in max-w-4xl mx-auto py-12 space-y-10">
      
      <!-- Profile Header -->
      <div class="bg-white/60 backdrop-blur-2xl border border-white/60 shadow-lg shadow-black/5 rounded-[2.5rem] p-10 flex flex-col md:flex-row gap-10 items-center md:items-start text-center md:text-left relative overflow-hidden">
        
        <div class="absolute -top-20 -right-20 w-64 h-64 bg-orange-400/10 rounded-full blur-3xl -z-0"></div>
        
        <div class="w-36 h-36 rounded-full bg-white/80 border-4 border-white/80 flex items-center justify-center flex-shrink-0 shadow-lg relative z-10 overflow-hidden group">
          <img src="${studentImgUrl}" alt="${sanitize(student.name)}" 
            class="w-full h-full object-cover rounded-full" 
            onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex';" />
          <div class="w-full h-full rounded-full flex items-center justify-center bg-gray-100/90 text-gray-400">
            <i class="fas fa-user text-6xl"></i>
          </div>
          <span class="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold shadow-md z-20"><i class="fas fa-check"></i></span>
        </div>
        
        <div class="flex-grow pt-2 relative z-10">
          <div class="flex flex-col md:flex-row md:items-center gap-4 mb-2 justify-center md:justify-start">
            <h1 class="text-4xl font-black text-gray-900 tracking-tighter">${sanitize(student.name)}</h1>
            ${glassCategoryBadge(student.category)}
          </div>
          
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
            <div class="px-5 py-4 bg-white/50 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm">
              <p class="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Chest No</p>
              <p class="text-xl font-black text-gray-900">${sanitize(student.chestNo)}</p>
            </div>
            <div class="px-5 py-4 bg-white/50 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm">
              <p class="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Team</p>
              <p class="text-sm font-bold text-gray-900 mt-2 whitespace-nowrap overflow-hidden text-ellipsis">${sanitize(teamName)}</p>
            </div>
            <div class="px-5 py-4 bg-white/50 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm">
              <p class="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Class</p>
              <p class="text-sm font-bold text-gray-900 mt-2 whitespace-nowrap overflow-hidden text-ellipsis">${sanitize(student.className || 'N/A')}</p>
            </div>
            <div class="px-5 py-4 bg-orange-500/10 backdrop-blur-md rounded-2xl border border-orange-500/20 shadow-sm">
              <p class="text-[10px] text-orange-600 uppercase tracking-widest font-bold mb-1">Total Points</p>
              <p class="text-2xl font-black text-gray-900">${student.totalPoints || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 1. Prized Programs & Achievements Section -->
      <div>
        <h2 class="text-2xl font-bold text-gray-900 tracking-tighter mb-5 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/20"><i class="fas fa-trophy"></i></div>
            <span>Prized Programs & Achievements</span>
          </div>
          <span class="text-xs font-bold px-3 py-1 bg-amber-500/10 text-amber-700 border border-amber-500/20 rounded-xl">${prizedPrograms.length} Awards</span>
        </h2>
        <div class="space-y-4">
          ${prizedHtml}
        </div>
      </div>

      <!-- 2. All Registered Programs Section -->
      <div>
        <h2 class="text-2xl font-bold text-gray-900 tracking-tighter mb-5 flex items-center justify-between mt-10">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center border border-blue-500/20"><i class="fas fa-list-check"></i></div>
            <span>All Registered Programs Roster</span>
          </div>
          <span class="text-xs font-bold px-3 py-1 bg-blue-500/10 text-blue-700 border border-blue-500/20 rounded-xl">${allParts.length} Programs</span>
        </h2>
        <div class="space-y-3">
          ${registeredHtml}
        </div>
      </div>

    </div>`;
}

// Ensure the handleProfileSearch logic is exported or accessible
window.handleProfileSearch = function(e) {
  e.preventDefault();
  const val = document.getElementById("chest-no-input").value.trim().toLowerCase();
  const student = Object.values(appData.students || {}).find(s => s.chestNo.toLowerCase() === val);
  const errEl = document.getElementById("search-error");
  if (student) {
    errEl.classList.add("hidden");
    window.location.hash = `/student/${student.id}`;
  } else {
    errEl.textContent = `No student found with Chest Number "${val}"`;
    errEl.classList.remove("hidden");
  }
};

/**
 * TV DISPLAY PAGE — Full-screen, dramatic result announcement for hall screens.
 * Shows the latest published result in a big, bold, dark-themed layout.
 * Auto-refreshes when Firebase data changes.
 */
function renderTVDisplayPage() {
  // Get all published results sorted by timestamp (latest first)
  const publishedResults = getDataAsArray("results")
    .filter(r => r.status === "published" && r.participants && r.participants.length > 0)
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

  const latest = publishedResults[0];

  // Get stored team scores for the ticker
  const { teamsArray } = getStoredScores();

  // Category accent colors for the TV
  const catAccents = {
    'BIDAYA':     { gradient: 'from-emerald-500 to-teal-400',   glow: 'shadow-emerald-500/30', text: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30' },
    'ALIYA':      { gradient: 'from-sky-500 to-cyan-400',       glow: 'shadow-sky-500/30',     text: 'text-sky-400',     bg: 'bg-sky-500/15',     border: 'border-sky-500/30' },
    'UOOLA':      { gradient: 'from-violet-500 to-purple-400',  glow: 'shadow-violet-500/30',  text: 'text-violet-400',  bg: 'bg-violet-500/15',  border: 'border-violet-500/30' },
    'THANIYA':    { gradient: 'from-amber-500 to-yellow-400',   glow: 'shadow-amber-500/30',   text: 'text-amber-400',   bg: 'bg-amber-500/15',   border: 'border-amber-500/30' },
    'THANAWIYYA': { gradient: 'from-rose-500 to-pink-400',      glow: 'shadow-rose-500/30',    text: 'text-rose-400',    bg: 'bg-rose-500/15',    border: 'border-rose-500/30' },
    'KULLIYYA':   { gradient: 'from-indigo-500 to-blue-400',    glow: 'shadow-indigo-500/30',  text: 'text-indigo-400',  bg: 'bg-indigo-500/15',  border: 'border-indigo-500/30' }
  };

  const defaultAccent = { gradient: 'from-orange-500 to-amber-400', glow: 'shadow-orange-500/30', text: 'text-orange-400', bg: 'bg-orange-500/15', border: 'border-orange-500/30' };

  // Position styling for TV
  const positionIcons = {
    'first':  { icon: 'fa-trophy',  color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/40', label: '1ST PLACE' },
    'second': { icon: 'fa-medal',   color: 'text-gray-300',   bg: 'bg-gray-500/20',   border: 'border-gray-400/40',   label: '2ND PLACE' },
    'third':  { icon: 'fa-medal',   color: 'text-amber-600',  bg: 'bg-amber-600/20',  border: 'border-amber-600/40',  label: '3RD PLACE' }
  };

  const gradeStyle = {
    'a_grade': { label: 'A GRADE', color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/40' },
    'b_grade': { label: 'B GRADE', color: 'text-blue-400',    bg: 'bg-blue-500/20',    border: 'border-blue-500/40' }
  };

  if (!latest) {
    return `
      <div class="tv-display-page min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center relative overflow-hidden">
        <div class="absolute inset-0">
          <div class="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-[150px]"></div>
          <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[150px]"></div>
        </div>
        <div class="text-center relative z-10">
          <div class="w-32 h-32 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-8">
            <i class="fas fa-bullhorn text-5xl text-white/20"></i>
          </div>
          <h1 class="text-5xl font-black text-white/40 tracking-tight mb-3">Awaiting Results</h1>
          <p class="text-xl text-white/20 font-medium">Results will appear here when announced</p>
          <div class="mt-8 flex items-center gap-3 justify-center text-white/15">
            <div class="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
            <span class="text-sm font-medium tracking-widest uppercase">Live</span>
          </div>
        </div>
      </div>`;
  }

  const accent = catAccents[latest.category] || defaultAccent;

  // Build participants HTML — sorted by position priority
  const posOrder = { 'first': 1, 'second': 2, 'third': 3 };
  const sortedParticipants = [...(latest.participants || [])].sort((a, b) => {
    const pa = posOrder[a.position] || 99;
    const pb = posOrder[b.position] || 99;
    return pa - pb;
  });

  const participantsHtml = sortedParticipants.map(p => {
    const student = appData.students[p.studentId];
    const teamName = student ? appData.teams[student.teamId]?.name : 'Unknown';
    const displayName = latest.programType !== 'individual' ? `${p.name} & Team` : p.name;
    const chestNo = student ? student.chestNo : '';

    let prizeBadges = '';
    const pos = positionIcons[p.position];
    const grd = gradeStyle[p.grade];

    if (pos) {
      prizeBadges += `
        <div class="flex items-center gap-3 ${pos.bg} ${pos.border} border rounded-2xl px-5 py-3">
          <i class="fas ${pos.icon} text-2xl ${pos.color}"></i>
          <span class="text-lg font-black ${pos.color} tracking-wider">${pos.label}</span>
        </div>`;
    }
    if (grd) {
      prizeBadges += `
        <div class="flex items-center gap-3 ${grd.bg} ${grd.border} border rounded-2xl px-5 py-3">
          <i class="fas fa-award text-2xl ${grd.color}"></i>
          <span class="text-lg font-black ${grd.color} tracking-wider">${grd.label}</span>
        </div>`;
    }

    if (!prizeBadges) {
      prizeBadges = `
        <div class="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-5 py-3">
          <i class="fas fa-star text-2xl text-white/30"></i>
          <span class="text-lg font-black text-white/40 tracking-wider">PARTICIPANT</span>
        </div>`;
    }

    return `
      <div class="tv-participant-card bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] rounded-3xl p-6 hover:bg-white/[0.06] transition-all duration-500 group">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="flex items-center gap-5">
            <div class="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
              <span class="text-xl font-black text-white/60">${sanitize(chestNo)}</span>
            </div>
            <div>
              <h3 class="text-2xl font-black text-white tracking-tight group-hover:text-white/90 transition-colors">${sanitize(displayName)}</h3>
              <p class="text-base text-white/40 font-medium mt-1">${sanitize(teamName)}</p>
            </div>
          </div>
          <div class="flex flex-wrap gap-3">
            ${prizeBadges}
          </div>
        </div>
      </div>`;
  }).join('');

  // Team scores ticker
  const tickerHtml = teamsArray.map((t, i) => {
    const medalColors = ['text-yellow-400', 'text-gray-300', 'text-amber-600'];
    const medalColor = medalColors[i] || 'text-white/30';
    return `
      <div class="flex items-center gap-4 px-6 flex-shrink-0">
        <i class="fas fa-${i < 3 ? 'medal' : 'flag'} ${medalColor}"></i>
        <span class="text-white/70 font-bold whitespace-nowrap">${sanitize(t.name)}</span>
        <span class="text-white font-black text-xl">${t.totalPoints}</span>
      </div>`;
  }).join('<div class="w-px h-6 bg-white/10 flex-shrink-0"></div>');

  // Recent results list (last 5 excluding the latest)
  const recentResults = publishedResults.slice(1, 6);
  const recentHtml = recentResults.length > 0 ? recentResults.map(r => `
    <div class="flex items-center justify-between py-3 border-b border-white/[0.05] last:border-0">
      <div class="flex items-center gap-3">
        <div class="w-2 h-2 rounded-full bg-gradient-to-r ${(catAccents[r.category] || defaultAccent).gradient} flex-shrink-0"></div>
        <span class="text-white/60 font-medium text-sm truncate max-w-[200px]">${sanitize(r.programName)}</span>
      </div>
      <span class="text-white/30 text-xs font-medium uppercase tracking-widest flex-shrink-0 ml-3">${sanitize(r.category)}</span>
    </div>
  `).join('') : '';

  return `
    <div class="tv-display-page min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 relative overflow-hidden">
      
      <!-- Ambient Background Glow -->
      <div class="absolute inset-0 pointer-events-none">
        <div class="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-gradient-to-r ${accent.gradient} opacity-[0.04] rounded-full blur-[200px] animate-blob"></div>
        <div class="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-gradient-to-l ${accent.gradient} opacity-[0.03] rounded-full blur-[200px] animate-blob animation-delay-4000"></div>
        <div class="absolute top-[30%] right-[20%] w-[30%] h-[30%] bg-white/[0.01] rounded-full blur-[150px]"></div>
      </div>

      <!-- Grid Overlay -->
      <div class="absolute inset-0 pointer-events-none opacity-[0.015]" style="background-image: linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px); background-size: 60px 60px;"></div>
      
      <!-- Main Content -->
      <div class="relative z-10 flex flex-col min-h-screen">
        
        <!-- Top Bar -->
        <div class="flex items-center justify-between px-10 py-6">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-br ${accent.gradient} flex items-center justify-center shadow-lg ${accent.glow}">
              <i class="fas fa-trophy text-white text-lg"></i>
            </div>
            <div>
              <span class="text-white/90 font-black text-xl tracking-tight">PORU 2K25</span>
              <span class="text-white/30 text-sm font-medium ml-3">Result Announcement</span>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2 bg-red-500/15 border border-red-500/30 rounded-xl px-4 py-2">
              <div class="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></div>
              <span class="text-red-400 text-sm font-bold uppercase tracking-widest">Live</span>
            </div>
            <div class="text-white/20 text-sm font-medium" id="tv-clock"></div>
          </div>
        </div>

        <!-- Result Content -->
        <div class="flex-grow flex items-center px-10 py-4">
          <div class="w-full max-w-7xl mx-auto">
            <div class="grid grid-cols-1 ${recentHtml ? 'lg:grid-cols-12' : ''} gap-8">
              
              <!-- Main Result -->
              <div class="${recentHtml ? 'lg:col-span-9' : ''}">
                <!-- Program Header -->
                <div class="mb-8">
                  <div class="flex items-center gap-4 mb-4">
                    <span class="px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-[0.2em] ${accent.bg} ${accent.border} border ${accent.text}">
                      ${sanitize(latest.category)}
                    </span>
                    <span class="px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-widest bg-white/5 border border-white/10 text-white/40">
                      ${latest.stageType === 'non-stage' ? 'Non-Stage' : 'Stage'}
                    </span>
                    <span class="text-white/20 text-sm font-medium ml-auto">${formatDateTime(latest.timestamp)}</span>
                  </div>
                  <h1 class="text-6xl lg:text-7xl font-black text-white tracking-tighter leading-[0.9] mb-2">
                    ${sanitize(latest.programName)}
                  </h1>
                  <div class="h-1.5 w-32 rounded-full bg-gradient-to-r ${accent.gradient} mt-6 shadow-lg ${accent.glow}"></div>
                </div>

                <!-- Participants -->
                <div class="space-y-4">
                  ${participantsHtml}
                </div>
              </div>

              <!-- Recent Results Sidebar -->
              ${recentHtml ? `
              <div class="lg:col-span-3">
                <div class="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-6 sticky top-8">
                  <h4 class="text-xs font-bold text-white/30 uppercase tracking-[0.2em] mb-4">Recent Results</h4>
                  ${recentHtml}
                </div>
              </div>` : ''}

            </div>
          </div>
        </div>

        <!-- Bottom Team Scores Ticker -->
        <div class="border-t border-white/[0.06] bg-black/30 backdrop-blur-sm">
          <div class="flex items-center h-16 overflow-hidden">
            <div class="flex-shrink-0 px-6 py-2 bg-gradient-to-r ${accent.gradient} mr-4">
              <span class="text-white text-xs font-black uppercase tracking-[0.15em]">Team Scores</span>
            </div>
            <div class="tv-ticker flex items-center gap-0 overflow-hidden">
              <div class="tv-ticker-track flex items-center animate-ticker">
                ${tickerHtml}
                <div class="w-16 flex-shrink-0"></div>
                ${tickerHtml}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

/**
 * TEAM DETAIL PAGE (Team Session)
 */
async function renderTeamDetailPage(teamId) {
  const team = appData.teams ? appData.teams[teamId] : null;
  if (!team) return renderNotFoundPage();

  const { teamsArray, studentsArray } = getStoredScores();
  
  // Overall Rank & Total Points
  const teamRankIndex = teamsArray.findIndex(t => t.id === teamId);
  const teamRank = teamRankIndex !== -1 ? teamRankIndex + 1 : '—';
  const teamScoreObj = teamsArray.find(t => t.id === teamId) || { totalPoints: 0, categoryPoints: {} };
  const totalPoints = teamScoreObj.totalPoints || 0;

  // Filter students in this team
  const teamStudents = studentsArray.filter(s => s.teamId === teamId);
  teamStudents.sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));

  // Team Leaders: First 3 students (highest points / chest numbers in team)
  const teamLeaders = teamStudents.slice(0, 3);

  // Calculate Category Breakdowns & Category Topper within this Team
  const categoryBreakdownHtml = CATEGORIES.map(cat => {
    const pts = teamScoreObj.categoryPoints?.[cat] || 0;
    const catStudents = teamStudents.filter(s => s.category === cat);
    const catTopper = catStudents.length > 0 ? catStudents[0] : null;

    return `
      <div class="bg-gradient-to-br from-white/70 to-white/20 backdrop-blur-xl border border-white/60 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all">
        <div class="flex justify-between items-center mb-3">
          ${glassCategoryBadge(cat)}
          <span class="text-2xl font-black text-gray-900 tracking-tight">${pts} Pts</span>
        </div>
        <div class="pt-3 border-t border-black/5 flex items-center justify-between text-xs">
          <span class="text-gray-500 font-medium">Category Topper:</span>
          ${catTopper ? `
            <a href="#/student/${catTopper.id}" class="font-bold text-gray-900 hover:text-orange-600 transition-colors">
              ${sanitize(catTopper.name)} (${catTopper.totalPoints} pts)
            </a>` : `<span class="text-gray-400 font-medium">—</span>`}
        </div>
      </div>`;
  }).join('');

  // Team Leaders Cards HTML
  const leaderBadges = [
    { title: '👑 Team Leader #1', color: 'from-amber-500/20 via-white/50 to-amber-500/10 border-amber-500/30 text-amber-700', icon: 'fa-crown text-amber-500' },
    { title: '🥈 Team Leader #2', color: 'from-slate-500/20 via-white/50 to-slate-500/10 border-slate-400/30 text-slate-700', icon: 'fa-medal text-slate-400' },
    { title: '🥉 Team Leader #3', color: 'from-orange-600/20 via-white/50 to-orange-600/10 border-orange-600/30 text-orange-800', icon: 'fa-medal text-orange-600' }
  ];

  const teamLeadersHtml = teamLeaders.length === 0 ? `
    <div class="col-span-full py-8 text-center text-gray-500 font-medium">No students registered in this team yet.</div>`
    : teamLeaders.map((s, i) => {
        const badge = leaderBadges[i] || leaderBadges[2];
        return `
          <div class="bg-gradient-to-br ${badge.color} backdrop-blur-xl border border-white/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
            <div class="flex items-center justify-between mb-4">
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider bg-white/80 backdrop-blur-md shadow-xs text-gray-900 border border-white/60">
                <i class="fas ${badge.icon}"></i> ${badge.title}
              </span>
              <span class="text-xs font-bold text-gray-500">Chest #${sanitize(s.chestNo || 'N/A')}</span>
            </div>
            
            <a href="#/student/${s.id}" class="block group-hover:translate-x-1 transition-transform">
              <h4 class="text-xl font-black text-gray-900 tracking-tight group-hover:text-orange-600 transition-colors">${sanitize(s.name)}</h4>
              <p class="text-xs text-gray-500 font-medium mt-1">Class ${sanitize(s.className || 'N/A')} • ${glassCategoryBadge(s.category)}</p>
            </a>

            <div class="mt-4 pt-3 border-t border-black/5 flex justify-between items-center">
              <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Individual Score</span>
              <span class="text-2xl font-black text-gray-900">${s.totalPoints || 0}</span>
            </div>
          </div>`;
      }).join('');

  // All Students Table HTML
  const studentsTableHtml = teamStudents.length === 0 ? `
    <tr><td colspan="4" class="py-12 text-center text-gray-500">No students registered in this team.</td></tr>`
    : teamStudents.map((s, i) => `
        <tr class="border-b border-black/5 hover:bg-white/50 transition-colors group">
          <td class="px-6 py-4 w-16">
            <div class="w-8 h-8 rounded-xl ${i < 3 ? 'bg-orange-500/10 text-orange-600 font-bold border border-orange-500/20' : 'text-gray-500 font-medium'} flex items-center justify-center text-sm">
              ${i + 1}
            </div>
          </td>
          <td class="px-6 py-4">
            <a href="#/student/${s.id}" class="block group-hover:translate-x-1 transition-transform">
              <p class="font-bold text-gray-900 text-sm group-hover:text-orange-600 transition-colors">${sanitize(s.name)}</p>
              <p class="text-[11px] text-gray-500">Chest #${sanitize(s.chestNo || 'N/A')} • Class ${sanitize(s.className || 'N/A')}</p>
            </a>
          </td>
          <td class="px-6 py-4">${glassCategoryBadge(s.category)}</td>
          <td class="px-6 py-4 text-right font-black text-lg text-gray-900">${s.totalPoints || 0}</td>
        </tr>`).join('');

  return `
    <div class="animate-fade-in max-w-6xl mx-auto pb-12 space-y-10 mt-6">
      
      <!-- Back Link & Team Banner -->
      <div>
        <a href="#/leaderboard" class="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-900 mb-4 transition-colors">
          <i class="fas fa-arrow-left"></i> Back to Leaderboard
        </a>

        <div class="bg-gradient-to-br from-white/80 via-white/50 to-white/20 backdrop-blur-3xl border border-white/80 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden">
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
            <div>
              <div class="flex items-center gap-3 mb-2">
                <span class="px-3 py-1 rounded-xl text-xs font-black uppercase tracking-widest bg-orange-500/10 text-orange-600 border border-orange-500/20">
                  <i class="fas fa-flag mr-1"></i> Team Session
                </span>
                <span class="px-3 py-1 rounded-xl text-xs font-bold bg-white/60 text-gray-700 border border-white/60 shadow-xs">
                  Overall Rank #${teamRank}
                </span>
              </div>
              <h1 class="text-4xl lg:text-5xl font-black text-gray-900 tracking-tighter">${sanitize(team.name)}</h1>
              <p class="text-sm text-gray-600 font-medium mt-1">${teamStudents.length} registered students in team</p>
            </div>

            <div class="bg-white/80 backdrop-blur-md rounded-2xl border border-white/80 p-6 text-center shadow-md flex-shrink-0 min-w-[200px]">
              <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Team Points</span>
              <div class="text-5xl font-black text-gray-900 tracking-tight mt-1">${totalPoints}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Team Leaders Section -->
      <div>
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <i class="fas fa-crown text-yellow-500"></i> Team Leaders (First 3 Chest Nos)
          </h2>
          <span class="text-xs text-gray-500 font-medium">Top 3 scoring students leading the team</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          ${teamLeadersHtml}
        </div>
      </div>

      <!-- Category Breakdown Grid -->
      <div>
        <h2 class="text-xl font-bold text-gray-900 tracking-tight mb-5 flex items-center gap-2">
          <i class="fas fa-chart-pie text-orange-500"></i> Category Points Breakdown
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          ${categoryBreakdownHtml}
        </div>
      </div>

      <!-- Complete Team Members Roster -->
      <div>
        <h2 class="text-xl font-bold text-gray-900 tracking-tight mb-5 flex items-center gap-2">
          <i class="fas fa-users text-blue-500"></i> Team Members Roster (${teamStudents.length})
        </h2>
        <div class="bg-white/60 backdrop-blur-xl border border-white/60 rounded-3xl overflow-hidden shadow-lg shadow-black/5">
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead class="bg-black/5 border-b border-black/5">
                <tr>
                  <th class="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Rank</th>
                  <th class="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Student</th>
                  <th class="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Category</th>
                  <th class="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Points</th>
                </tr>
              </thead>
              <tbody>
                ${studentsTableHtml}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>`;
}
