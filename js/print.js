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
        <h1 class="text-2xl font-bold uppercase tracking-wider mb-1">PORU 2K25 OFFICIAL RESULT</h1>
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
