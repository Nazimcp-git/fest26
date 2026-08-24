// js/utils.js
// Shared utility functions used across the application.

/**
 * Debounce: delays fn execution until after `wait` ms of inactivity.
 * @param {Function} fn
 * @param {number} wait
 * @returns {Function}
 */
function debounce(fn, wait = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  };
}

/**
 * Throttle: ensures fn is called at most once every `limit` ms.
 * @param {Function} fn
 * @param {number} limit
 * @returns {Function}
 */
function throttle(fn, limit = 200) {
  let inThrottle = false;
  return function (...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => { inThrottle = false; }, limit);
    }
  };
}

/**
 * Sanitize HTML to prevent XSS. Escapes angle brackets & quotes.
 * @param {string} str
 * @returns {string}
 */
function sanitize(str) {
  if (typeof str !== 'string') return '';
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return str.replace(/[&<>"']/g, c => map[c]);
}

/**
 * Format a timestamp to a readable date string.
 * @param {number} ts
 * @returns {string}
 */
function formatDate(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
}

/**
 * Format a timestamp to a readable date+time string.
 * @param {number} ts
 * @returns {string}
 */
function formatDateTime(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
  });
}

/**
 * Generate a unique ID (for local use, not Firebase keys).
 * @returns {string}
 */
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

/**
 * Helper: generates category <option> elements for select dropdowns.
 * @returns {string}
 */
function categoryOptions() {
  return '<option value="">Select Category</option>' +
    CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('');
}

/**
 * Generates a category badge HTML with color coding.
 * @param {string} category
 * @returns {string}
 */
function categoryBadge(category) {
  const colors = CATEGORY_COLORS[category] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
  return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text} ${colors.border} border">${sanitize(category)}</span>`;
}

/**
 * Generates a status badge HTML.
 * @param {string} status
 * @returns {string}
 */
function statusBadge(status) {
  const map = {
    'published':        { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: 'fa-check-circle' },
    'Published':        { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: 'fa-check-circle' },
    'ready':            { cls: 'bg-blue-50 text-blue-700 border-blue-200',          icon: 'fa-clock' },
    'Ready to Publish': { cls: 'bg-blue-50 text-blue-700 border-blue-200',          icon: 'fa-clock' },
    'pending':          { cls: 'bg-amber-50 text-amber-700 border-amber-200',       icon: 'fa-hourglass-half' },
    'Pending':          { cls: 'bg-amber-50 text-amber-700 border-amber-200',       icon: 'fa-hourglass-half' },
    'Not Entered':      { cls: 'bg-gray-50 text-gray-500 border-gray-200',          icon: 'fa-minus-circle' }
  };
  const s = map[status] || map['Not Entered'];
  return `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${s.cls}"><i class="fas ${s.icon} text-[10px]"></i>${sanitize(status)}</span>`;
}

/**
 * Stage type badge.
 * @param {string} stageType
 * @returns {string}
 */
function stageTypeBadge(stageType) {
  const isStage = stageType !== 'non-stage';
  return `<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${isStage ? 'bg-purple-50 text-purple-700' : 'bg-orange-50 text-orange-700'}">${isStage ? 'Stage' : 'Non-Stage'}</span>`;
}

/**
 * Position labels for display.
 */
const POSITION_LABELS = {
  'first':  '1st Place',
  'second': '2nd Place',
  'third':  '3rd Place'
};

const GRADE_LABELS = {
  'a_grade': 'A Grade',
  'b_grade': 'B Grade'
};

/**
 * Generates an empty state HTML block.
 * @param {string} icon    FontAwesome icon class
 * @param {string} title
 * @param {string} subtitle
 * @returns {string}
 */
function emptyState(icon, title, subtitle = '') {
  return `
    <div class="flex flex-col items-center justify-center py-16 px-4">
      <div class="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
        <i class="fas ${icon} text-2xl text-gray-400"></i>
      </div>
      <p class="text-sm font-medium text-gray-900 mb-1">${sanitize(title)}</p>
      ${subtitle ? `<p class="text-xs text-gray-500 text-center max-w-xs">${sanitize(subtitle)}</p>` : ''}
    </div>`;
}

/**
 * Generates a skeleton loader placeholder.
 * @param {number} lines
 * @returns {string}
 */
function skeletonLoader(lines = 3) {
  const widths = ['w-full', 'w-3/4', 'w-1/2', 'w-5/6', 'w-2/3'];
  return `<div class="animate-pulse space-y-3 p-4">${
    Array.from({ length: lines }, (_, i) =>
      `<div class="h-4 bg-gray-200 rounded ${widths[i % widths.length]}"></div>`
    ).join('')
  }</div>`;
}

/**
 * Creates a loading spinner HTML.
 * @param {string} size  'sm', 'md', 'lg'
 * @returns {string}
 */
function spinner(size = 'md') {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };
  return `<div class="flex items-center justify-center p-8">
    <div class="${sizes[size] || sizes.md} border-2 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
  </div>`;
}

/**
 * Starts a live clock on the TV display page.
 * Updates the #tv-clock element every second.
 */
let _tvClockInterval = null;
function startTVClock() {
  if (_tvClockInterval) clearInterval(_tvClockInterval);
  const update = () => {
    const el = document.getElementById('tv-clock');
    if (!el) { clearInterval(_tvClockInterval); _tvClockInterval = null; return; }
    el.textContent = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };
  update();
  _tvClockInterval = setInterval(update, 1000);
}

/**
 * Renders a 404 Not Found page.
 */
async function renderNotFoundPage() {
  return `
    <div class="flex flex-col items-center justify-center py-20 text-center">
      <div class="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center mb-6">
        <i class="fas fa-question text-4xl text-gray-400"></i>
      </div>
      <h1 class="text-3xl font-black text-gray-900 tracking-tight mb-2">Page Not Found</h1>
      <p class="text-gray-500 font-medium mb-6">The page you're looking for doesn't exist.</p>
      <a href="#/" class="px-6 py-3 bg-gray-900 text-white rounded-2xl font-bold text-sm hover:bg-black transition-colors">Go Home</a>
    </div>`;
}

