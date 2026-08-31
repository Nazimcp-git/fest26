// js/print.js
// Print utilities for generating PDF-friendly A4 layouts.

/**
 * Print a single result by fetching the result details and rendering a print template.
 * @param {string} resultId 
 */
function printResult(resultId) {
  const result = appData.results[resultId];
  if (!result) return;
  
  const content = renderSinglePrintResult(result);
  executePrint(content);
}

/**
 * Print all results currently marked as 'ready'.
 */
function printReadyResults() {
  const readyResults = getDataAsArray("results").filter(r => r.status === "ready");
  
  if (readyResults.length === 0) {
    ToastEngine.warning('No results marked as "Ready to Publish"');
    return;
  }
  
  // Sort by category then name
  readyResults.sort((a, b) => {
    const ca = CATEGORIES.indexOf(a.category);
    const cb = CATEGORIES.indexOf(b.category);
    if (ca !== cb) return ca - cb;
    return a.programName.localeCompare(b.programName);
  });
  
  const content = readyResults.map(r => renderSinglePrintResult(r)).join('<div class="page-break"></div>');
  executePrint(content);
}

/**
 * Helper to render the HTML for a single print result.
 */
function renderSinglePrintResult(result) {
  const dateStr = formatDate(result.timestamp);
  const isStage = result.stageType !== 'non-stage' ? 'Stage' : 'Non-Stage';
  
  let rowsHtml = '';
  if (result.participants && result.participants.length > 0) {
    // Sort participants by position
    const posOrder = { 'first': 1, 'second': 2, 'third': 3, 'none': 4 };
    const sortedParticipants = [...result.participants].sort((a, b) => {
      const pA = posOrder[a.position || 'none'] || 99;
      const pB = posOrder[b.position || 'none'] || 99;
      return pA - pB;
    });

    rowsHtml = sortedParticipants.map((p, index) => {
      const student = appData.students[p.studentId] || {};
      const team = appData.teams[student.teamId] || {};
      const posLabel = p.position && p.position !== 'none' ? POSITION_LABELS[p.position] || p.position : '-';
      const gradeLabel = p.grade && p.grade !== 'none' ? GRADE_LABELS[p.grade] || p.grade : '-';
      
      return `
        <tr>
          <td>${index + 1}</td>
          <td>${sanitize(student.chestNo || '')}</td>
          <td>${sanitize(p.name)}</td>
          <td>${sanitize(team.name || '')}</td>
          <td class="font-bold">${posLabel}</td>
          <td>${gradeLabel}</td>
        </tr>`;
    }).join('');
  } else {
    rowsHtml = `<tr><td colspan="6" style="text-center">No participants found.</td></tr>`;
  }

  return `
    <div class="print-page">
      <div class="print-header text-center">
        <h1 class="text-2xl font-bold uppercase tracking-wider mb-1">ART FEST 2K25 OFFICIAL RESULT</h1>
        <p class="text-sm text-gray-600">Darunnajath Islamic Complex</p>
      </div>
      
      <div class="flex justify-between items-end border-b-2 border-black pb-2 mb-6 mt-8">
        <div>
          <h2 class="text-xl font-bold">${sanitize(result.programName)}</h2>
          <p class="text-sm mt-1"><strong>Category:</strong> ${sanitize(result.category)} &nbsp;|&nbsp; <strong>Type:</strong> ${isStage}</p>
        </div>
        <div class="text-right text-sm">
          <p><strong>Date:</strong> ${dateStr}</p>
        </div>
      </div>
      
      <table class="print-table w-full mb-8">
        <thead>
          <tr>
            <th class="w-12">#</th>
            <th class="w-24">Chest No</th>
            <th>Name</th>
            <th class="w-48">Team</th>
            <th class="w-28">Position</th>
            <th class="w-28">Grade</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
      
      <div class="print-signatures mt-24 flex justify-between">
        <div class="text-center w-48 border-t border-black pt-2">
          <p class="text-sm font-bold">Judges Signature</p>
        </div>
        <div class="text-center w-48 border-t border-black pt-2">
          <p class="text-sm font-bold">Stage Manager</p>
        </div>
        <div class="text-center w-48 border-t border-black pt-2">
          <p class="text-sm font-bold">Chief Coordinator</p>
        </div>
      </div>
    </div>`;
}

/**
 * Print complete team roster and summary sheet.
 * @param {string} teamId
 */
function printTeamSheet(teamId) {
  const team = appData.teams[teamId];
  if (!team) {
    ToastEngine.error('Team not found');
    return;
  }

  const { teamsArray, studentsArray } = getPublishedScores();
  const teamRank = teamsArray.findIndex(t => t.id === teamId) + 1;
  const tData = teamsArray.find(t => t.id === teamId) || { totalPoints: 0, categoryPoints: {} };

  const studentPointsMap = {};
  studentsArray.forEach(s => { studentPointsMap[s.id] = s.totalPoints || 0; });

  const rawStudents = getDataAsArray('students').filter(s => s.teamId === teamId);
  rawStudents.sort((a, b) => {
    const numA = parseInt(a.chestNo, 10);
    const numB = parseInt(b.chestNo, 10);
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
    return (String(a.chestNo || '')).localeCompare(String(b.chestNo || ''), undefined, { numeric: true });
  });

  const firstChestNo = rawStudents.length > 0 ? rawStudents[0].chestNo : null;
  const leader = rawStudents.find(s => s.chestNo === firstChestNo || s.isLeader || s.role === 'leader') || rawStudents[0];

  const studentRows = rawStudents.map((s, idx) => {
    const pts = studentPointsMap[s.id] || 0;
    const isLeader = s.chestNo === firstChestNo || s.isLeader || s.role === 'leader';
    return `
      <tr>
        <td class="text-center font-bold">${idx + 1}</td>
        <td class="font-bold">${sanitize(s.chestNo || '-')}</td>
        <td class="font-bold">${sanitize(s.name || 'Unknown')} ${isLeader ? '(Team Leader)' : ''}</td>
        <td>${sanitize(s.className || 'N/A')}</td>
        <td>${sanitize(s.category || 'N/A')}</td>
        <td class="text-right font-bold">${pts}</td>
        <td></td>
      </tr>`;
  }).join('');

  const catSummaryRows = CATEGORIES.map(cat => {
    const pts = tData.categoryPoints?.[cat] || 0;
    const count = rawStudents.filter(s => s.category === cat).length;
    return `
      <tr>
        <td class="font-bold">${cat}</td>
        <td class="text-center">${count}</td>
        <td class="text-right font-bold">${pts}</td>
      </tr>`;
  }).join('');

  const html = `
    <div class="print-page">
      <div class="print-header mb-6 pb-2 border-b-2">
        <div class="flex justify-between items-end">
          <div>
            <h1 class="font-bold uppercase tracking-wide">ART FEST 2K25</h1>
            <p class="text-sm">Official Team Roster & Summary Sheet</p>
          </div>
          <div class="text-right">
            <h2 class="font-bold text-xl">${sanitize(team.name)}</h2>
            <p class="text-xs">Overall Rank: #${teamRank} • Total Points: ${tData.totalPoints}</p>
          </div>
        </div>
      </div>

      <div class="flex justify-between items-center mb-4 p-2 bg-gray-50 border">
        <div>
          <span class="text-xs font-bold uppercase">Team Leader:</span>
          <span class="font-bold">${sanitize(leader?.name || 'N/A')} (Chest #${sanitize(leader?.chestNo || 'N/A')})</span>
        </div>
        <div>
          <span class="text-xs font-bold uppercase">Total Registered Students:</span>
          <span class="font-bold">${rawStudents.length}</span>
        </div>
      </div>

      <h3 class="text-sm font-bold uppercase mt-4 mb-2">Student Participants (Ordered by Chest Number)</h3>
      <table class="print-table mb-6">
        <thead>
          <tr>
            <th class="w-12 text-center">#</th>
            <th class="w-24">Chest No</th>
            <th>Student Name</th>
            <th class="w-24">Class</th>
            <th class="w-28">Category</th>
            <th class="w-20 text-right">Points</th>
            <th class="w-28">Remarks</th>
          </tr>
        </thead>
        <tbody>
          ${studentRows}
        </tbody>
      </table>

      <div class="flex justify-between items-start gap-8 mt-6">
        <div class="w-1/2">
          <h3 class="text-sm font-bold uppercase mb-2">Category Points Summary</h3>
          <table class="print-table">
            <thead>
              <tr>
                <th>Category</th>
                <th class="text-center">Students</th>
                <th class="text-right">Points</th>
              </tr>
            </thead>
            <tbody>
              ${catSummaryRows}
            </tbody>
          </table>
        </div>
        <div class="w-1/2 flex flex-col justify-end pt-12">
          <div class="flex justify-between gap-4 mt-8">
            <div class="text-center border-t pt-2 flex-1">
              <p class="text-xs font-bold uppercase">Team Leader Signature</p>
            </div>
            <div class="text-center border-t pt-2 flex-1">
              <p class="text-xs font-bold uppercase">Festival Convener</p>
            </div>
          </div>
        </div>
      </div>
    </div>`;

  executePrint(html);
}

/**
 * Handles the actual injection and window print invocation.
 */
function executePrint(htmlContent) {
  const printArea = document.getElementById('print-area');
  const app = document.getElementById('app');
  
  if (!printArea) {
    ToastEngine.error("Print area not found");
    return;
  }
  
  printArea.innerHTML = htmlContent;
  
  // Hide main app, show print area
  app.style.display = 'none';
  printArea.style.display = 'block';
  
  // Wait for render
  setTimeout(() => {
    window.print();
    
    // Restore
    app.style.display = '';
    printArea.style.display = 'none';
    printArea.innerHTML = '';
  }, 300);
}

