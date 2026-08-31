// js/admin-actions.js
// Handles admin list actions: delete, publish, state changes, etc.
//
// Workflow: Actions queue changes into `pendingWrites` (in-memory).
// Nothing is sent to Firebase until the user clicks "Save to Database".
// The floating save button shows the count of pending changes.

/**
 * Adds a change to the pending queue and updates the floating save button.
 * @param {string} path   Firebase path (e.g. "results/abc123/status")
 * @param {*}      value  Value to set (null = delete)
 */
function queueWrite(path, value) {
  pendingWrites[path] = value;
  updateSaveButton();
}

/**
 * Shows/hides the floating "Save to Database" button based on pending count.
 */
function updateSaveButton() {
  let btn = document.getElementById('save-to-db-btn');
  const count = Object.keys(pendingWrites).length;
  
  if (count === 0) {
    if (btn) btn.remove();
    return;
  }
  
  if (!btn) {
    btn = document.createElement('button');
    btn.id = 'save-to-db-btn';
    btn.className = 'fixed bottom-6 right-6 z-[999] flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-2xl shadow-2xl shadow-emerald-500/30 font-bold text-sm transition-all hover:scale-105 active:scale-95 border border-emerald-400/30';
    btn.addEventListener('click', flushPendingWrites);
    document.body.appendChild(btn);
  }
  
  btn.innerHTML = `<i class="fas fa-cloud-upload-alt text-lg"></i> Save to Database <span class="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">${count}</span>`;
}

/**
 * Writes all pending changes to Firebase in one batch, then clears the queue.
 */
async function flushPendingWrites() {
  const count = Object.keys(pendingWrites).length;
  if (count === 0) return;
  
  const btn = document.getElementById('save-to-db-btn');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-circle-notch fa-spin text-lg"></i> Saving...';
  }
  
  try {
    await db.ref().update(pendingWrites);
    
    // Check if any published results were changed — recalculate if needed
    const hasPublished = Object.entries(pendingWrites).some(([path, val]) => 
      path.endsWith('/status') && (val === 'published' || val === 'pending')
    );
    const hasDeletes = Object.values(pendingWrites).some(v => v === null);
    
    if (hasPublished || hasDeletes) {
      await recalculateAllPoints();
    }
    
    pendingWrites = {};
    updateSaveButton();
    ToastEngine.success(`${count} changes saved to database`);
    
    // Refresh current tab to show fresh state
    const scrollY = window.scrollY;
    renderAdminTab(activeAdminTab);
    requestAnimationFrame(() => window.scrollTo(0, scrollY));
    
  } catch (err) {
    ToastEngine.error("Save failed: " + err.message);
    if (btn) {
      btn.disabled = false;
      updateSaveButton();
    }
  }
}

/**
 * Re-renders the current admin tab in-place, preserving scroll.
 */
function refreshCurrentAdminTab() {
  const scrollY = window.scrollY;
  renderAdminTab(activeAdminTab);
  requestAnimationFrame(() => window.scrollTo(0, scrollY));
}

async function handleAdminListClick(e) {
  const target = e.target;
  
  // Program item click (opens modal unless it's a button)
  const programItem = target.closest(".program-item-clickable");
  if (programItem && !target.closest('button') && !target.closest('[data-no-modal-trigger]')) {
    openPublishResultsModal(programItem.dataset.resultId);
    return;
  }

  // Edit Result
  const editBtn = target.closest(".edit-result-btn");
  if (editBtn) {
    await editResult(editBtn.dataset.id);
    return;
  }

  // ── Status Changes — queue locally, swap buttons to new state ──

  const statusBtn = target.closest(".publish-btn") || target.closest(".unpublish-btn") 
                 || target.closest(".mark-ready-btn") || target.closest(".unmark-ready-btn");
  
  if (statusBtn) {
    const id = statusBtn.dataset.id;
    let newStatus;
    
    if (target.closest(".publish-btn"))     newStatus = "published";
    if (target.closest(".unpublish-btn"))   newStatus = "pending";
    if (target.closest(".mark-ready-btn"))  newStatus = "ready";
    if (target.closest(".unmark-ready-btn")) newStatus = "pending";
    
    // Queue the change
    queueWrite(`results/${id}/status`, newStatus);
    
    // Swap the action buttons to match the new status
    const actionsArea = statusBtn.closest('[data-no-modal-trigger]');
    if (actionsArea) {
      const deleteBtn = actionsArea.querySelector('.delete-btn');
      const deleteBtnHtml = deleteBtn ? deleteBtn.outerHTML : '';
      
      let newButtons = '';
      if (newStatus === 'published') {
        newButtons = `
          <button class="unpublish-btn px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-medium transition-colors" data-id="${id}">Unpublish</button>
          <button class="print-btn w-8 h-8 flex items-center justify-center bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" data-id="${id}"><i class="fas fa-print text-xs"></i></button>`;
      } else if (newStatus === 'ready') {
        newButtons = `
          <button class="unmark-ready-btn px-3 py-1.5 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-lg text-xs font-medium transition-colors" data-id="${id}">Unmark</button>
          <button class="publish-btn px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-medium transition-colors" data-id="${id}">Publish</button>`;
      } else {
        newButtons = `<button class="mark-ready-btn px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-medium transition-colors" data-id="${id}">Mark Ready</button>`;
      }
      
      actionsArea.innerHTML = newButtons + deleteBtnHtml;
    }
    
    // Also swap the badge
    const card = statusBtn.closest('.program-item-container');
    if (card) {
      const badgeArea = card.querySelector('.program-item-clickable .flex.items-center.gap-2.mb-1');
      if (badgeArea) {
        const oldBadge = badgeArea.querySelector('span');
        if (oldBadge) {
          const tmp = document.createElement('div');
          tmp.innerHTML = statusBadge(newStatus);
          oldBadge.replaceWith(tmp.firstElementChild);
        }
      }
    }
    
    ToastEngine.info("Queued — click Save to Database");
    return;
  }

  // ── Print (no database changes needed) ──────────────────────

  const printBtn = target.closest(".print-btn");
  if (printBtn) {
    if (typeof printResult === 'function') printResult(printBtn.dataset.id);
    else ToastEngine.warning("Print module not loaded");
    return;
  }
  
  if (target.closest("#print-all-ready-btn")) {
    if (typeof printReadyResults === 'function') printReadyResults();
    else ToastEngine.warning("Print module not loaded");
    return;
  }

  // ── Publish All Ready — queue all at once ───────────────────

  if (target.closest("#publish-all-ready-btn")) {
    ModalEngine.confirm("Queue all ready results for publishing?", { title: 'Publish All Ready' }).then(confirmed => {
      if (!confirmed) return;
      let count = 0;
      getDataAsArray("results").forEach(r => {
        if (r.status === "ready") {
          queueWrite(`results/${r.id}/status`, "published");
          count++;
        }
      });
      if (count > 0) {
        ToastEngine.success(`${count} results queued. Click "Save to Database" to apply.`);
      } else {
        ToastEngine.info("No ready results found");
      }
    });
    return;
  }

  // ── Update All Scores — this writes immediately ─────────────

  const updateScoresBtn = target.closest('#update-all-scores-btn');
  if (updateScoresBtn) {
    ModalEngine.confirm("Recalculate all public scores?", { title: 'Update Scores' }).then(async confirmed => {
      if (!confirmed) return;
      
      // Flush any pending writes first
      if (Object.keys(pendingWrites).length > 0) {
        await flushPendingWrites();
      }
      
      const originalHtml = updateScoresBtn.innerHTML;
      updateScoresBtn.disabled = true;
      updateScoresBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin mr-2"></i>Updating...';
      try {
        await recalculateAllPoints();
        ToastEngine.success("All scores updated");
      } catch(err) {
        ToastEngine.error("Error: " + err.message);
      } finally {
        updateScoresBtn.disabled = false;
        updateScoresBtn.innerHTML = originalHtml;
      }
    });
    return;
  }

  // ── Delete — queue as null value ────────────────────────────

  const deleteBtn = target.closest(".delete-btn");
  if (deleteBtn) {
    const { id, collection } = deleteBtn.dataset;
    ModalEngine.confirm(`Delete this ${collection.slice(0,-1)}?`, { title: 'Confirm Delete', danger: true, confirmText: 'Delete' }).then(confirmed => {
      if (!confirmed) return;
      
      queueWrite(`${collection}/${id}`, null);
      
      // Dim the row visually
      const row = deleteBtn.closest('.program-item-container')
                || deleteBtn.closest('div[class*="rounded-xl"]')
                || deleteBtn.closest('div[class*="rounded-lg"]');
      if (row) {
        row.style.opacity = '0.3';
        row.style.pointerEvents = 'none';
      }
      
      ToastEngine.info("Queued for deletion — click Save to Database");
    });
    return;
  }
}
