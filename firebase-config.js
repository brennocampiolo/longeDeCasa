// ===============================
// FIREBASE CONFIG
// ===============================
const firebaseConfig = {
    apiKey: "AIzaSyBE6eGkFeWfthTD4unw8Y31nC_t-HwICJ0",
    authDomain: "longedecasa-2e44d.firebaseapp.com",
    projectId: "longedecasa-2e44d",
    storageBucket: "longedecasa-2e44d.firebasestorage.app",
    messagingSenderId: "368018292622",
    appId: "1:368018292622:web:3db08ed9e04471dd916edf",
    measurementId: "G-G1XKE1SHEX"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const firebaseReady = true;
