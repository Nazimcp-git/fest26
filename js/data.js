// js/data.js
// Firebase data synchronisation and low-level data helpers.

/** Active listeners for cleanup */
const _activeListeners = [];

/** Throttle public re-renders to avoid thrashing */
let _lastRenderTime = 0;
let _pendingRenderTimer = null;
const RENDER_THROTTLE_MS = 2000;

/**
 * Synchronizes application data from Firebase.
 * If user is authenticated (admin), fetches all results (pending, ready, published)
 * and administrative collections.
 * If user is not authenticated (public), fetches ONLY published results using:
 * db.ref('results').orderByChild('status').equalTo('published')
 * ensuring unpublished results are NEVER sent over the network or accessible via devtools.
 */
async function syncData() {
  cleanupListeners();

  const isAuth = !!currentUser;

  // Base public collections
  const publicCollections = [
    'teams', 'students', 'programs',
    'pointsConfig', 'groupPointsConfig', 'teamPointsConfig',
    'teamDirectScores', 'teamPenalties', 'settings'
  ];

  // Admin-only collections
  const adminCollections = [
    'studentPenalties', 'participantRegistrations', 'registrations'
  ];

  const collections = isAuth ? [...publicCollections, ...adminCollections] : publicCollections;

  // Query for results: admins get all results; public gets ONLY published results
  const resultsQuery = isAuth
    ? db.ref('results')
    : db.ref('results').orderByChild('status').equalTo('published');

  // Initial parallel load to ensure data is populated before rendering
  const loadPromises = collections.map(col =>
    db.ref(col).once('value')
      .then(snap => ({ key: col, val: snap.val() }))
      .catch(err => {
        console.warn(`Could not read ${col}:`, err);
        return { key: col, val: null };
      })
  );

  loadPromises.push(
    resultsQuery.once('value')
      .then(snap => ({ key: 'results', val: snap.val() }))
      .catch(err => {
        console.warn('Could not read results:', err);
        return { key: 'results', val: null };
      })
  );

  try {
    const snapshots = await Promise.all(loadPromises);
    snapshots.forEach(({ key, val }) => {
      if (key === 'pointsConfig') {
        appData[key] = val || { first: 5, second: 3, third: 2, a_grade: 1, b_grade: 0 };
      } else if (key === 'groupPointsConfig') {
        appData[key] = val || { first: 10, second: 7, third: 5, a_grade: 0, b_grade: 0 };
      } else if (key === 'teamPointsConfig') {
        appData[key] = val || { first: 15, second: 10, third: 7, a_grade: 0, b_grade: 0 };
      } else {
        appData[key] = val || {};
      }
    });

    invalidateCache();

    if (isInitialLoad) {
      router();
      isInitialLoad = false;
    } else {
      onDataUpdated();
    }
  } catch (error) {
    console.error("Firebase Read Failed:", error);
    const appEl = document.getElementById("app");
    if (appEl && isInitialLoad) {
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
  }

  // Set up real-time listeners for live updates
  collections.forEach(col => {
    const ref = db.ref(col);
    const cb = snap => {
      appData[col] = snap.val() || {};
      invalidateCache();
      onDataUpdated();
    };
    ref.on('value', cb);
    _activeListeners.push({ ref, event: 'value', callback: cb });
  });

  const resultsCb = snap => {
    appData.results = snap.val() || {};
    invalidateCache();
    onDataUpdated();
  };
  resultsQuery.on('value', resultsCb);
  _activeListeners.push({ ref: resultsQuery, event: 'value', callback: resultsCb });
}

/**
 * Throttled router update when public data changes.
 */
function onDataUpdated() {
  const hash = window.location.hash.slice(1) || '/';
  if (!hash.startsWith('/admin')) {
    const now = Date.now();
    const elapsed = now - _lastRenderTime;
    if (elapsed >= RENDER_THROTTLE_MS) {
      _lastRenderTime = now;
      if (_pendingRenderTimer) { clearTimeout(_pendingRenderTimer); _pendingRenderTimer = null; }
      router(true);
    } else if (!_pendingRenderTimer) {
      _pendingRenderTimer = setTimeout(() => {
        _pendingRenderTimer = null;
        _lastRenderTime = Date.now();
        router(true);
      }, RENDER_THROTTLE_MS - elapsed);
    }
  }
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
