'use client'
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import firebase_app from '@/firebase/config';
import { UserData, createOrGetUser } from '@/firebase/firestore/userService';

// Initialize Firebase auth instance
const auth = getAuth( firebase_app );

// Create AuthContextType with userData
interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
}

// Create the authentication context with default values
export const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true
});

// Custom hook to access the authentication context
export const useAuthContext = () => useContext( AuthContext );

interface AuthContextProviderProps {
  children: ReactNode;
}

export function AuthContextProvider( { children }: AuthContextProviderProps ): React.ReactNode {
  // Set up state to track the authenticated user and loading status
  const [ user, setUser ] = useState<User | null>( null );
  const [ userData, setUserData ] = useState<UserData | null>( null );
  const [ loading, setLoading ] = useState( true );

  useEffect( () => {
    // Subscribe to the authentication state changes
    const unsubscribe = onAuthStateChanged( auth, async (user) => {
      if ( user ) {
        // User is signed in
        setUser( user );
        
        // Get or create user data from Firestore
        try {
          const { userData, error } = await createOrGetUser(user);
          if (error) {
            console.error("Error getting user data:", error);
          } else {
            setUserData(userData);
          }
        } catch (error) {
          console.error("Error in auth state change:", error);
        }
      } else {
        // User is signed out
        setUser( null );
        setUserData( null );
      }
      
      // Set loading to false once authentication state is determined
      setLoading( false );
    } );

    // Unsubscribe from the authentication state changes when the component is unmounted
    return () => unsubscribe();
  }, [] );

  // Provide the authentication context to child components
  return (
    <AuthContext.Provider value={{ user, userData, loading }}>
      {loading ? <div>Loading...</div> : children}
    </AuthContext.Provider>
  );
}
