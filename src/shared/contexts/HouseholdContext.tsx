import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { HouseholdService } from '../services/householdService';

// Tipos
export interface Household {
  id: string;
  name: string;
  icon?: string;
  created_at: string;
  updated_at: string;
}

interface HouseholdContextType {
  // Estado
  currentHousehold: Household | null;
  userHouseholds: Household[];
  loading: boolean;
  
  // Acciones
  setCurrentHousehold: (household: Household | null) => void;
  loadUserHouseholds: () => Promise<void>;
  refreshHouseholds: () => Promise<void>;
}

// Crear el contexto
const HouseholdContext = createContext<HouseholdContextType | undefined>(undefined);

// Hook personalizado para usar el contexto
export const useHousehold = () => {
  const context = useContext(HouseholdContext);
  if (context === undefined) {
    throw new Error('useHousehold must be used within a HouseholdProvider');
  }
  return context;
};

// Props del provider
interface HouseholdProviderProps {
  children: ReactNode;
}

// Componente provider
export const HouseholdProvider: React.FC<HouseholdProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [currentHousehold, setCurrentHousehold] = useState<Household | null>(null);
  const [userHouseholds, setUserHouseholds] = useState<Household[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar hogares del usuario
  const loadUserHouseholds = async () => {
    if (!user) {
      setUserHouseholds([]);
      setCurrentHousehold(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await HouseholdService.getUserHouseholds();
      
      if (error) {
        console.error('Error loading households:', error);
        setUserHouseholds([]);
        setCurrentHousehold(null);
        return;
      }

      if (data && data.length > 0) {
        setUserHouseholds(data);
        
        // Si no hay casa seleccionada, seleccionar la primera
        if (!currentHousehold) {
          setCurrentHousehold(data[0]);
        } else {
          // Verificar si la casa actual sigue existiendo
          const currentExists = data.find(h => h.id === currentHousehold.id);
          if (!currentExists) {
            setCurrentHousehold(data[0]);
          }
        }
      } else {
        setUserHouseholds([]);
        setCurrentHousehold(null);
      }
    } catch (error) {
      console.error('Error loading households:', error);
      setUserHouseholds([]);
      setCurrentHousehold(null);
    } finally {
      setLoading(false);
    }
  };

  // Refrescar hogares (útil después de crear/eliminar hogares)
  const refreshHouseholds = async () => {
    await loadUserHouseholds();
  };

  // Cargar hogares cuando cambie el usuario
  useEffect(() => {
    loadUserHouseholds();
  }, [user]);

  // Valor del contexto
  const contextValue: HouseholdContextType = {
    currentHousehold,
    userHouseholds,
    loading,
    setCurrentHousehold,
    loadUserHouseholds,
    refreshHouseholds,
  };

  return (
    <HouseholdContext.Provider value={contextValue}>
      {children}
    </HouseholdContext.Provider>
  );
}; 