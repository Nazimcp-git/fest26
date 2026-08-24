// js/calculations.js
// Business-logic helpers for computing scores and penalties.

/**
 * Returns a map of { teamId: totalPenaltyPoints } for all teams.
 * @returns {Object}
 */
function calculateTeamPenalties() {
  const penaltiesByTeam = {};
  for (const teamId in appData.teams) {
    penaltiesByTeam[teamId] = 0;
  }
  Object.values(appData.teamPenalties || {}).forEach(penalty => {
    if (penaltiesByTeam.hasOwnProperty(penalty.teamId)) {
      penaltiesByTeam[penalty.teamId] += penalty.points;
    }
  });
  return penaltiesByTeam;
}

/**
 * Returns a map of { studentId: totalPenaltyPoints } for all students.
 * @returns {Object}
 */
function calculateStudentPenalties() {
  const penaltiesByStudent = {};
  for (const studentId in appData.students) {
    penaltiesByStudent[studentId] = 0;
  }
  Object.values(appData.studentPenalties || {}).forEach(penalty => {
    if (penaltiesByStudent.hasOwnProperty(penalty.studentId)) {
      penaltiesByStudent[penalty.studentId] += (penalty.points || 0);
    }
  });
  return penaltiesByStudent;
}

/**
 * Core calculation: iterates results, accumulates points per student and per team.
 * @param {string} filter  'all' | 'published' | 'published+ready'
 * @returns {{ teamsArray: Array, studentsArray: Array }}
 */
function _calculateScores(filter) {
  const studentPoints    = {};
  const teamDirectPoints = {};
  const teamPenalties    = calculateTeamPenalties();
  const studentPenalties = calculateStudentPenalties();

  for (const studentId in appData.students) { studentPoints[studentId] = 0; }
  for (const teamId in appData.teams) {
    teamDirectPoints[teamId] = {};
    CATEGORIES.forEach(cat => { teamDirectPoints[teamId][cat] = 0; });
  }

  const allResults = appData.results || {};
  for (const resultId in allResults) {
    const result = allResults[resultId];

    // Apply filter
    if (filter === 'published' && result.status !== 'published') continue;
    if (filter === 'published+ready' && result.status !== 'published' && result.status !== 'ready') continue;

    if (!result.participants) continue;

    const cfg = result.programType === 'group'
      ? appData.groupPointsConfig
      : result.programType === 'team'
        ? appData.teamPointsConfig
        : appData.pointsConfig;

    result.participants.forEach(participant => {
      let points = 0;
      if (participant.position && participant.position !== "none" && cfg[participant.position])
        points += cfg[participant.position];
      if (participant.grade && participant.grade !== "none" && cfg[participant.grade])
        points += cfg[participant.grade];

      if (result.programType === 'group' || result.programType === 'team') {
        const student = appData.students[participant.studentId];
        if (student && student.teamId && teamDirectPoints[student.teamId] && result.category) {
          if (teamDirectPoints[student.teamId][result.category] === undefined)
            teamDirectPoints[student.teamId][result.category] = 0;
          teamDirectPoints[student.teamId][result.category] += points;
        }
      } else {
        if (studentPoints.hasOwnProperty(participant.studentId))
          studentPoints[participant.studentId] += points;
      }
    });
  }

  const teamsArray    = JSON.parse(JSON.stringify(getDataAsArray("teams")));
  const studentsArray = JSON.parse(JSON.stringify(getDataAsArray("students")));

  // Subtract student penalties from student points
  studentsArray.forEach(student => {
    const rawPts = studentPoints[student.id] || 0;
    const penPts = studentPenalties[student.id] || 0;
    student.totalPoints = rawPts - penPts;
  });

  teamsArray.forEach(team => {
    const directScores = teamDirectPoints[team.id] || {};
    let totalDirectPoints = 0;
    team.categoryPoints = {};
    CATEGORIES.forEach(cat => {
      const pts = directScores[cat] || 0;
      team.categoryPoints[cat] = pts;
      totalDirectPoints += pts;
    });
    team.totalPoints = totalDirectPoints;

    studentsArray.forEach(student => {
      if (student.teamId === team.id) {
        team.totalPoints += student.totalPoints;
        if (student.category && team.categoryPoints.hasOwnProperty(student.category))
          team.categoryPoints[student.category] += student.totalPoints;
      }
    });

    team.totalPoints -= (teamPenalties[team.id] || 0);
  });

  teamsArray.sort((a, b) => b.totalPoints - a.totalPoints);
  studentsArray.sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));

  const classScoresMap = {};
  studentsArray.forEach(student => {
    if (student.className) {
      if (!classScoresMap[student.className]) classScoresMap[student.className] = 0;
      classScoresMap[student.className] += (student.totalPoints || 0);
    }
  });

  const classesArray = Object.keys(classScoresMap).map(className => ({
    name: className,
    totalPoints: classScoresMap[className]
  })).sort((a, b) => b.totalPoints - a.totalPoints);

  return { teamsArray, studentsArray, classesArray };
}

/**
 * Calculates scores from ALL results (pending + ready + published).
 * Used by the admin Dashboard — shows live unfiltered scores.
 * @returns {{ teamsArray: Array, studentsArray: Array, classesArray: Array }}
 */
function calculateAllScoresInternal() {
  return _calculateScores('all');
}

/**
 * Calculates scores from published + "ready" results only.
 * Used by Score Preview tab.
 * @returns {{ teamsArray: Array, studentsArray: Array, classesArray: Array }}
 */
function getProvisionalScores() {
  return _calculateScores('published+ready');
}

/**
 * Calculates scores from published results only.
 * Used by the public leaderboard and home page.
 * @returns {{ teamsArray: Array, studentsArray: Array, classesArray: Array }}
 */
function getPublishedScores() {
  return _calculateScores('published');
}

/**
 * Recalculates every student's totalPoints and every team's
 * teamDirectScores from published results, then writes the
 * updates to Firebase in a single batch.
 * @returns {Promise}
 */
async function recalculateAllPoints() {
  const publishedResults = getDataAsArray("results").filter(r => r.status === "published");
  const studentPenalties  = calculateStudentPenalties();

  const studentPoints   = {};
  const teamDirectPoints = {};

  Object.keys(appData.students || {}).forEach(id => { studentPoints[id] = 0; });
  Object.keys(appData.teams    || {}).forEach(id => {
    teamDirectPoints[id] = {};
    CATEGORIES.forEach(cat => { teamDirectPoints[id][cat] = 0; });
  });

  for (const result of publishedResults) {
    if (!result.participants || result.participants.length === 0) continue;

    const cfg = result.programType === 'group'
      ? appData.groupPointsConfig
      : result.programType === 'team'
        ? appData.teamPointsConfig
        : appData.pointsConfig;

    result.participants.forEach(participant => {
      let pts = 0;
      if (participant.position && participant.position !== 'none' && cfg[participant.position])
        pts += cfg[participant.position];
      if (participant.grade && participant.grade !== "none" && cfg[participant.grade])
        pts += cfg[participant.grade];

      if (result.programType === 'group' || result.programType === 'team') {
        const student = appData.students[participant.studentId];
        if (student && student.teamId && teamDirectPoints[student.teamId] && result.category) {
          if (teamDirectPoints[student.teamId][result.category] === undefined)
            teamDirectPoints[student.teamId][result.category] = 0;
          teamDirectPoints[student.teamId][result.category] += pts;
        }
      } else {
        if (studentPoints.hasOwnProperty(participant.studentId))
          studentPoints[participant.studentId] += pts;
      }
    });
  }

  const updates = {};
  for (const studentId in studentPoints) {
    const raw = studentPoints[studentId] || 0;
    const pen = studentPenalties[studentId] || 0;
    updates[`/students/${studentId}/totalPoints`] = raw - pen;
  }
  for (const teamId in teamDirectPoints)
    updates[`/teamDirectScores/${teamId}`] = teamDirectPoints[teamId];

  return db.ref().update(updates);
}

/**
 * Returns scores based on the STORED (pre-calculated) values in Firebase.
 * These are only updated when the admin clicks "Update Scores".
 * Used by public-facing pages so scores don't change until explicitly refreshed.
 * @returns {{ teamsArray: Array, studentsArray: Array, classesArray: Array }}
 */
function getStoredScores() {
  const teamPenalties = calculateTeamPenalties();
  const teamsArray    = JSON.parse(JSON.stringify(getDataAsArray("teams")));
  const studentsArray = JSON.parse(JSON.stringify(getDataAsArray("students")));

  // Students already have totalPoints stored in Firebase (written by recalculateAllPoints)
  studentsArray.forEach(student => {
    student.totalPoints = student.totalPoints || 0;
  });

  // Teams: read from stored teamDirectScores and sum with student points
  teamsArray.forEach(team => {
    const storedDirect = appData.teamDirectScores[team.id] || {};
    let totalDirectPoints = 0;
    team.categoryPoints = {};
    CATEGORIES.forEach(cat => {
      const pts = storedDirect[cat] || 0;
      team.categoryPoints[cat] = pts;
      totalDirectPoints += pts;
    });
    team.totalPoints = totalDirectPoints;

    // Add individual student points for students in this team
    studentsArray.forEach(student => {
      if (student.teamId === team.id) {
        team.totalPoints += student.totalPoints;
        if (student.category && team.categoryPoints.hasOwnProperty(student.category))
          team.categoryPoints[student.category] += student.totalPoints;
      }
    });

    // Subtract penalties
    team.totalPoints -= (teamPenalties[team.id] || 0);
  });

  teamsArray.sort((a, b) => b.totalPoints - a.totalPoints);
  studentsArray.sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));

  // Class scores from stored student points
  const classScoresMap = {};
  studentsArray.forEach(student => {
    if (student.className) {
      if (!classScoresMap[student.className]) classScoresMap[student.className] = 0;
      classScoresMap[student.className] += (student.totalPoints || 0);
    }
  });

  const classesArray = Object.keys(classScoresMap).map(className => ({
    name: className,
    totalPoints: classScoresMap[className]
  })).sort((a, b) => b.totalPoints - a.totalPoints);

  return { teamsArray, studentsArray, classesArray };
}
