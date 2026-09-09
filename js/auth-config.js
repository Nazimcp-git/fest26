// js/auth-config.js
/**
 * Alert 2k26 — Centralized Access Control & Authentication Hashes
 * Stores salted SHA-256 hashes for teams, admin, and judge credentials.
 * Contains zero plaintext passwords or code comments.
 */

(function () {
  const ACCESS_CODE_HASHES = {
    // Team Salted Hashes
    "2ba1e92632123f852108db360ca124671229701f2bd0cf59ad3cab27b20e4365": { type: "team", teamName: "LIBERA" },
    "a25098a2a412207ad176a5416fc2f44772585b24c6c8cb0341dd3e59ff1d8ef0": { type: "team", teamName: "RELETIA" },
    "ecd8012d38644153bdc9e1811632b2f578c318a47c97b3d0dc4dcdd62f1576f9": { type: "team", teamName: "OPERA" },
    "2b63cb563d867290a8ab67c1a0262c80fbcfc2b3e6c9ea54378065746edd6160": { type: "team", teamName: "ALETHEIA" },

    // Admin Salted Hashes
    "58cf86d2ebc819e4876c01aec50ec9c6589e0a436604e5c1df40eaf9204cfe19": { type: "admin" },
    "c90fd79de78967d7d717e2f10ff656f2c9062efeb043106252608afcaa61d577": { type: "admin" }
  };

  const ADMIN_HASHES = [
    "58cf86d2ebc819e4876c01aec50ec9c6589e0a436604e5c1df40eaf9204cfe19",
    "c90fd79de78967d7d717e2f10ff656f2c9062efeb043106252608afcaa61d577"
  ];

  const JUDGE_HASHES = [
    "b53bc5e0675fee463e20f9c930c5c197eba312d8634709fbc01f10f2a16730c6",
    "58cf86d2ebc819e4876c01aec50ec9c6589e0a436604e5c1df40eaf9204cfe19",
    "c90fd79de78967d7d717e2f10ff656f2c9062efeb043106252608afcaa61d577"
  ];

  const AuthConfig = {
    ACCESS_CODE_HASHES,
    ADMIN_HASHES,
    JUDGE_HASHES,
    getUserByHash(codeHash) {
      if (!codeHash || typeof codeHash !== 'string') return null;
      return ACCESS_CODE_HASHES[codeHash.toLowerCase()] || null;
    },
    isAdminHash(codeHash) {
      if (!codeHash) return false;
      return ADMIN_HASHES.includes(codeHash.toLowerCase());
    },
    isJudgeHash(codeHash) {
      if (!codeHash) return false;
      return JUDGE_HASHES.includes(codeHash.toLowerCase());
    }
  };

  window.AuthConfig = AuthConfig;
  window.ACCESS_CODE_HASHES = ACCESS_CODE_HASHES;
})();
