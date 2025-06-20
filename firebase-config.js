// REPLACE WITH YOUR CONFIG (from Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyAtDUiKyf35XYWmFPoqiO44dDDkBaHKtB8",
  authDomain: "cambio-x.firebaseapp.com",
  projectId: "cambio-x",
  storageBucket: "cambio-x.firebasestorage.app",
  messagingSenderId: "678785519068",
  appId: "1:678785519068:web:528cfe40b60d0a6f065319",
  measurementId: "G-V01SE5YXBP"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
console.log("Firebase initialized successfully!");
