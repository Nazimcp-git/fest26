// registrations/firebase.js
// Centralized Firebase Configuration & App Constants for PORU 2K25

if (typeof firebaseConfig === 'undefined') {
  var firebaseConfig = {
    apiKey:            "AIzaSyBXJ_RnfjUDi7qPDATWVnS5lSFw6jVRYgo",
    authDomain:        "shopping-e284c.firebaseapp.com",
    databaseURL:       "https://shopping-e284c-default-rtdb.firebaseio.com",
    projectId:         "shopping-e284c",
    storageBucket:     "shopping-e284c.appspot.com",
    messagingSenderId: "248274428739",
    appId:             "1:248274428739:web:fc30dd9eb1ef83f610c5f6",
    measurementId:     "G-ZXZCK9BW7T"
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