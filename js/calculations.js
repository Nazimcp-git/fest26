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
 * Core calculation: iterates results, accumulates points per student and per team.
 * @param {string} filter  'all' | 'published' | 'published+ready'
 * @returns {{ teamsArray: Array, studentsArray: Array }}
 */
function _calculateScores(filter) {
  const studentPoints    = {};
  const teamDirectPoints = {};
  const teamPenalties    = calculateTeamPenalties();

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

  studentsArray.forEach(student => {
    student.totalPoints = studentPoints[student.id] || 0;
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
  for (const studentId in studentPoints)
    updates[`/students/${studentId}/totalPoints`] = studentPoints[studentId];
  for (const teamId in teamDirectPoints)
    updates[`/teamDirectScores/${teamId}`] = teamDirectPoints[teamId];

  return db.ref().update(updates);
}
