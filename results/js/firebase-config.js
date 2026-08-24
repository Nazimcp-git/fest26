// results/js/firebase-config.js
// Centralized Firebase Configuration & App Constants for PORU 2K25

if (typeof firebaseConfig === 'undefined') {
  var firebaseConfig = {
    apiKey: "AIzaSyCl2ev2XzSAC7HecOGncwDqrtA8ufoeyIE",
  authDomain: "readex-ba055.firebaseapp.com",
  databaseURL: "https://readex-ba055-default-rtdb.firebaseio.com",
  projectId: "readex-ba055",
  storageBucket: "readex-ba055.firebasestorage.app",
  messagingSenderId: "698826951590",
  appId: "1:698826951590:web:b426c1e937ca2f6edcdd67",
  measurementId: "G-K14DMDQEKT"
  };
}

if (typeof CATEGORIES === 'undefined') {
  var CATEGORIES = [
    "BIDAYA",
    "ALIYA",
    "UOOLA",
    "THANIYA",
    "THANAWIYYA",
    "KULLIYYA"
  ];
}

if (typeof CATEGORY_COLORS === 'undefined') {
  var CATEGORY_COLORS = {
    BIDAYA:     { bg: 'bg-emerald-50',  text: 'text-emerald-700',  border: 'border-emerald-200', dot: 'bg-emerald-500' },
    ALIYA:      { bg: 'bg-sky-50',      text: 'text-sky-700',      border: 'border-sky-200',     dot: 'bg-sky-500' },
    UOOLA:      { bg: 'bg-violet-50',   text: 'text-violet-700',   border: 'border-violet-200',  dot: 'bg-violet-500' },
    THANIYA:    { bg: 'bg-amber-50',    text: 'text-amber-700',    border: 'border-amber-200',   dot: 'bg-amber-500' },
    THANAWIYYA: { bg: 'bg-rose-50',     text: 'text-rose-700',     border: 'border-rose-200',    dot: 'bg-rose-500' },
    KULLIYYA:   { bg: 'bg-indigo-50',   text: 'text-indigo-700',   border: 'border-indigo-200',  dot: 'bg-indigo-500' }
  };
}

// Initialize Firebase App if not already initialized
if (typeof firebase !== 'undefined' && firebase.apps && !firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Global Firebase instances
if (typeof firebase !== 'undefined' && firebase.database) {
  var db = firebase.database();
}
if (typeof firebase !== 'undefined' && firebase.auth) {
  var auth = firebase.auth();
}
