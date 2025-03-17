import { useState, useEffect } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { updateUserCoins } from '@/firebase/firestore/userService';

/**
 * Custom hook for managing user coins
 * @returns User coins and functions to update them
 */
export function useUserCoins() {
  const { user, userData } = useAuthContext();
  const [coins, setCoins] = useState<number>(0);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  
  // Update local state when userData changes
  useEffect(() => {
    if (userData) {
      setCoins(userData.coins);
    } else {
      setCoins(0);
    }
  }, [userData]);

  /**
   * Add coins to user's balance
   * @param amount Amount of coins to add
   */
  const addCoins = async (amount: number): Promise<boolean> => {
    if (!user) return false;
    
    setIsUpdating(true);
    try {
      const newCoinAmount = coins + amount;
      const { success, error } = await updateUserCoins(user.uid, newCoinAmount);
      
      if (success) {
        setCoins(newCoinAmount);
        return true;
      } else {
        console.error("Error adding coins:", error);
        return false;
      }
    } catch (error) {
      console.error("Error adding coins:", error);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Deduct coins from user's balance
   * @param amount Amount of coins to deduct
   * @returns Boolean indicating success
   */
  const useCoins = async (amount: number): Promise<boolean> => {
    if (!user) return false;
    if (coins < amount) return false; // Not enough coins
    
    setIsUpdating(true);
    try {
      const newCoinAmount = coins - amount;
      const { success, error } = await updateUserCoins(user.uid, newCoinAmount);
      
      if (success) {
        setCoins(newCoinAmount);
        return true;
      } else {
        console.error("Error using coins:", error);
        return false;
      }
    } catch (error) {
      console.error("Error using coins:", error);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    coins,
    isUpdating,
    addCoins,
    useCoins,
    hasEnoughCoins: (amount: number) => coins >= amount
  };
} 