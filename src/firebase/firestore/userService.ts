import firebase_app from "../config";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { User } from "firebase/auth";

// Get the Firestore instance
const db = getFirestore(firebase_app);

// Define User interface
export interface UserData {
  uid: string;
  email: string;
  coins: number;
  createdAt: number;
  updatedAt: number;
}

/**
 * Creates a new user in Firestore or gets an existing user
 * @param user Firebase Auth user object
 * @returns User data from Firestore
 */
export async function createOrGetUser(user: User): Promise<{ userData: UserData | null, error: any }> {
  if (!user) return { userData: null, error: "No user provided" };

  try {
    // Check if user exists in Firestore
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    // If user doesn't exist, create new user with 20 coins
    if (!userDoc.exists()) {
      const newUserData: UserData = {
        uid: user.uid,
        email: user.email || "",
        coins: 20, // Initial coins for new users
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      // Add user to Firestore
      await setDoc(userDocRef, newUserData);
      return { userData: newUserData, error: null };
    }

    // If user exists, return existing user data
    const userData = userDoc.data() as UserData;
    return { userData, error: null };
  } catch (error) {
    console.error("Error creating or getting user:", error);
    return { userData: null, error };
  }
}

/**
 * Gets user data from Firestore
 * @param userId User ID
 * @returns User data from Firestore
 */
export async function getUserData(userId: string): Promise<{ userData: UserData | null, error: any }> {
  if (!userId) return { userData: null, error: "No user ID provided" };

  try {
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      return { userData: null, error: "User not found" };
    }

    const userData = userDoc.data() as UserData;
    return { userData, error: null };
  } catch (error) {
    console.error("Error getting user data:", error);
    return { userData: null, error };
  }
}

/**
 * Updates user's coin balance
 * @param userId User ID
 * @param coins New coin balance
 * @returns Updated user data
 */
export async function updateUserCoins(userId: string, coins: number): Promise<{ success: boolean, error: any }> {
  if (!userId) return { success: false, error: "No user ID provided" };

  try {
    const userDocRef = doc(db, "users", userId);
    await setDoc(userDocRef, { 
      coins, 
      updatedAt: Date.now() 
    }, { merge: true });
    
    return { success: true, error: null };
  } catch (error) {
    console.error("Error updating user coins:", error);
    return { success: false, error };
  }
} 