import firebase_app from "../config";
import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";

// Get Firebase Storage instance
const storage = getStorage(firebase_app);

/**
 * Uploads a base64 or URL image to Firebase Storage
 * @param imageData URL or Base64 string of the image
 * @param path Path in storage where to save the image
 * @returns Download URL of the uploaded image
 */
export async function uploadImage(imageData: string, path: string): Promise<{url: string | null, error: any}> {
  try {
    // Create a reference to the storage location
    const storageRef = ref(storage, path);
    
    // Determine if this is a URL or a base64 string
    let uploadResult;
    
    if (imageData.startsWith('data:')) {
      // Upload as base64 data URL
      uploadResult = await uploadString(storageRef, imageData, 'data_url');
    } else {
      // For external URLs, fetch the image first, then upload as base64
      try {
        const response = await fetch(imageData);
        const blob = await response.blob();
        
        // Convert blob to base64
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
        
        const base64Data = await base64Promise;
        uploadResult = await uploadString(storageRef, base64Data, 'data_url');
      } catch (error) {
        console.error("Error fetching external image:", error);
        return { url: null, error: "Failed to fetch external image" };
      }
    }
    
    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);
    
    return { url: downloadURL, error: null };
  } catch (error) {
    console.error("Error uploading image:", error);
    return { url: null, error };
  }
} 