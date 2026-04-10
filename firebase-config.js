// ===============================
// FIREBASE CONFIG
// ===============================
const firebaseConfig = {
    apiKey: "AIzaSyDv4_ciYvG01_25PSnmk3CWxn3fQhWY-tk",
    authDomain: "longedecasa-ff1ca.firebaseapp.com",
    projectId: "longedecasa-ff1ca",
    storageBucket: "longedecasa-ff1ca.firebasestorage.app",
    messagingSenderId: "469114564620",
    appId: "1:469114564620:web:ed38bbb1bacaf9eb483e29",
    measurementId: "G-7MQ7MMQKGJ"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const firebaseReady = true;
