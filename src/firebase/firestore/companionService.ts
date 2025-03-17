import firebase_app from "../config";
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { uploadImage } from "../storage/uploadImage";

// Get the Firestore instance
const db = getFirestore(firebase_app);

// Define companion interface
export interface CompanionData {
  id: string;
  userId: string;
  name: string;
  type: string;
  gender: string;
  age: string;
  ethnicity: string;
  eyeColor: string;
  hairColor: string;
  hairStyle: string;
  bodyShape: string;
  breastSize?: string;
  buttSize: string;
  personality: string[];
  facePrompt: string;
  bodyPrompt: string;
  faceImageUrl: string;
  bodyImageUrl: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * Creates a new companion in Firestore
 * @param userId The ID of the user creating the companion
 * @param companionData The companion data to save
 * @param faceImage The face image URL to save
 * @param bodyImage The body image URL to save
 * @returns The newly created companion data
 */
export async function createCompanion(
  userId: string,
  companionData: Omit<CompanionData, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'faceImageUrl' | 'bodyImageUrl'>,
  faceImage: string,
  bodyImage: string
): Promise<{ companion: CompanionData | null, error: any }> {
  try {
    // Generate a unique ID for the companion
    const companionId = `${userId}_${Date.now()}`;
    
    // Upload images to Firebase Storage
    const faceImagePath = `companions/${userId}/${companionId}/face.jpg`;
    const bodyImagePath = `companions/${userId}/${companionId}/body.jpg`;
    
    // Upload face image
    const { url: faceImageUrl, error: faceUploadError } = await uploadImage(faceImage, faceImagePath);
    if (faceUploadError) {
      console.error("Error uploading face image:", faceUploadError);
      return { companion: null, error: "Failed to upload face image" };
    }
    
    // Upload body image
    const { url: bodyImageUrl, error: bodyUploadError } = await uploadImage(bodyImage, bodyImagePath);
    if (bodyUploadError) {
      console.error("Error uploading body image:", bodyUploadError);
      return { companion: null, error: "Failed to upload body image" };
    }
    
    // Create the companion data object
    const timestamp = Date.now();
    const newCompanion: CompanionData = {
      id: companionId,
      userId,
      ...companionData,
      faceImageUrl: faceImageUrl || '',
      bodyImageUrl: bodyImageUrl || '',
      createdAt: timestamp,
      updatedAt: timestamp
    };
    
    // Save to Firestore
    const companionRef = doc(db, "companions", companionId);
    await setDoc(companionRef, newCompanion);
    
    return { companion: newCompanion, error: null };
  } catch (error) {
    console.error("Error creating companion:", error);
    return { companion: null, error };
  }
}

/**
 * Gets all companions for a user
 * @param userId The ID of the user
 * @returns An array of the user's companions
 */
export async function getUserCompanions(userId: string): Promise<{ companions: CompanionData[], error: any }> {
  try {
    // Query Firestore for all companions belonging to the user
    const companionsRef = collection(db, "companions");
    const q = query(companionsRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    // Map the results to an array of companions
    const companions: CompanionData[] = [];
    querySnapshot.forEach((doc) => {
      companions.push(doc.data() as CompanionData);
    });
    
    return { companions, error: null };
  } catch (error) {
    console.error("Error getting user companions:", error);
    return { companions: [], error };
  }
}

/**
 * Gets a companion by ID
 * @param companionId The ID of the companion
 * @returns The companion data
 */
export async function getCompanion(companionId: string): Promise<{ companion: CompanionData | null, error: any }> {
  try {
    // Get the companion document
    const companionRef = doc(db, "companions", companionId);
    const companionDoc = await getDoc(companionRef);
    
    if (!companionDoc.exists()) {
      return { companion: null, error: "Companion not found" };
    }
    
    // Return the companion data
    return { companion: companionDoc.data() as CompanionData, error: null };
  } catch (error) {
    console.error("Error getting companion:", error);
    return { companion: null, error };
  }
} 