import { useEffect } from 'react';
import { router } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { HouseholdService } from '../services/householdService';

import { logger } from '../utils/logger';
export const useAuthNavigation = () => {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    const checkUserHouseholds = async () => {
      if (!user) {
        router.replace('/auth');
        return;
      }

      try {
        const { data: households, error } = await HouseholdService.getUserHouseholds();
        
        if (error) {
          logger.error('Error checking households:', error);
          router.replace('/welcome');
          return;
        }

        if (households && households.length > 0) {
          router.replace('/(tabs)');
        } else {
          router.replace('/welcome');
        }
      } catch (error) {
        logger.error('Error in navigation check:', error);
        router.replace('/welcome');
      }
    };

    checkUserHouseholds();
  }, [user, loading]);
}; 