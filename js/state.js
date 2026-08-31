// js/state.js
// Centralized application state. All modules read/write these variables.
// Keep mutations minimal and intentional.

let currentUser = null;

let appData = {
  teams:               {},
  students:            {},
  programs:            {},
  results:             {},
  pointsConfig:        {},
  groupPointsConfig:   {},
  teamPointsConfig:    {},
  teamDirectScores:    {},
  teamPenalties:       {},
  participantRegistrations: {}
};

// UI state
let isInitialLoad       = true;
let tempParticipants    = [];
let activeAdminTab      = "dashboard";
let editingResultId     = null;
let activeStatusFilter  = 'All';
let activeStatusCategoryFilter = 'All';
let activeStatusStageFilter = 'All';

// Pending changes queue — batched writes to Firebase
// Keys are Firebase paths, values are the data (null = delete)
let pendingWrites = {};

// Cache for memoized calculations — generation-based invalidation
let _calcGeneration = 0;
const _calcCache = {};

/**
 * Invalidate calculation caches. Called whenever appData changes.
 */
function invalidateCache() {
  _calcGeneration++;
}
