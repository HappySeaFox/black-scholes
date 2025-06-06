// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-analytics.js";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB7S7Cj_Q_Q7_seFbC3fK8pL4x8i3jwj3Y",
  authDomain: "black-scholes-84db5.firebaseapp.com",
  projectId: "black-scholes-84db5",
  storageBucket: "black-scholes-84db5.firebasestorage.app",
  messagingSenderId: "1048329955703",
  appId: "1:1048329955703:web:89f216a4140c0045fcd972",
  measurementId: "G-3E3WY3QX7T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
