// js/data.js
// Firebase data synchronisation and low-level data helpers.

/** Active listeners for cleanup */
const _activeListeners = [];

/**
 * Opens a real-time listener on the root of the database and
 * keeps appData in sync. Triggers the router after the first load.
 */
function syncData() {
  const rootRef = db.ref();

  const listener = rootRef.on('value', snapshot => {
    const raw = snapshot.val() || {};
    appData = {
      teams:                raw.teams                || {},
      students:             raw.students             || {},
      programs:             raw.programs             || {},
      results:              raw.results              || {},
      pointsConfig:         raw.pointsConfig         || { first: 5, second: 3, third: 2, a_grade: 1, b_grade: 0 },
      groupPointsConfig:    raw.groupPointsConfig    || { first: 10, second: 7, third: 5, a_grade: 0, b_grade: 0 },
      teamPointsConfig:     raw.teamPointsConfig     || { first: 15, second: 10, third: 7, a_grade: 0, b_grade: 0 },
      teamDirectScores:     raw.teamDirectScores     || {},
      teamPenalties:        raw.teamPenalties        || {},
      studentPenalties:     raw.studentPenalties     || {},
      teacherJudges:        raw.teacherJudges        || {},
      participantRegistrations: raw.participantRegistrations || {}
    };

    // Invalidate calculation caches on data change
    invalidateCache();

    if (isInitialLoad) {
      router();
      isInitialLoad = false;
    } else {
      // If user is on admin, DON'T call router at all.
      // appData is already updated in memory above.
      // The admin panel stays frozen — no scroll jumps, no re-renders.
      // Fresh data shows up when the user switches tabs.
      const hash = window.location.hash.slice(1) || '/';
      if (hash === '/tv') {
        // TV page: always re-render to show latest results
        router();
      } else if (!hash.startsWith('/admin')) {
        router(true);
      } else {
        if (typeof loadItemsList === 'function' && ['students', 'teams', 'programs', 'penalty', 'judges'].includes(activeAdminTab)) {
          loadItemsList(activeAdminTab);
        }
      }
    }
  }, error => {
    console.error("Firebase Read Failed:", error);
    const appEl = document.getElementById("app");
    if (appEl) {
      appEl.innerHTML = `
        <div class="min-h-screen flex items-center justify-center">
          <div class="text-center max-w-md px-6">
            <div class="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-wifi text-2xl text-red-500"></i>
            </div>
            <h2 class="text-lg font-semibold text-gray-900 mb-2">Connection Error</h2>
            <p class="text-sm text-gray-500">Unable to connect to the database. Please check your internet connection and try refreshing.</p>
            <button onclick="location.reload()" class="mt-4 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
              Retry
            </button>
          </div>
        </div>`;
    }
  });

  _activeListeners.push({ ref: rootRef, event: 'value', callback: listener });
}

/**
 * Cleanup all active Firebase listeners.
 */
function cleanupListeners() {
  _activeListeners.forEach(({ ref, event, callback }) => {
    ref.off(event, callback);
  });
  _activeListeners.length = 0;
}

/**
 * Converts an appData collection (keyed object) into an array,
 * injecting the Firebase key as the `id` property.
 * @param {string} collection  e.g. "teams", "students"
 * @returns {Array}
 */
function getDataAsArray(collection) {
  if (!appData[collection]) return [];
  return Object.entries(appData[collection]).map(([id, val]) => ({ id, ...val }));
}
