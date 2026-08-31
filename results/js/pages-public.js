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
  const { teamsArray, studentsArray, classesArray } = getPublishedScores();

  const programCount = Object.keys(appData.programs || {}).length;
  const resultCount = getDataAsArray("results").filter(r => r.status === "published").length;
  const progressPct = programCount ? Math.round((resultCount / programCount) * 100) : 0;

  // Render Top Teams
  const teamsHtml = teamsArray.length === 0 
    ? `<div class="col-span-full py-12 text-center text-gray-500 font-medium">No scores published yet</div>`
    : teamsArray.map((t, i) => {
        const isFirst = i === 0;
        const medalCls = ['text-yellow-500', 'text-gray-400', 'text-amber-600'][i] || 'text-gray-300';
        return `
          <a href="#/team/${t.id}" class="team-card-clickable block bg-gradient-to-br from-white/60 to-white/10 backdrop-blur-3xl backdrop-saturate-200 border-[0.5px] border-white/60 rounded-[2rem] p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.05),inset_0_1px_1px_rgba(255,255,255,0.8)] hover:shadow-[0_16px_48px_0_rgba(249,115,22,0.18)] hover:-translate-y-1.5 hover:border-orange-400/50 transition-all duration-300 relative overflow-hidden group cursor-pointer" data-team-id="${t.id}">
            ${isFirst ? '<div class="absolute -top-10 -right-10 w-32 h-32 bg-orange-400/20 rounded-full blur-2xl -z-0"></div>' : ''}
            <div class="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            <div class="flex justify-between items-start mb-4 relative z-10">
              <div>
                <span class="inline-block text-[10px] font-black uppercase tracking-widest text-orange-600 bg-orange-500/10 px-2.5 py-0.5 rounded-md border border-orange-500/20">Rank #${i+1}</span>
                <h3 class="text-xl font-black text-gray-900 tracking-tight mt-1.5 group-hover:text-orange-600 transition-colors">${sanitize(t.name)}</h3>
              </div>
              <div class="w-10 h-10 rounded-2xl bg-white/70 border border-white/60 shadow-sm flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <i class="fas fa-medal text-xl ${medalCls}"></i>
              </div>
            </div>
            <div class="relative z-10 flex items-baseline justify-between pt-2 border-t border-black/5">
              <div>
                <p class="text-4xl font-black text-gray-900 tracking-tighter">${t.totalPoints}</p>
                <p class="text-[10px] font-bold uppercase tracking-wider text-gray-500 mt-0.5">Total Points</p>
              </div>
              <span class="text-xs font-bold text-orange-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Team Roster <i class="fas fa-arrow-right text-[10px]"></i>
              </span>
            </div>
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

  // Render Top Students
  const topStudentsHtml = studentsArray.length === 0 
    ? `<tr><td colspan="4" class="py-12 text-center text-gray-500 font-medium">No students ranked yet</td></tr>`
    : studentsArray.slice(0, 5).map((s, i) => `
        <tr class="border-b border-black/5 hover:bg-white/40 transition-colors group">
          <td class="px-6 py-4">
            <div class="w-8 h-8 rounded-xl ${i<3 ? 'bg-orange-500/10 text-orange-600 font-bold border border-orange-500/20' : 'text-gray-500 font-medium'} flex items-center justify-center text-sm">
              ${i+1}
            </div>
          </td>
          <td class="px-6 py-4">
            <a href="#/student/${s.id}" class="block group-hover:translate-x-1 transition-transform duration-200">
              <p class="text-gray-900 font-bold text-sm">${sanitize(s.name)}</p>
              <p class="text-[11px] text-gray-500 mt-0.5">${sanitize(appData.teams[s.teamId]?.name || 'N/A')} • Class ${sanitize(s.className || 'N/A')}</p>
            </a>
          </td>
          <td class="px-6 py-4">${glassCategoryBadge(s.category)}</td>
          <td class="px-6 py-4 text-right font-black text-lg text-gray-900 tracking-tight">${s.totalPoints || 0}</td>
        </tr>
      `).join('');

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
        <div class="relative z-10">
          <div class="mb-4">${glassCategoryBadge(cat)}</div>
          <a href="#/student/${s.id}" class="block">
            <h3 class="text-2xl font-black text-gray-900 group-hover:text-orange-600 transition-colors tracking-tight leading-tight">${sanitize(s.name)}</h3>
          </a>
          <p class="text-sm text-gray-600 font-medium mt-1">${sanitize(appData.teams[s.teamId]?.name || 'N/A')} • Class ${sanitize(s.className || 'N/A')}</p>
        </div>
        <div class="mt-6 pt-4 border-t border-black/5 flex justify-between items-end relative z-10">
          <span class="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Total Points</span>
          <span class="text-3xl font-black text-gray-900 leading-none">${s.totalPoints}</span>
        </div>
      </div>
    `;
  }).join('');

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

      <!-- Teams Section -->
      <div>
        <h2 class="text-xl font-bold text-gray-900 tracking-tight mb-5 flex items-center gap-2">
          <i class="fas fa-crown text-yellow-500"></i> Team Standings
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          ${teamsHtml}
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <!-- Top Classes Section -->
        <div class="lg:col-span-5">
          <h2 class="text-xl font-bold text-gray-900 tracking-tight mb-5 flex items-center gap-2">
            <i class="fas fa-chalkboard-teacher text-orange-500"></i> Top Classes
          </h2>
          <div class="space-y-3">
            ${classesHtml}
          </div>
          <a href="#/leaderboard" class="mt-4 block text-center w-full py-3 rounded-2xl bg-white/60 backdrop-blur-md border border-white/60 shadow-sm hover:bg-white/80 text-sm font-bold text-gray-700 transition-all">
            View Full Leaderboard
          </a>
        </div>

        <!-- Top Students Section -->
        <div class="lg:col-span-7">
          <h2 class="text-xl font-bold text-gray-900 tracking-tight mb-5 flex items-center gap-2">
            <i class="fas fa-star text-orange-400"></i> Individual Leaders
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
                <tbody>${topStudentsHtml}</tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      <!-- Category Toppers Section -->
      <div class="pt-8">
        <h2 class="text-xl font-bold text-gray-900 tracking-tight mb-5 flex items-center gap-2 relative z-10">
          <i class="fas fa-medal text-purple-500"></i> Category Toppers
        </h2>
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
  const { teamsArray, studentsArray, classesArray } = getPublishedScores();

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
              <a href="#/team/${t.id}" class="team-card-clickable block bg-white/40 hover:bg-white/70 p-4 rounded-2xl border border-white/60 hover:border-orange-300 hover:shadow-md transition-all group" data-team-id="${t.id}">
                <div class="flex justify-between items-end mb-3">
                  <div class="flex items-center gap-2">
                    <h3 class="font-bold text-base text-gray-900 group-hover:text-orange-600 transition-colors">${sanitize(t.name)}</h3>
                    <span class="text-xs text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity"><i class="fas fa-arrow-right text-[10px]"></i></span>
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

  const teamName = appData.teams[student.teamId]?.name || 'Unknown';
  
  const partMap = {};

  // 1. Add from Registrations
  Object.entries(appData.participantRegistrations || {}).forEach(([progId, teamsObj]) => {
    const teamRegs = teamsObj[student.teamId] || [];
    if (teamRegs.includes(studentId)) {
      const p = appData.programs[progId];
      if (p) {
        partMap[progId] = {
          programId: progId,
          programName: p.name,
          category: p.category,
          status: 'registered',
          timestamp: 0,
          position: 'none',
          grade: 'none'
        };
      }
    }
  });

  // 2. Update/Overwrite from Results
  Object.values(appData.results || {}).forEach(r => {
    const pt = (r.participants || []).find(p => p.studentId === studentId);
    if (pt) {
      partMap[r.programId] = {
        programId: r.programId,
        programName: r.programName,
        category: r.category,
        position: pt.position || 'none',
        grade: pt.grade || 'none',
        status: r.status,
        timestamp: r.timestamp || 0
      };
    } else {
      if (partMap[r.programId] && r.status === 'published') {
         partMap[r.programId].status = 'published_no_prize';
         partMap[r.programId].timestamp = r.timestamp || 0;
      }
    }
  });

  const allParts = Object.values(partMap);
  allParts.sort((a,b) => b.timestamp - a.timestamp);

  // Split into Achievements and Participating
  const achievements = [];
  const participating = [];

  allParts.forEach(p => {
    if (p.status === 'published' && (p.position !== 'none' || p.grade !== 'none')) {
      achievements.push(p);
    } else {
      participating.push(p);
    }
  });

  // Renderer Helper
  const renderItem = (p) => {
    let prizeStr = '';
    if (p.status === 'published') {
      if (p.position && p.position !== 'none') prizeStr += `<span class="px-3 py-1.5 bg-yellow-500/10 text-yellow-700 border border-yellow-500/20 rounded-xl font-bold text-[10px] uppercase tracking-wider mr-2 backdrop-blur-md"><i class="fas fa-trophy mr-1.5"></i>${POSITION_LABELS[p.position]}</span>`;
      if (p.grade && p.grade !== 'none') prizeStr += `<span class="px-3 py-1.5 bg-blue-500/10 text-blue-700 border border-blue-500/20 rounded-xl font-bold text-[10px] uppercase tracking-wider mr-2 backdrop-blur-md"><i class="fas fa-medal mr-1.5"></i>${GRADE_LABELS[p.grade]}</span>`;
      if (!prizeStr) {
         prizeStr = `<span class="px-3 py-1.5 bg-white/60 text-gray-600 border border-white/60 rounded-xl font-bold text-[10px] uppercase tracking-wider shadow-sm">Participated</span>`;
      }
    } else if (p.status === 'published_no_prize') {
      prizeStr = `<span class="px-3 py-1.5 bg-white/60 text-gray-600 border border-white/60 rounded-xl font-bold text-[10px] uppercase tracking-wider shadow-sm">Participated</span>`;
    } else {
      prizeStr = `<span class="px-3 py-1.5 bg-black/5 text-gray-600 border border-black/5 rounded-xl font-bold text-[10px] uppercase tracking-wider"><i class="fas fa-clock mr-1.5"></i>Upcoming</span>`;
    }
    
    return `
      <div class="bg-white/60 backdrop-blur-md border border-white/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group">
        <div>
          <p class="font-bold text-gray-900 text-base group-hover:text-orange-600 transition-colors">${sanitize(p.programName)}</p>
          <p class="text-[11px] text-gray-500 mt-1 font-bold tracking-widest uppercase">${sanitize(p.category)}</p>
        </div>
        <div class="text-right flex items-center flex-shrink-0">
          ${prizeStr}
        </div>
      </div>`;
  };

  const achHtml = achievements.length === 0 
    ? `<div class="py-10 text-center border border-dashed border-black/10 rounded-3xl text-gray-500 font-medium bg-white/30 backdrop-blur-sm">No recorded achievements yet.</div>`
    : achievements.map(renderItem).join('');

  const partHtml = participating.length === 0 
    ? `<div class="py-10 text-center border border-dashed border-black/10 rounded-3xl text-gray-500 font-medium bg-white/30 backdrop-blur-sm">No registered programs found.</div>`
    : participating.map(renderItem).join('');

  return `
    <div class="animate-fade-in max-w-4xl mx-auto py-12 space-y-10">
      
      <!-- Profile Header -->
      <div class="bg-white/60 backdrop-blur-2xl border border-white/60 shadow-lg shadow-black/5 rounded-[2.5rem] p-10 flex flex-col md:flex-row gap-10 items-center md:items-start text-center md:text-left relative overflow-hidden">
        
        <div class="absolute -top-20 -right-20 w-64 h-64 bg-orange-400/10 rounded-full blur-3xl -z-0"></div>
        
        <div class="w-36 h-36 rounded-full bg-white/80 border-4 border-white/80 flex items-center justify-center flex-shrink-0 shadow-lg relative z-10">
          <span class="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-bold shadow-md"><i class="fas fa-check"></i></span>
          <i class="fas fa-user text-6xl text-gray-300"></i>
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

      <!-- Achievements -->
      <div>
        <h2 class="text-2xl font-bold text-gray-900 tracking-tighter mb-5 flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-yellow-500/10 text-yellow-600 flex items-center justify-center border border-yellow-500/20"><i class="fas fa-trophy"></i></div>
          Achievements
        </h2>
        <div class="space-y-4">
          ${achHtml}
        </div>
      </div>

      <!-- Participating Programs -->
      <div>
        <h2 class="text-2xl font-bold text-gray-900 tracking-tighter mb-5 flex items-center gap-3 mt-10">
          <div class="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center border border-blue-500/20"><i class="fas fa-list-check"></i></div>
          Participating Programs
        </h2>
        <div class="space-y-4">
          ${partHtml}
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
 * TEAM PROFILE & SUMMARY PAGE
 */
async function renderTeamPage(teamId) {
  const { teamsArray, studentsArray } = getPublishedScores();
  const team = appData.teams[teamId];

  if (!team) {
    return `
      <div class="py-20 text-center text-gray-500 font-medium bg-white/60 backdrop-blur-xl rounded-3xl border border-white/60 max-w-2xl mx-auto mt-12 shadow-lg">
        <div class="w-16 h-16 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center mx-auto mb-4 text-2xl border border-orange-500/20">
          <i class="fas fa-users"></i>
        </div>
        <h2 class="text-2xl font-black text-gray-900 mb-2">Team Not Found</h2>
        <p class="text-sm text-gray-500 mb-6 font-medium">The team you are looking for does not exist or festival data is loading.</p>
        <a href="#/" class="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-bold rounded-2xl text-sm hover:bg-black transition-colors shadow-md">
          <i class="fas fa-arrow-left"></i> Return to Dashboard
        </a>
      </div>`;
  }

  const teamRank = teamsArray.findIndex(t => t.id === teamId) + 1;
  const tData = teamsArray.find(t => t.id === teamId) || { totalPoints: 0, categoryPoints: {} };
  const teamPenalties = calculateTeamPenalties()[teamId] || 0;
  const penaltiesList = Object.values(appData.teamPenalties || {}).filter(p => p.teamId === teamId);

  // All students of this team
  const rawStudents = getDataAsArray("students").filter(s => s.teamId === teamId);

  // Calculate live published points per student
  const studentPointsMap = {};
  studentsArray.forEach(s => { studentPointsMap[s.id] = s.totalPoints || 0; });

  const teamStudents = rawStudents.map(s => ({
    ...s,
    totalPoints: studentPointsMap[s.id] || 0
  }));

  // Sort students strictly by chest number ascending (e.g. 101, 102, 103...)
  // Per specifications: Team leaders are the first chest numbers
  teamStudents.sort((a, b) => {
    const numA = parseInt(a.chestNo, 10);
    const numB = parseInt(b.chestNo, 10);
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
    return (String(a.chestNo || '')).localeCompare(String(b.chestNo || ''), undefined, { numeric: true }) || (a.name || '').localeCompare(b.name || '');
  });

  // Identify Team Leader(s): First chest number or explicit isLeader flag
  const firstChestNo = teamStudents.length > 0 ? teamStudents[0].chestNo : null;
  teamStudents.forEach(s => {
    s.isTeamLeader = (s.chestNo === firstChestNo || s.isLeader === true || s.role === 'leader');
  });
  const leader = teamStudents.find(s => s.isTeamLeader) || teamStudents[0] || null;

  // Published Results & Achievements for this team
  const teamAchievements = [];
  const publishedResults = getDataAsArray("results").filter(r => r.status === "published");
  
  let firstCount = 0;
  let secondCount = 0;
  let thirdCount = 0;
  let aGradeCount = 0;
  let bGradeCount = 0;
  let totalPodiums = 0;

  publishedResults.forEach(r => {
    (r.participants || []).forEach(p => {
      const s = appData.students[p.studentId];
      if (s && s.teamId === teamId) {
        if (p.position === 'first') firstCount++;
        if (p.position === 'second') secondCount++;
        if (p.position === 'third') thirdCount++;
        if (p.position && p.position !== 'none') totalPodiums++;
        if (p.grade === 'a_grade') aGradeCount++;
        if (p.grade === 'b_grade') bGradeCount++;

        teamAchievements.push({
          resultId: r.id,
          programId: r.programId,
          programName: r.programName,
          category: r.category,
          stageType: r.stageType || 'stage',
          programType: r.programType || 'single',
          studentId: p.studentId,
          studentName: p.name || s.name,
          chestNo: s.chestNo,
          className: s.className,
          position: p.position || 'none',
          grade: p.grade || 'none',
          timestamp: r.timestamp || 0
        });
      }
    });
  });

  teamAchievements.sort((a, b) => b.timestamp - a.timestamp);

  const directScores = appData.teamDirectScores[teamId] || {};
  let totalDirectPoints = 0;
  CATEGORIES.forEach(cat => { totalDirectPoints += (directScores[cat] || 0); });
  const totalStudentPoints = teamStudents.reduce((acc, s) => acc + (s.totalPoints || 0), 0);

  // Rank badge decoration
  const medalIcons = ['fa-medal text-yellow-500', 'fa-medal text-gray-400', 'fa-medal text-amber-600'];
  const rankMedal = teamRank <= 3 ? medalIcons[teamRank - 1] : 'fa-trophy text-orange-500';

  // Quick Team Switcher Pills
  const teamSwitcherHtml = teamsArray.map((t, idx) => {
    const isCurrent = t.id === teamId;
    return `
      <a href="#/team/${t.id}" class="flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap border ${
        isCurrent
          ? 'bg-gray-900 text-white border-gray-900 shadow-md shadow-black/10 scale-105'
          : 'bg-white/60 text-gray-700 border-white/60 hover:bg-white hover:text-orange-600'
      }">
        <span class="w-2 h-2 rounded-full ${isCurrent ? 'bg-orange-400' : 'bg-gray-400'}"></span>
        <span>${sanitize(t.name)}</span>
        <span class="px-2 py-0.5 rounded-lg text-[10px] ${isCurrent ? 'bg-white/20 text-white' : 'bg-black/5 text-gray-600'} font-black">${t.totalPoints} pts</span>
      </a>`;
  }).join('');

  // Category Breakdown Progress Cards
  const maxCatPoints = Math.max(...CATEGORIES.map(cat => tData.categoryPoints?.[cat] || 0), 1);
  const categoryCardsHtml = CATEGORIES.map(cat => {
    const pts = tData.categoryPoints?.[cat] || 0;
    const catStudentsCount = teamStudents.filter(s => s.category === cat).length;
    const pct = Math.round((pts / maxCatPoints) * 100);
    const catColor = CATEGORY_COLORS[cat] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', dot: 'bg-gray-500' };

    return `
      <div class="bg-white/60 backdrop-blur-xl border border-white/60 rounded-2xl p-4 shadow-sm hover:bg-white/80 transition-all flex flex-col justify-between">
        <div>
          <div class="flex justify-between items-center mb-2">
            ${glassCategoryBadge(cat)}
            <span class="text-xs font-bold text-gray-500">${catStudentsCount} students</span>
          </div>
          <p class="text-2xl font-black text-gray-900 mt-1">${pts} <span class="text-xs font-bold text-gray-400 font-normal">pts</span></p>
        </div>
        <div class="mt-4">
          <div class="h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all duration-700" style="width: ${pct}%"></div>
          </div>
        </div>
      </div>`;
  }).join('');

  // Student Roster List Items
  const studentRowsHtml = teamStudents.map((s, index) => {
    const avatarUrl = `https://raw.githubusercontent.com/Nazimcp-git/azinco/refs/heads/main/images/${encodeURIComponent(s.chestNo)}.jpg`;
    const initials = sanitize((s.name || 'ST').slice(0, 2).toUpperCase());

    return `
      <div class="team-student-item bg-white/60 hover:bg-white/90 backdrop-blur-xl border ${s.isTeamLeader ? 'border-amber-400/80 bg-amber-50/40 shadow-amber-500/10' : 'border-white/60'} rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
           data-category="${sanitize(s.category || '')}"
           data-name="${sanitize(s.name || '')}"
           data-chest="${sanitize(s.chestNo || '')}"
           data-class="${sanitize(s.className || '')}">
        
        <div class="flex items-center gap-4 min-w-0">
          <!-- Student Avatar -->
          <div class="w-12 h-12 rounded-2xl overflow-hidden bg-white border border-black/5 flex-shrink-0 shadow-sm relative group-hover:scale-105 transition-transform">
            <img src="${avatarUrl}" alt="${sanitize(s.name)}" loading="lazy"
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                 class="w-full h-full object-cover" />
            <div class="w-full h-full hidden items-center justify-center font-black text-xs text-orange-600 bg-orange-100">
              ${initials}
            </div>
            ${s.isTeamLeader ? `
              <div class="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[9px] shadow-sm">
                <i class="fas fa-crown"></i>
              </div>` : ''}
          </div>

          <!-- Student Information -->
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2 mb-0.5">
              <span class="px-2 py-0.5 rounded-lg bg-black/5 text-gray-800 font-mono font-black text-xs">
                #${sanitize(s.chestNo)}
              </span>
              ${s.isTeamLeader ? `
                <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                  <i class="fas fa-crown text-[9px]"></i> Team Leader
                </span>` : ''}
              ${glassCategoryBadge(s.category)}
            </div>
            <a href="#/student/${s.id}" class="block">
              <h4 class="font-bold text-gray-900 text-base group-hover:text-orange-600 transition-colors truncate">
                ${sanitize(s.name)}
              </h4>
            </a>
            <p class="text-[11px] text-gray-500 mt-0.5 font-medium">
              Class: <span class="font-bold text-gray-700">${sanitize(s.className || 'N/A')}</span>
            </p>
          </div>
        </div>

        <!-- Student Points & Action -->
        <div class="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-black/5">
          <div class="text-left sm:text-right">
            <span class="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Points</span>
            <span class="text-xl font-black text-gray-900">${s.totalPoints || 0}</span>
          </div>
          <a href="#/student/${s.id}" class="w-9 h-9 rounded-xl bg-white/80 border border-white/60 hover:bg-orange-500 hover:text-white flex items-center justify-center text-gray-500 text-xs shadow-sm transition-all flex-shrink-0" title="View Student Profile">
            <i class="fas fa-arrow-right"></i>
          </a>
        </div>

      </div>`;
  }).join('');

  // Results & Achievements List Items
  const resultsRowsHtml = teamAchievements.length === 0
    ? `<div class="py-12 text-center text-gray-500 font-medium bg-white/30 backdrop-blur-md rounded-2xl border border-dashed border-black/10">No competition results published for this team yet.</div>`
    : teamAchievements.map(r => {
        let prizeBadges = [];
        if (r.position && r.position !== 'none') {
          prizeBadges.push(`<span class="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-700 border border-amber-500/20 font-bold text-xs"><i class="fas fa-trophy mr-1 text-amber-600"></i>${POSITION_LABELS[r.position] || r.position}</span>`);
        }
        if (r.grade && r.grade !== 'none') {
          prizeBadges.push(`<span class="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-700 border border-blue-500/20 font-bold text-xs"><i class="fas fa-medal mr-1 text-blue-600"></i>${GRADE_LABELS[r.grade] || r.grade}</span>`);
        }

        return `
          <div class="bg-white/60 backdrop-blur-xl border border-white/60 rounded-2xl p-5 shadow-sm hover:bg-white/80 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group">
            <div>
              <div class="flex items-center gap-2 mb-1.5">
                ${glassCategoryBadge(r.category)}
                <span class="text-[9px] uppercase tracking-widest font-bold text-gray-500 bg-black/5 px-2 py-0.5 rounded-md">${r.stageType === 'non-stage' ? 'Non-Stage' : 'Stage'}</span>
              </div>
              <h4 class="font-black text-gray-900 text-base group-hover:text-orange-600 transition-colors">
                ${sanitize(r.programName)}
              </h4>
              <div class="flex items-center gap-2 mt-1 text-xs text-gray-600">
                <span>By</span>
                <a href="#/student/${r.studentId}" class="font-bold text-gray-800 hover:text-orange-600 hover:underline">
                  ${sanitize(r.studentName)} (#${sanitize(r.chestNo)})
                </a>
                <span>• Class ${sanitize(r.className || 'N/A')}</span>
              </div>
            </div>
            <div class="flex flex-wrap items-center gap-2 sm:self-center">
              ${prizeBadges.join('')}
            </div>
          </div>`;
      }).join('');

  return `
    <div class="space-y-8 pb-16 animate-fade-in max-w-6xl mx-auto mt-6">
      
      <!-- Top Navigation & Quick Switcher -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div class="flex items-center gap-2">
          <a href="#/" class="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/60 hover:bg-white border border-white/60 text-xs font-bold text-gray-700 hover:text-orange-600 shadow-sm transition-all">
            <i class="fas fa-arrow-left text-[10px]"></i> Dashboard
          </a>
          <span class="text-gray-400 font-bold">/</span>
          <span class="text-xs font-black text-gray-500 uppercase tracking-wider">Team Profile</span>
        </div>
        
        <div class="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1">
          ${teamSwitcherHtml}
        </div>
      </div>

      <!-- Hero Header Card -->
      <div class="bg-gradient-to-br from-white/80 via-white/40 to-white/10 backdrop-blur-3xl backdrop-saturate-200 border-[0.5px] border-white/70 rounded-[2.5rem] p-8 sm:p-10 shadow-[0_12px_40px_0_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,0.9)] relative overflow-hidden">
        <div class="absolute -top-24 -right-24 w-80 h-80 bg-orange-400/20 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-24 -left-24 w-80 h-80 bg-teal-400/15 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-orange-500/10 text-orange-600 border border-orange-500/20 text-xs font-black uppercase tracking-wider mb-3">
              <i class="fas ${rankMedal}"></i> Overall Rank #${teamRank} of ${teamsArray.length}
            </div>
            <h1 class="text-4xl sm:text-5xl font-black text-gray-900 tracking-tighter leading-none mb-2">
              ${sanitize(team.name)}
            </h1>
            <p class="text-sm text-gray-600 font-medium">Official Team Roster, Performance Breakdown & Summary</p>
          </div>

          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-6 self-stretch sm:self-auto">
            <!-- Points Display -->
            <div class="bg-white/60 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/80 shadow-sm text-center min-w-[140px]">
              <span class="text-[10px] font-bold uppercase tracking-widest text-gray-500">Total Points</span>
              <p class="text-4xl sm:text-5xl font-black text-gray-900 tracking-tighter leading-none mt-1 text-orange-600">
                ${tData.totalPoints}
              </p>
            </div>

            <!-- Action Buttons -->
            <div>
              <a href="#/leaderboard" class="px-6 py-3 rounded-2xl bg-gray-900 hover:bg-black text-white font-bold text-xs transition-colors shadow-md flex items-center justify-center gap-2">
                <i class="fas fa-chart-bar"></i> Full Leaderboard
              </a>
            </div>
          </div>
        </div>

        <!-- 5 Key Summary Stats -->
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-8 pt-8 border-t border-black/5 relative z-10">
          <div class="bg-white/50 backdrop-blur-md p-4 rounded-2xl border border-white/70 shadow-sm">
            <span class="text-[10px] font-bold uppercase tracking-widest text-gray-500">Total Students</span>
            <p class="text-2xl font-black text-gray-900 mt-1">${teamStudents.length}</p>
            <span class="text-[10px] text-gray-400 font-medium">Registered</span>
          </div>

          <div class="bg-white/50 backdrop-blur-md p-4 rounded-2xl border border-white/70 shadow-sm">
            <span class="text-[10px] font-bold uppercase tracking-widest text-gray-500">Podiums Won</span>
            <p class="text-2xl font-black text-gray-900 mt-1">${totalPodiums}</p>
            <span class="text-[10px] text-orange-600 font-bold">${firstCount} First • ${secondCount} Sec • ${thirdCount} 3rd</span>
          </div>

          <div class="bg-white/50 backdrop-blur-md p-4 rounded-2xl border border-white/70 shadow-sm">
            <span class="text-[10px] font-bold uppercase tracking-widest text-gray-500">Grades Won</span>
            <p class="text-2xl font-black text-gray-900 mt-1">${aGradeCount + bGradeCount}</p>
            <span class="text-[10px] text-blue-600 font-bold">${aGradeCount} 'A' • ${bGradeCount} 'B'</span>
          </div>

          <div class="bg-white/50 backdrop-blur-md p-4 rounded-2xl border border-white/70 shadow-sm">
            <span class="text-[10px] font-bold uppercase tracking-widest text-gray-500">Direct Points</span>
            <p class="text-2xl font-black text-gray-900 mt-1">${totalDirectPoints}</p>
            <span class="text-[10px] text-gray-400 font-medium">Group / Team Items</span>
          </div>

          <div class="bg-white/50 backdrop-blur-md p-4 rounded-2xl border border-white/70 shadow-sm col-span-2 sm:col-span-1">
            <span class="text-[10px] font-bold uppercase tracking-widest text-gray-500">Penalties</span>
            <p class="text-2xl font-black ${teamPenalties > 0 ? 'text-red-600' : 'text-gray-900'} mt-1">
              ${teamPenalties > 0 ? `-${teamPenalties}` : '0'}
            </p>
            <span class="text-[10px] ${teamPenalties > 0 ? 'text-red-500 font-bold' : 'text-gray-400 font-medium'}">
              ${teamPenalties > 0 ? 'Deducted Points' : 'Clean Record'}
            </span>
          </div>
        </div>

      </div>

      <!-- Team Leader Spotlight (Specification: First Chest Number) -->
      ${leader ? `
        <div class="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-yellow-500/15 backdrop-blur-2xl border border-amber-400/40 rounded-[2.5rem] p-6 sm:p-8 shadow-lg shadow-amber-500/5 relative overflow-hidden">
          <div class="absolute top-0 right-0 w-64 h-64 bg-amber-400/15 rounded-full blur-3xl -z-0"></div>
          
          <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10 text-center sm:text-left">
            <!-- Leader Avatar -->
            <div class="relative flex-shrink-0">
              <div class="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-2 border-amber-400 shadow-xl bg-white relative group">
                <img src="https://raw.githubusercontent.com/Nazimcp-git/azinco/refs/heads/main/images/${encodeURIComponent(leader.chestNo)}.jpg"
                     alt="${sanitize(leader.name)}" loading="lazy"
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                     class="w-full h-full object-cover" />
                <div class="w-full h-full hidden items-center justify-center bg-gradient-to-br from-amber-100 to-orange-100 text-amber-800 font-black text-2xl">
                  ${sanitize((leader.name || 'TL').slice(0, 2).toUpperCase())}
                </div>
              </div>
              <span class="absolute -bottom-2 -right-2 w-9 h-9 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-500 text-white flex items-center justify-center text-sm shadow-md border-2 border-white">
                <i class="fas fa-crown"></i>
              </span>
            </div>

            <!-- Leader Details -->
            <div class="flex-grow min-w-0">
              <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                <span class="px-3 py-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-[10px] font-black uppercase tracking-wider rounded-xl shadow-sm inline-flex items-center gap-1.5">
                  <i class="fas fa-crown"></i> TEAM LEADER
                </span>
                <span class="px-3 py-1 bg-white/80 text-gray-900 font-mono font-black text-xs rounded-xl border border-white/80 shadow-sm">
                  CHEST #${sanitize(leader.chestNo)}
                </span>
                ${glassCategoryBadge(leader.category)}
              </div>

              <a href="#/student/${leader.id}" class="group inline-block">
                <h3 class="text-2xl sm:text-3xl font-black text-gray-900 group-hover:text-orange-600 transition-colors tracking-tight">
                  ${sanitize(leader.name)}
                </h3>
              </a>

              <div class="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-2 text-xs text-gray-600 font-medium">
                <span>Class: <strong class="text-gray-900 font-bold">${sanitize(leader.className || 'N/A')}</strong></span>
                <span>•</span>
                <span>Individual Points: <strong class="text-orange-600 font-bold">${leader.totalPoints || 0} pts</strong></span>
              </div>
            </div>

            <!-- Profile CTA -->
            <div class="sm:self-center">
              <a href="#/student/${leader.id}" class="px-5 py-3 rounded-2xl bg-white hover:bg-gray-50 text-gray-900 font-bold text-xs shadow-sm border border-amber-300/60 hover:text-orange-600 transition-all inline-flex items-center gap-2">
                Leader Profile <i class="fas fa-arrow-right text-[10px]"></i>
              </a>
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Penalty Notification (If any) -->
      ${penaltiesList.length > 0 ? `
        <div class="bg-red-500/10 backdrop-blur-xl border border-red-500/20 rounded-3xl p-6 shadow-sm">
          <div class="flex items-start gap-4">
            <div class="w-10 h-10 rounded-2xl bg-red-500 text-white flex items-center justify-center flex-shrink-0 text-sm shadow-md">
              <i class="fas fa-exclamation-triangle"></i>
            </div>
            <div class="flex-grow">
              <h3 class="text-base font-bold text-red-900">Penalty Points Deducted: -${teamPenalties} pts</h3>
              <p class="text-xs text-red-700 mt-0.5">The following infractions were recorded for this team:</p>
              <div class="mt-3 space-y-2">
                ${penaltiesList.map(p => `
                  <div class="flex justify-between items-center py-1.5 px-3 rounded-xl bg-white/60 border border-red-200 text-xs">
                    <span class="font-medium text-gray-800">${sanitize(p.reason || 'Team infraction')}</span>
                    <span class="font-black text-red-600">-${p.points} pts</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Interactive View Tabs -->
      <div>
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div id="team-view-tabs" class="flex flex-wrap p-1.5 bg-white/40 backdrop-blur-md border border-white/60 rounded-2xl shadow-sm gap-1">
            <button data-view="students" class="team-view-tab-btn px-4 py-2 rounded-xl text-xs font-bold transition-all bg-white text-gray-900 shadow-sm border border-white/60">
              <i class="fas fa-user-graduate mr-1.5 text-orange-600"></i> Students Roster (${teamStudents.length})
            </button>
            <button data-view="results" class="team-view-tab-btn px-4 py-2 rounded-xl text-xs font-bold transition-all text-gray-600 hover:text-gray-900 hover:bg-white/40">
              <i class="fas fa-trophy mr-1.5 text-yellow-500"></i> Program Wins (${teamAchievements.length})
            </button>
            <button data-view="categories" class="team-view-tab-btn px-4 py-2 rounded-xl text-xs font-bold transition-all text-gray-600 hover:text-gray-900 hover:bg-white/40">
              <i class="fas fa-layer-group mr-1.5 text-purple-500"></i> Category Breakdown
            </button>
          </div>

          <!-- Counter badge -->
          <div class="text-xs font-bold text-gray-500 bg-white/50 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/60">
            Showing <span id="team-filtered-count" class="text-gray-900 font-black">${teamStudents.length}</span> students
          </div>
        </div>

        <!-- SECTION 1: STUDENTS ROSTER -->
        <div id="team-section-students" class="team-view-section space-y-6">
          <!-- Search & Filter Controls -->
          <div class="flex flex-col md:flex-row gap-3">
            <div class="relative flex-grow">
              <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
              <input type="text" id="team-student-search-input" placeholder="Search by student name, chest no, or class..."
                class="w-full pl-10 pr-4 py-3 bg-white/60 backdrop-blur-md border border-white/60 shadow-sm rounded-2xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium">
            </div>

            <!-- Category filter pill list -->
            <div class="overflow-x-auto hide-scrollbar pb-1">
              <div id="team-cat-filter-container" class="flex w-max bg-white/40 backdrop-blur-md border border-white/60 rounded-2xl p-1 shadow-sm gap-1">
                <button data-category="All" class="category-filter-btn flex-shrink-0 px-4 py-1.5 text-xs font-bold rounded-xl transition-all bg-orange-500 text-white shadow-sm">All</button>
                ${CATEGORIES.map(c => `
                  <button data-category="${c}" class="category-filter-btn flex-shrink-0 px-4 py-1.5 text-xs font-bold rounded-xl transition-all text-gray-600 hover:text-gray-900 hover:bg-white/50">${c}</button>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Students List (Leaders at the top, sorted strictly by chest number) -->
          <div id="team-students-list" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${studentRowsHtml}
          </div>

          <!-- Empty Search State -->
          <div id="team-students-empty" class="hidden py-16 text-center bg-white/30 backdrop-blur-md rounded-3xl border border-dashed border-black/10">
            <i class="fas fa-search text-3xl text-gray-400 mb-3 opacity-50"></i>
            <h4 class="text-base font-bold text-gray-800">No matching students found</h4>
            <p class="text-xs text-gray-500 mt-1">Try adjusting your search terms or category filter.</p>
          </div>
        </div>

        <!-- SECTION 2: PROGRAM RESULTS -->
        <div id="team-section-results" class="team-view-section space-y-4 hidden">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${resultsRowsHtml}
          </div>
        </div>

        <!-- SECTION 3: CATEGORY BREAKDOWN -->
        <div id="team-section-categories" class="team-view-section space-y-6 hidden">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            ${categoryCardsHtml}
          </div>
        </div>

      </div>

    </div>`;
}

/**
 * Event Listeners for the Team Profile page
 */
window.attachTeamPageListeners = function() {
  // Category filter
  const catContainer = document.getElementById('team-cat-filter-container');
  if (catContainer) {
    catContainer.addEventListener('click', e => {
      const btn = e.target.closest('.category-filter-btn');
      if (!btn) return;
      const cat = btn.dataset.category;
      catContainer.querySelectorAll('.category-filter-btn').forEach(b => {
        const active = b.dataset.category === cat;
        b.className = `category-filter-btn flex-shrink-0 px-4 py-1.5 text-xs font-bold rounded-xl transition-all ${
          active ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
        }`;
      });
      filterTeamStudents();
    });
  }

  // Live search input
  const searchInput = document.getElementById('team-student-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      filterTeamStudents();
    });
  }

  // View tab switcher
  const tabsContainer = document.getElementById('team-view-tabs');
  if (tabsContainer) {
    tabsContainer.addEventListener('click', e => {
      const btn = e.target.closest('.team-view-tab-btn');
      if (!btn) return;
      const targetView = btn.dataset.view;
      tabsContainer.querySelectorAll('.team-view-tab-btn').forEach(b => {
        const active = b.dataset.view === targetView;
        b.className = `team-view-tab-btn px-4 py-2 rounded-xl text-xs font-bold transition-all ${
          active ? 'bg-white text-gray-900 shadow-sm border border-white/60' : 'text-gray-600 hover:text-gray-900 hover:bg-white/40'
        }`;
      });
      document.querySelectorAll('.team-view-section').forEach(sec => {
        sec.classList.toggle('hidden', sec.id !== `team-section-${targetView}`);
      });
    });
  }
};

/**
 * Filter team students by category and search keyword
 */
window.filterTeamStudents = function() {
  const search = (document.getElementById('team-student-search-input')?.value || '').toLowerCase().trim();
  const activeBtn = document.querySelector('#team-cat-filter-container .bg-orange-500');
  const cat = activeBtn?.dataset.category || 'All';

  let visibleCount = 0;
  document.querySelectorAll('.team-student-item').forEach(el => {
    const sCat = el.dataset.category || '';
    const sName = (el.dataset.name || '').toLowerCase();
    const sChest = (el.dataset.chest || '').toLowerCase();
    const sClass = (el.dataset.class || '').toLowerCase();

    const matchesCat = (cat === 'All' || sCat === cat);
    const matchesSearch = (!search || sName.includes(search) || sChest.includes(search) || sClass.includes(search));

    const visible = matchesCat && matchesSearch;
    el.style.display = visible ? '' : 'none';
    if (visible) visibleCount++;
  });

  const countEl = document.getElementById('team-filtered-count');
  if (countEl) countEl.textContent = visibleCount;
  const noMatchesEl = document.getElementById('team-students-empty');
  if (noMatchesEl) noMatchesEl.classList.toggle('hidden', visibleCount > 0);
};
