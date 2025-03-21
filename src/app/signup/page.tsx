'use client'
import signUp from "@/firebase/auth/signup";
import signInWithGoogle from "@/firebase/auth/googleAuth";
import { useRouter } from 'next/navigation';
import { useState } from "react";
import Link from 'next/link';
import React from 'react';
import { createOrGetUser } from "@/firebase/firestore/userService";
import { getAuth } from "firebase/auth";
import firebase_app from "@/firebase/config";

// Define Firebase error type
interface FirebaseError {
  code?: string;
  message?: string;
}

// Get the auth instance
const auth = getAuth(firebase_app);

function Page(): React.ReactNode {
  const [ email, setEmail ] = useState( '' );
  const [ password, setPassword ] = useState( '' );
  const [ confirmPassword, setConfirmPassword ] = useState( '' );
  const [ error, setError ] = useState<string | null>( null );
  const [ isLoading, setIsLoading ] = useState( false );
  const router = useRouter();

  const handleForm = async ( event: { preventDefault: () => void } ) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      // Attempt to sign up with provided email and password
      const { result, error } = await signUp( email, password );

      if ( error ) {
        // Handle specific Firebase errors
        const firebaseError = error as FirebaseError;
        const errorMessage = 
          firebaseError.code === 'auth/email-already-in-use'
            ? 'This email is already registered. Try signing in instead.'
            : firebaseError.code === 'auth/invalid-email'
              ? 'Invalid email format. Please check your email.'
              : firebaseError.code === 'auth/weak-password'
                ? 'Password is too weak. Please use a stronger password.'
                : firebaseError.message || 'An error occurred. Please try again.';
        
        setError(errorMessage);
        console.log(error);
        return;
      }

      // Create user in Firestore with 20 initial coins
      if (result && result.user) {
        try {
          const { userData, error: userError } = await createOrGetUser(result.user);
          
          if (userError) {
            console.error("Error creating user data:", userError);
            setError("Account created but there was an issue setting up your profile.");
            return;
          }
          
          console.log("User created with data:", userData);
        } catch (err) {
          console.error("Error in user creation:", err);
          setError("Account created but there was an issue setting up your profile.");
          return;
        }
      }

      // Redirect to the dashboard page
      router.push( "/dashboard" );
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleGoogleSignUp = async () => {
    setError(null);
    setIsLoading(true);
    
    try {
      const { result, error } = await signInWithGoogle();
      
      if (error) {
        // Handle specific Firebase errors
        const firebaseError = error as FirebaseError;
        const errorMessage = 
          firebaseError.code === 'auth/popup-closed-by-user'
            ? 'Google sign-up was cancelled. Please try again.'
            : firebaseError.code === 'auth/popup-blocked'
              ? 'Pop-up was blocked by the browser. Please allow pop-ups for this site.'
              : firebaseError.message || 'An error occurred during Google sign-up. Please try again.';
        
        setError(errorMessage);
        console.log(error);
        return;
      }
      
      // Google sign-up successful
      console.log(result);
      
      // Create user in Firestore with 20 initial coins
      if (result && result.user) {
        try {
          const { userData, error: userError } = await createOrGetUser(result.user);
          
          if (userError) {
            console.error("Error creating user data:", userError);
            setError("Account created but there was an issue setting up your profile.");
            return;
          }
          
          console.log("User created with data:", userData);
        } catch (err) {
          console.error("Error in user creation:", err);
          setError("Account created but there was an issue setting up your profile.");
          return;
        }
      }
      
      // Redirect to the dashboard page
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-600 mt-2">Sign up to start using DeepLuv</p>
        </div>
        
        <div className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleForm} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
                Email
              </label>
              <input
                onChange={( e ) => setEmail( e.target.value )}
                required
                type="email"
                name="email"
                id="email"
                placeholder="example@mail.com"
                className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
                Password
              </label>
              <input
                onChange={( e ) => setPassword( e.target.value )}
                required
                type="password"
                name="password"
                id="password"
                placeholder="********"
                minLength={6}
                className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-bold mb-2">
                Confirm Password
              </label>
              <input
                onChange={( e ) => setConfirmPassword( e.target.value )}
                required
                type="password"
                name="confirmPassword"
                id="confirmPassword"
                placeholder="********"
                minLength={6}
                className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded transition duration-200 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </div>

            <div className="relative flex items-center justify-center mt-4">
              <div className="border-t border-gray-300 w-full"></div>
              <div className="text-gray-500 px-3 text-sm bg-white">Or</div>
              <div className="border-t border-gray-300 w-full"></div>
            </div>
            
            <div>
              <button
                type="button"
                onClick={handleGoogleSignUp}
                disabled={isLoading}
                className={`w-full flex items-center justify-center bg-white border border-gray-300 rounded-md py-3 px-4 text-gray-700 hover:bg-gray-50 transition duration-200 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                {isLoading ? 'Processing...' : 'Continue with Google'}
              </button>
            </div>
            
            <div className="text-sm text-center text-gray-600 mt-4">
              <p>Already have an account? <Link href="/signin" className="text-blue-500 hover:text-blue-700">Sign in</Link></p>
            </div>
            
            <div className="text-xs text-gray-500 text-center mt-6">
              By signing up, you confirm that you are at least 18 years of age and agree to our Terms of Service and Privacy Policy.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Page;
