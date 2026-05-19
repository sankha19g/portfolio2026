import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  writeBatch,
  query,
  orderBy,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBUxU5ZkJmMe1IfXWFNUloxhzQ2lE3GG6A",
  authDomain: "personal-website-sankha.firebaseapp.com",
  projectId: "personal-website-sankha",
  storageBucket: "personal-website-sankha.firebasestorage.app",
  messagingSenderId: "2380613033",
  appId: "1:2380613033:web:b2ec9c782844100f7ef0b8",
};

const firebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(firebaseApp);

export { db, collection, doc, getDocs, getDoc, setDoc, writeBatch, query, orderBy };
