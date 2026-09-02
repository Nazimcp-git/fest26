// js/security.js
/**
 * Alert 2k26 — Security & Cryptographic Protection Engine
 * Prevents XSS, Hardcoded Credentials Exposure, Input Injection, and Session Tampering.
 */

const SecurityEngine = {
  /**
   * Hashes a string using Web Crypto SHA-256 with resilient pure-JS fallback
   * @param {string} str - Plaintext passcode
   * @returns {Promise<string>} Hex-encoded SHA-256 hash
   */
  async hashPasscode(str) {
    if (!str || typeof str !== 'string') return '';
    const cleanStr = str.trim().toUpperCase();
    try {
      if (typeof crypto !== 'undefined' && crypto.subtle && typeof TextEncoder !== 'undefined') {
        const msgUint8 = new TextEncoder().encode(cleanStr);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      }
    } catch (e) {
      // Fall through to pure JS fallback
    }

    // Pure JS SHA-256 fallback (works offline, in file://, HTTP, non-secure contexts)
    return this.sha256Pure(cleanStr);
  },

  sha256Pure(ascii) {
    function rightRotate(value, amount) {
      return (value >>> amount) | (value << (32 - amount));
    }
    const mathPow = Math.pow;
    const maxWord = mathPow(2, 32);
    const lengthProperty = 'length';
    let i, j;
    let result = '';
    const words = [];
    const asciiBitLength = ascii[lengthProperty] * 8;
    const hash = [];
    const k = [];
    let primeCounter = 0;
    const isComposite = {};

    for (let candidate = 2; primeCounter < 64; candidate++) {
      if (!isComposite[candidate]) {
        for (i = 0; i < 313; i += candidate) {
          isComposite[i] = candidate;
        }
        hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
        k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
      }
    }

    ascii += '\x80';
    while (ascii[lengthProperty] % 64 - 56) ascii += '\x00';
    for (i = 0; i < ascii[lengthProperty]; i++) {
      j = ascii.charCodeAt(i);
      if (j >> 8) return '';
      words[i >> 2] |= j << ((3 - i) % 4) * 8;
    }
    words[words[lengthProperty]] = (asciiBitLength / maxWord) | 0;
    words[words[lengthProperty]] = asciiBitLength;

    for (j = 0; j < words[lengthProperty];) {
      const w = words.slice(j, j += 16);
      const oldHash = hash.slice(0);

      for (i = 0; i < 64; i++) {
        const w15 = w[i - 15], w2 = w[i - 2];
        const a = hash[0], e = hash[4];
        const temp1 = hash[7]
          + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25))
          + ((e & hash[5]) ^ ((~e) & hash[6]))
          + k[i]
          + (w[i] = (i < 16) ? w[i] : (
              w[i - 16]
              + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3))
              + w[i - 7]
              + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))
            ) | 0);
        const temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22))
          + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));

        hash.unshift((temp1 + temp2) | 0);
        hash[4] = (hash[4] + temp1) | 0;
      }

      for (i = 0; i < 8; i++) {
        hash[i] = (hash[i] + oldHash[i]) | 0;
      }
    }

    for (i = 0; i < 8; i++) {
      for (j = 3; j + 1; j--) {
        const b = (hash[i] >> (j * 8)) & 255;
        result += ((b < 16) ? '0' : '') + b.toString(16);
      }
    }
    return result;
  },

  /**
   * HTML Entity Encoding to prevent Cross-Site Scripting (XSS)
   * @param {string|number} str - Untrusted input
   * @returns {string} Sanitized HTML safe string
   */
  sanitize(str) {
    if (str === null || str === undefined) return '';
    const s = String(str);
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;',
      '`': '&#x60;'
    };
    return s.replace(/[&<>"'`/]/g, m => map[m]);
  },

  /**
   * Validates and constrains numeric inputs (points, scores, chest numbers)
   * @param {any} val - Raw input value
   * @param {number} min - Minimum allowed integer
   * @param {number} max - Maximum allowed integer
   * @param {number} fallback - Fallback default integer
   * @returns {number} Validated integer
   */
  validateInt(val, min = 0, max = 10000, fallback = 0) {
    const parsed = parseInt(val, 10);
    if (isNaN(parsed)) return fallback;
    return Math.min(Math.max(parsed, min), max);
  },

  /**
   * Verifies and retrieves session state with timestamp expiration check (8-hour TTL)
   * @param {string} sessionKey - Storage key
   * @param {number} maxAgeMs - Maximum allowed session duration in ms (default 8 hours)
   * @returns {object|null} Parsed session object or null if expired/invalid
   */
  verifySession(sessionKey, maxAgeMs = 8 * 60 * 60 * 1000) {
    try {
      const raw = sessionStorage.getItem(sessionKey);
      if (!raw) return null;
      const session = JSON.parse(raw);
      if (!session || typeof session !== 'object' || !session.loggedInAt) {
        sessionStorage.removeItem(sessionKey);
        return null;
      }
      if (Date.now() - session.loggedInAt > maxAgeMs) {
        sessionStorage.removeItem(sessionKey);
        return null;
      }
      return session;
    } catch (e) {
      sessionStorage.removeItem(sessionKey);
      return null;
    }
  }
};

// Expose globally
window.SecurityEngine = SecurityEngine;
window.sanitize = SecurityEngine.sanitize;
