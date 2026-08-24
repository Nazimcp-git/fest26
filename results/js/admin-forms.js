// js/admin-forms.js
// Admin form submission handlers, bulk upload, dropdowns, participant management.

async function handleAdminFormSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn.innerHTML;
  
  try {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin mr-2"></i>Processing...';

    switch (form.id) {
      case "add-team-form":
        await db.ref("teams").push({
          name: form.querySelector('#team-name').value,
          createdAt: Date.now()
        });
        ToastEngine.success("Team added successfully");
        form.reset();
        break;

      case "add-student-form":
        const chestNo = form.querySelector('#student-chest-no').value;
        const exists = Object.values(appData.students || {}).find(s => s.chestNo === chestNo);
        if (exists) throw new Error(`Chest No. ${chestNo} is already assigned to ${exists.name}.`);
        
        await db.ref("students").push({
          chestNo,
          name: form.querySelector("#student-name").value,
          className: form.querySelector("#student-class").value,
          category: form.querySelector("#student-category").value,
          teamId: form.querySelector("#student-team").value,
          totalPoints: 0,
          createdAt: Date.now()
        });
        ToastEngine.success("Student added successfully");
        form.reset();
        break;

      case "add-program-form":
        await db.ref("programs").push({
          name: form.querySelector("#program-name").value,
          category: form.querySelector("#program-category").value,
          stageType: form.querySelector('input[name="programStageType"]:checked').value,
          createdAt: Date.now()
        });
        ToastEngine.success("Program added successfully");
        form.reset();
        break;

      case "update-points-form":
        const ip = {
          first: parseInt(form.querySelector("#points-first").value),
          second: parseInt(form.querySelector("#points-second").value),
          third: parseInt(form.querySelector("#points-third").value),
          a_grade: parseInt(form.querySelector("#points-a_grade").value),
          b_grade: parseInt(form.querySelector('#points-b_grade').value)
        };
        const gp = {
          first: parseInt(form.querySelector("#group-points-first").value),
          second: parseInt(form.querySelector("#group-points-second").value),
          third: parseInt(form.querySelector("#group-points-third").value),
          a_grade: parseInt(form.querySelector("#group-points-a_grade").value),
          b_grade: parseInt(form.querySelector('#group-points-b_grade').value)
        };
        const tp = {
          first: parseInt(form.querySelector("#team-points-first").value),
          second: parseInt(form.querySelector("#team-points-second").value),
          third: parseInt(form.querySelector("#team-points-third").value),
          a_grade: parseInt(form.querySelector("#team-points-a_grade").value),
          b_grade: parseInt(form.querySelector('#team-points-b_grade').value)
        };
        await db.ref("pointsConfig").set(ip);
        await db.ref("groupPointsConfig").set(gp);
        await db.ref("teamPointsConfig").set(tp);
        await recalculateAllPoints();
        ToastEngine.success("Points configurations updated and scores recalculated");
        break;

      case "add-result-form":
        const programId = form.querySelector('#res-program').value;
        const programType = form.querySelector('select[name="programType"]').value;
        if (!programId || tempParticipants.length === 0) throw new Error("Program and at least one participant required.");
        
        const program = appData.programs[programId];
        const participants = tempParticipants.map((p, i) => {
          const posEl = document.getElementById(`pos-select-${i}`);
          const gradeEl = document.getElementById(`grade-select-${i}`);
          const position = posEl ? posEl.value : (p.position || 'none');
          const grade = gradeEl ? gradeEl.value : (p.grade || 'none');
          return { ...p, position, grade };
        }).filter(p => {
          const hasPos = p.position && p.position !== 'none';
          const hasGrade = p.grade && p.grade !== 'none';
          const hasMarks = p.marks !== undefined && p.marks !== null && String(p.marks).trim() !== '';
          return hasPos || hasGrade || hasMarks;
        });

        if (participants.length === 0) {
          throw new Error("Please assign a position or grade to at least one participant before saving.");
        }

        const resultData = {
          programId,
          programName: program.name,
          category: program.category,
          stageType: program.stageType || 'stage',
          programType,
          participants,
          status: 'pending', 
          timestamp: Date.now()
        };

        if (editingResultId) {
          await db.ref(`results/${editingResultId}`).set(resultData);
          ToastEngine.success("Result updated successfully");
        } else {
          await db.ref("results").push(resultData);
          ToastEngine.success("Result uploaded for review");
        }
        resetResultForm();
        break;

      case "add-teacher-judge-form":
        const editingJudgeId = form.querySelector('#judge-editing-id')?.value;
        const jName = form.querySelector('#judge-teacher-name').value.trim();
        const jCode = form.querySelector('#judge-teacher-code').value.trim().toUpperCase();
        const jAssignedProgs = Array.from(form.querySelectorAll('input[name="judgeAssignedPrograms"]:checked')).map(cb => cb.value);

        if (!jName || !jCode) throw new Error("Teacher name and access code are required.");
        if (jAssignedProgs.length === 0) throw new Error("Please select at least one assigned program.");

        const judgePayload = {
          name: jName,
          code: jCode,
          assignedPrograms: jAssignedProgs,
          updatedAt: Date.now()
        };

        if (editingJudgeId) {
          await db.ref(`teacherJudges/${editingJudgeId}`).update(judgePayload);
          ToastEngine.success(`Teacher Judge "${jName}" updated successfully!`);
        } else {
          judgePayload.createdAt = Date.now();
          await db.ref("teacherJudges").push(judgePayload);
          ToastEngine.success(`Teacher Judge "${jName}" configured successfully!`);
        }

        if (typeof window.resetTeacherJudgeForm === 'function') window.resetTeacherJudgeForm();
        loadItemsList('judges');
        break;

      case "bulk-upload-students-form":
      case "bulk-upload-programs-form":
        const type = form.id === "bulk-upload-students-form" ? "student" : "program";
        const file = form.querySelector("input[type=\"file\"]").files[0];
        if (!file) throw new Error("Please select an Excel file.");
        await processBulkUpload(file, type);
        form.reset();
        break;

      case "apply-penalty-form":
        const tId = form.querySelector('#penalty-team').value;
        const pts = parseInt(form.querySelector('#penalty-points').value, 10);
        const reason = form.querySelector('#penalty-reason').value;
        if (!tId || !pts || !reason || pts <= 0) throw new Error("Invalid penalty data");
        
        await db.ref("teamPenalties").push({ teamId: tId, points: pts, reason, createdAt: Date.now() });
        ToastEngine.success("Team penalty applied successfully");
        form.reset();
        break;

      case "apply-student-penalty-form":
        const sId = form.querySelector('#student-penalty-student-id').value;
        const sPts = parseInt(form.querySelector('#student-penalty-points').value, 10);
        const sReason = form.querySelector('#student-penalty-reason').value.trim();
        
        if (!sId || !appData.students[sId]) throw new Error("Please select a student.");
        if (!sPts || sPts <= 0) throw new Error("Penalty points must be greater than 0.");
        if (!sReason) throw new Error("Please enter a reason for the penalty deduction.");
        
        const targetStudent = appData.students[sId];
        await db.ref("studentPenalties").push({
          studentId: sId,
          chestNo: targetStudent.chestNo || '',
          studentName: targetStudent.name || '',
          teamId: targetStudent.teamId || '',
          points: sPts,
          reason: sReason,
          createdAt: Date.now()
        });

        invalidateCache();
        ToastEngine.success(`Applied -${sPts} penalty points to ${targetStudent.name}`);
        form.reset();
        break;
    }
    
    // Refresh the current tab content in-place (preserves scroll position)
    refreshCurrentAdminTab();
    
  } catch (err) {
    ToastEngine.error(err.message);
    console.error(err);
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnText;
  }
}

// ── Dropdowns & Form Logic ──────────────────────────────────────────────

function handleAdminFormChange(e) {
  const targetId = e.target.id;
  if (targetId === 'res-category') {
    populateProgramDropdown(e.target.value);
    populateStudentDropdown(null);
  } else if (targetId === 'res-program') {
    populateStudentDropdown(document.getElementById('res-category').value);
  }
}

function populateProgramDropdown(categoryId) {
  const programSelect = document.getElementById("res-program");
  if (!categoryId) {
    programSelect.innerHTML = "<option>Select Category First</option>";
    programSelect.disabled = true;
  } else {
    const programs = getDataAsArray("programs").filter(p => p.category === categoryId).sort((a,b)=>a.name.localeCompare(b.name));
    programSelect.innerHTML = '<option value="">Select Program</option>' + programs.map(p => `<option value="${p.id}">${sanitize(p.name)}</option>`).join('');
    programSelect.disabled = false;
  }
}

function populateStudentDropdown(categoryId) {
  const studentSelect = document.getElementById("res-student-select");
  const addBtn = document.getElementById('add-participant-btn');
  if (categoryId) {
    const students = getDataAsArray("students").filter(s => s.category === categoryId).sort((a,b)=>a.name.localeCompare(b.name));
    studentSelect.innerHTML = '<option value="">Select Student</option>' + students.map(s => `<option value="${s.id}">${sanitize(s.name)} (${sanitize(s.chestNo)})</option>`).join('');
    studentSelect.disabled = false;
    addBtn.disabled = false;
  } else {
    studentSelect.innerHTML = "<option>Select Program First</option>";
    studentSelect.disabled = true;
    addBtn.disabled = true;
  }
}

// ── Participants List ───────────────────────────────────────────────────

function addParticipantToTempList() {
  const select = document.getElementById("res-student-select");
  const studentId = select.value;
  if (!studentId) return;
  if (tempParticipants.some(p => p.studentId === studentId)) {
    ToastEngine.warning("Student already added");
    return;
  }
  const student = appData.students[studentId];
  tempParticipants.push({ studentId, name: student.name, position: "none", grade: "none" });
  renderParticipantsList();
  select.value = '';
}

function removeParticipantFromTempList(index) {
  tempParticipants.splice(index, 1);
  renderParticipantsList();
}

function renderParticipantsList() {
  const container = document.getElementById('participants-list');
  if (!container) return;
  
  if (tempParticipants.length === 0) {
    container.innerHTML = '<p class="text-xs text-gray-400 text-center py-4 border border-dashed border-gray-200 rounded-lg">No participants added</p>';
    return;
  }
  
  container.innerHTML = tempParticipants.map((p, i) => `
    <div class="bg-white border border-gray-200 rounded-lg p-3 shadow-sm animate-fade-in relative">
      <button type="button" class="remove-participant-btn absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors" data-index="${i}"><i class="fas fa-times"></i></button>
      <p class="font-semibold text-sm text-gray-900 mb-2 pr-6">${sanitize(p.name)}</p>
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="block text-[10px] font-medium text-gray-500 mb-0.5">Position</label>
          <select id="pos-select-${i}" class="w-full text-xs py-1.5 px-2 bg-gray-50 border border-gray-200 rounded outline-none focus:border-indigo-500">
            <option value="none">No Position</option><option value="first">1st Place</option><option value="second">2nd Place</option><option value="third">3rd Place</option>
          </select>
        </div>
        <div>
          <label class="block text-[10px] font-medium text-gray-500 mb-0.5">Grade</label>
          <select id="grade-select-${i}" class="w-full text-xs py-1.5 px-2 bg-gray-50 border border-gray-200 rounded outline-none focus:border-indigo-500">
            <option value="none">No Grade</option><option value="a_grade">A Grade</option><option value="b_grade">B Grade</option>
          </select>
        </div>
      </div>
    </div>`).join('');
    
  tempParticipants.forEach((p, i) => {
    document.getElementById(`pos-select-${i}`).value = p.position || 'none';
    document.getElementById(`grade-select-${i}`).value = p.grade || 'none';
  });
}

function resetResultForm() {
  editingResultId = null;
  tempParticipants = [];
  const form = document.getElementById('add-result-form');
  if (form) {
    form.reset();
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Upload for Review';
    btn.className = "w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors mt-4";
    
    document.getElementById('cancel-edit-btn')?.remove();
    document.getElementById('res-program').disabled = true;
    document.getElementById('res-student-select').disabled = true;
    document.getElementById('add-participant-btn').disabled = true;
  }
  renderParticipantsList();
}

async function editResult(resultId) {
  const result = appData.results[resultId];
  if (!result) return;
  
  editingResultId = resultId;
  const form = document.getElementById('add-result-form');
  if (!form) return;

  document.getElementById('res-category').value = result.category;
  populateProgramDropdown(result.category);
  document.getElementById('res-program').value = result.programId;
  populateStudentDropdown(result.category);
  const typeRadio = document.querySelector(`input[name="programType"][value="${result.programType || 'individual'}"]`);
  if(typeRadio) typeRadio.checked = true;

  tempParticipants = JSON.parse(JSON.stringify(result.participants || [])); 
  renderParticipantsList();
  
  const btn = form.querySelector('button[type="submit"]');
  btn.textContent = 'Update Result';
  btn.className = "w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors mt-4";
  
  if (!document.getElementById('cancel-edit-btn')) {
    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.id = 'cancel-edit-btn';
    cancelBtn.textContent = 'Cancel Edit';
    cancelBtn.className = 'w-full py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors mt-2';
    cancelBtn.onclick = resetResultForm;
    btn.parentNode.insertBefore(cancelBtn, btn.nextSibling);
  }
  
  window.scrollTo({ top: form.offsetTop - 100, behavior: 'smooth' });
}

// ── Bulk Upload Logic ───────────────────────────────────────────────────

function processBulkUpload(file, type) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async e => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        
        if (type === 'student') {
          const teams = getDataAsArray('teams');
          const teamMap = teams.reduce((acc, t) => { acc[t.name.toLowerCase().trim()] = t.id; return acc; }, {});
          const existingStudents = getDataAsArray('students');
          const updates = {};
          let skipped = 0;
          
          json.forEach(row => {
            const chestNo = String(row.ChestNo || '').trim();
            const name = String(row.Name || '').trim();
            const className = String(row.Class || '').trim();
            const cat = String(row.Category || '').trim();
            const tName = String(row.TeamName || '').trim();
            const tId = teamMap[tName.toLowerCase()];
            
            if (chestNo && name && className && cat && tId && CATEGORIES.includes(cat) && !existingStudents.some(s => s.chestNo === chestNo)) {
              updates[db.ref("students").push().key] = { chestNo, name, className, category: cat, teamId: tId, totalPoints: 0, createdAt: Date.now() };
            } else { skipped++; }
          });
          
          if (Object.keys(updates).length > 0) await db.ref("students").update(updates);
          ToastEngine.success(`Imported ${Object.keys(updates).length} students. Skipped ${skipped}.`);
        } else {
          const updates = {};
          let skipped = 0;
          json.forEach(row => {
            const name = String(row.ProgramName || '').trim();
            const cat = String(row.Category || '').trim();
            const st = String(row.StageType || 'stage').trim().toLowerCase() === 'non-stage' ? 'non-stage' : 'stage';
            if (name && cat && CATEGORIES.includes(cat)) {
              updates[db.ref("programs").push().key] = { name, category: cat, stageType: st, createdAt: Date.now() };
            } else { skipped++; }
          });
          if (Object.keys(updates).length > 0) await db.ref("programs").update(updates);
          ToastEngine.success(`Imported ${Object.keys(updates).length} programs. Skipped ${skipped}.`);
        }
        resolve();
      } catch (err) { reject(err); }
    };
    reader.onerror = () => reject(new Error("File read failed"));
    reader.readAsArrayBuffer(file);
  });
}

function downloadTemplate(type) {
  const data = type === 'student' 
    ? [{ ChestNo: "101", Name: "Amal", Class: "10th A", Category: "BIDAYA", TeamName: "Team A" }]
    : [{ ProgramName: "Solo Song", Category: 'BIDAYA', StageType: 'stage' }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), "Sheet1");
  XLSX.writeFile(wb, `${type}_template.xlsx`);
}

async function handleProfileSearch(e) {
  e.preventDefault();
  const input = document.getElementById("chest-no-input").value.trim();
  const errorEl = document.getElementById('search-error');
  errorEl.textContent = '';
  if (!input) return;
  
  const student = getDataAsArray("students").find(s => s.chestNo === input);
  if (student) window.location.hash = "/student/" + student.id;
  else errorEl.textContent = `No student found with Chest No. "${input}"`;
}
