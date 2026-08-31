// js/modals.js
// Reusable modal system with multiple modal types.

const ModalEngine = (() => {
  let containerEl = null;

  function ensureContainer() {
    containerEl = document.getElementById('modal-container');
    if (!containerEl) {
      containerEl = document.createElement('div');
      containerEl.id = 'modal-container';
      document.body.appendChild(containerEl);
    }
  }

  /**
   * Open a generic modal with custom HTML content.
   * @param {Object} opts
   * @param {string} opts.title
   * @param {string} opts.body      inner HTML
   * @param {string} [opts.size]    'sm', 'md', 'lg', 'xl'
   * @param {Function} [opts.onClose]
   */
  function open({ title = '', body = '', size = 'md', onClose = null }) {
    ensureContainer();
    const maxWidths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
    const mw = maxWidths[size] || maxWidths.md;

    containerEl.innerHTML = `
      <div class="modal-overlay fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-[9000] opacity-0 transition-opacity duration-200">
        <div class="modal-panel bg-white rounded-2xl shadow-2xl w-full ${mw} max-h-[90vh] flex flex-col transform scale-95 opacity-0 transition-all duration-200">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 class="text-lg font-semibold text-gray-900">${title}</h3>
            <button class="close-modal-btn w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors" aria-label="Close">
              <i class="fas fa-times text-sm"></i>
            </button>
          </div>
          <div class="modal-body flex-1 overflow-y-auto px-6 py-4">
            ${body}
          </div>
        </div>
      </div>`;

    containerEl.classList.remove('hidden');

    // Animate in
    requestAnimationFrame(() => {
      const overlay = containerEl.querySelector('.modal-overlay');
      const panel = containerEl.querySelector('.modal-panel');
      if (overlay) overlay.classList.remove('opacity-0');
      if (panel) {
        panel.classList.remove('scale-95', 'opacity-0');
        panel.classList.add('scale-100', 'opacity-100');
      }
    });

    // Close handlers
    const closeHandler = () => {
      close();
      if (onClose) onClose();
    };

    containerEl.querySelector('.close-modal-btn')?.addEventListener('click', closeHandler);
    containerEl.querySelector('.modal-overlay')?.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) closeHandler();
    });

    // ESC key
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        closeHandler();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
  }

  /**
   * Show a confirmation dialog.
   * @param {string} message
   * @param {Object} opts
   * @returns {Promise<boolean>}
   */
  function confirm(message, { title = 'Confirm Action', confirmText = 'Confirm', cancelText = 'Cancel', danger = false } = {}) {
    return new Promise((resolve) => {
      ensureContainer();
      const btnClass = danger
        ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
        : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500';

      containerEl.innerHTML = `
        <div class="modal-overlay fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-[9000] opacity-0 transition-opacity duration-200">
          <div class="modal-panel bg-white rounded-2xl shadow-2xl w-full max-w-sm transform scale-95 opacity-0 transition-all duration-200">
            <div class="p-6">
              <div class="flex items-center gap-3 mb-3">
                ${danger ? '<div class="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0"><i class="fas fa-exclamation-triangle text-red-600"></i></div>' : ''}
                <h3 class="text-lg font-semibold text-gray-900">${sanitize(title)}</h3>
              </div>
              <p class="text-sm text-gray-600 leading-relaxed mb-6">${sanitize(message)}</p>
              <div class="flex items-center gap-3 justify-end">
                <button class="modal-cancel-btn px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">${sanitize(cancelText)}</button>
                <button class="modal-confirm-btn px-4 py-2 text-sm font-medium text-white rounded-lg ${btnClass} transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">${sanitize(confirmText)}</button>
              </div>
            </div>
          </div>
        </div>`;

      containerEl.classList.remove('hidden');

      requestAnimationFrame(() => {
        const overlay = containerEl.querySelector('.modal-overlay');
        const panel = containerEl.querySelector('.modal-panel');
        if (overlay) overlay.classList.remove('opacity-0');
        if (panel) {
          panel.classList.remove('scale-95', 'opacity-0');
          panel.classList.add('scale-100', 'opacity-100');
        }
      });

      const doResolve = (val) => {
        close();
        resolve(val);
      };

      containerEl.querySelector('.modal-confirm-btn')?.addEventListener('click', () => doResolve(true));
      containerEl.querySelector('.modal-cancel-btn')?.addEventListener('click', () => doResolve(false));
      containerEl.querySelector('.modal-overlay')?.addEventListener('click', (e) => {
        if (e.target === e.currentTarget) doResolve(false);
      });
    });
  }

  /**
   * Close the current modal with animation.
   */
  function close() {
    if (!containerEl) return;
    const overlay = containerEl.querySelector('.modal-overlay');
    const panel = containerEl.querySelector('.modal-panel');
    if (overlay) overlay.classList.add('opacity-0');
    if (panel) {
      panel.classList.add('scale-95', 'opacity-0');
      panel.classList.remove('scale-100', 'opacity-100');
    }
    setTimeout(() => {
      if (containerEl) {
        containerEl.classList.add('hidden');
        containerEl.innerHTML = '';
      }
    }, 200);
  }

  return { open, confirm, close };
})();

// ── Specific modals used by the app ─────────────────────────────────────

function openTeamModal(teamId) {
  const team = appData.teams[teamId];
  if (!team) return;

  const teamPenalties = calculateTeamPenalties();
  const directScores = appData.teamDirectScores[teamId] || {};
  let totalTeamPoints = 0;
  const categoryPoints = {};

  CATEGORIES.forEach(cat => {
    const points = directScores[cat] || 0;
    categoryPoints[cat] = points;
    totalTeamPoints += points;
  });

  Object.values(appData.students || {}).forEach(student => {
    if (student.teamId === teamId) {
      const sp = student.totalPoints || 0;
      totalTeamPoints += sp;
      if (student.category && categoryPoints.hasOwnProperty(student.category)) {
        categoryPoints[student.category] += sp;
      }
    }
  });

  totalTeamPoints -= (teamPenalties[teamId] || 0);

  // Calculate rank
  const allTeams = getDataAsArray("teams").map(t => {
    let score = appData.teamDirectScores[t.id] ? Object.values(appData.teamDirectScores[t.id]).reduce((a, b) => a + (b || 0), 0) : 0;
    Object.values(appData.students || {}).forEach(s => {
      if (s.teamId === t.id) score += (s.totalPoints || 0);
    });
    score -= (teamPenalties[t.id] || 0);
    return { ...t, totalPoints: score };
  }).sort((a, b) => b.totalPoints - a.totalPoints);

  const rank = allTeams.findIndex(t => t.id === teamId) + 1;

  const body = `
    <div class="text-center mb-6">
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 mb-3">
        <span class="text-2xl font-bold text-indigo-600">#${rank}</span>
      </div>
      <h2 class="text-2xl font-bold text-gray-900">${sanitize(team.name)}</h2>
      <p class="text-4xl font-extrabold text-indigo-600 mt-2">${totalTeamPoints}</p>
      <p class="text-xs text-gray-500 uppercase tracking-wider mt-1">Total Points</p>
    </div>
    <div class="space-y-2">
      ${CATEGORIES.map(cat => {
        const colors = CATEGORY_COLORS[cat] || {};
        return `
        <div class="flex items-center justify-between p-3 rounded-xl ${colors.bg || 'bg-gray-50'}">
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full ${colors.dot || 'bg-gray-400'}"></div>
            <span class="text-sm font-medium ${colors.text || 'text-gray-700'}">${cat}</span>
          </div>
          <span class="text-sm font-bold text-gray-900">${categoryPoints[cat]}</span>
        </div>`;
      }).join('')}
    </div>`;

  ModalEngine.open({ title: 'Team Details', body, size: 'sm' });
}

function openPublishResultsModal(resultId) {
  const result = appData.results[resultId];
  if (!result) return;

  const body = `
    <div class="text-center mb-4">
      ${categoryBadge(result.category)}
      ${stageTypeBadge(result.stageType || 'stage')}
      <h2 class="text-xl font-bold text-gray-900 mt-2">${sanitize(result.programName)}</h2>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-gray-100">
            <th class="pb-2 text-left text-xs font-medium text-gray-500 uppercase">Chest No</th>
            <th class="pb-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
            <th class="pb-2 text-left text-xs font-medium text-gray-500 uppercase">Team</th>
            <th class="pb-2 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
            <th class="pb-2 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          ${(result.participants || []).map(p => {
            const student = appData.students[p.studentId] || {};
            const teamObj = appData.teams[student.teamId] || {};
            const pos = p.position && p.position !== 'none' ? POSITION_LABELS[p.position] || p.position : '—';
            const grade = p.grade && p.grade !== 'none' ? GRADE_LABELS[p.grade] || p.grade : '—';
            return `
            <tr>
              <td class="py-2.5 text-gray-500">${sanitize(student.chestNo || 'N/A')}</td>
              <td class="py-2.5 font-medium text-gray-900">${sanitize(p.name || 'N/A')}</td>
              <td class="py-2.5 text-gray-500">${sanitize(teamObj.name || 'N/A')}</td>
              <td class="py-2.5 font-medium text-gray-800">${pos}</td>
              <td class="py-2.5 font-medium text-gray-800">${grade}</td>
            </tr>`;
          }).join('')}
          ${(result.participants || []).length === 0 ? '<tr><td colspan="5" class="text-center py-6 text-gray-500">No participants.</td></tr>' : ''}
        </tbody>
      </table>
    </div>`;

  ModalEngine.open({ title: 'Result Details', body, size: 'lg' });
}
