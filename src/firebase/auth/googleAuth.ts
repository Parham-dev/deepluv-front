import firebase_app from "../config";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// Get the authentication instance using the Firebase app
const auth = getAuth(firebase_app);
const googleProvider = new GoogleAuthProvider();

// Function to sign in with Google
export default async function signInWithGoogle() {
  let result = null, // Variable to store the sign-in result
    error = null; // Variable to store any error that occurs

  try {
    // Configure Google provider
    googleProvider.setCustomParameters({
      prompt: 'select_account'
    });

    // Sign in with Google popup
    result = await signInWithPopup(auth, googleProvider);
  } catch (e) {
    error = e; // Catch and store any error that occurs during sign-in
  }

  return { result, error }; // Return the sign-in result and error (if any)
} 