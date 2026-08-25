// js/notifications.js
// Reusable toast notification engine.

const ToastEngine = (() => {
  let container = null;

  function ensureContainer() {
    if (container && document.body.contains(container)) return;
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none';
    container.style.maxWidth = '380px';
    container.style.width = '100%';
    document.body.appendChild(container);
  }

  function getIcon(type) {
    const icons = {
      success: '<i class="fas fa-check-circle text-emerald-500"></i>',
      error:   '<i class="fas fa-exclamation-circle text-red-500"></i>',
      warning: '<i class="fas fa-exclamation-triangle text-amber-500"></i>',
      info:    '<i class="fas fa-info-circle text-blue-500"></i>'
    };
    return icons[type] || icons.info;
  }

  function getBorderColor(type) {
    const colors = {
      success: 'border-l-emerald-500',
      error:   'border-l-red-500',
      warning: 'border-l-amber-500',
      info:    'border-l-blue-500'
    };
    return colors[type] || colors.info;
  }

  /**
   * Show a toast notification.
   * @param {string} message
   * @param {'success'|'error'|'warning'|'info'} type
   * @param {number} duration  ms before auto-dismiss
   */
  function show(message, type = 'info', duration = 4000) {
    ensureContainer();

    const toast = document.createElement('div');
    toast.className = `pointer-events-auto bg-white border border-gray-200 border-l-4 ${getBorderColor(type)} rounded-xl shadow-lg px-4 py-3 flex items-start gap-3 transform translate-x-full opacity-0 transition-all duration-300 ease-out`;
    toast.innerHTML = `
      <span class="mt-0.5 text-base flex-shrink-0">${getIcon(type)}</span>
      <p class="text-sm text-gray-700 font-medium flex-1 leading-snug">${sanitize(message)}</p>
      <button class="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 mt-0.5" aria-label="Dismiss">
        <i class="fas fa-times text-xs"></i>
      </button>
    `;

    container.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
      toast.classList.remove('translate-x-full', 'opacity-0');
      toast.classList.add('translate-x-0', 'opacity-100');
    });

    // Dismiss handler
    const dismiss = () => {
      toast.classList.add('translate-x-full', 'opacity-0');
      setTimeout(() => toast.remove(), 300);
    };

    toast.querySelector('button').addEventListener('click', dismiss);

    if (duration > 0) {
      setTimeout(dismiss, duration);
    }

    return { dismiss };
  }

  return {
    success: (msg, dur) => show(msg, 'success', dur),
    error:   (msg, dur) => show(msg, 'error', dur),
    warning: (msg, dur) => show(msg, 'warning', dur),
    info:    (msg, dur) => show(msg, 'info', dur),
    show
  };
})();
