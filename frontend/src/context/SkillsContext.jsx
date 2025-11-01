import PropTypes from 'prop-types';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const SkillsContext = createContext();

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const API_BASE_URL = BASE_URL.endsWith('/api') ? BASE_URL : `${BASE_URL}/api`;

export const SkillsProvider = ({ children }) => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch skills from backend
  const fetchSkills = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let response = await fetch(`${API_BASE_URL}/skills`);
      
      if (!response.ok && response.status === 404) {
        const alternativeUrl = BASE_URL.endsWith('/api') 
          ? BASE_URL.replace('/api', '') 
          : BASE_URL;
        response = await fetch(`${alternativeUrl}/skills`);
      }
      
      if (!response.ok) {
        throw new Error(`Failed to fetch skills: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.skills) {
        setSkills(data.skills);
      } else {
        throw new Error(data.message || 'Failed to fetch skills');
      }
    } catch (err) {
      console.error('Error fetching skills:', err);
      setError(err.message);
      setSkills([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  const getSkillById = useCallback(async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/skills/${id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch skill: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.skill) {
        return data.skill;
      } else {
        throw new Error(data.message || 'Skill not found');
      }
    } catch (err) {
      console.error('Error fetching skill:', err);
      throw err;
    }
  }, []);

  const refreshSkills = useCallback(() => {
    fetchSkills();
  }, [fetchSkills]);

  const value = {
    skills,
    loading,
    error,
    getSkillById,
    refreshSkills,
  };

  return (
    <SkillsContext.Provider value={value}>
      {children}
    </SkillsContext.Provider>
  );
};

SkillsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useSkills = () => {
  const context = useContext(SkillsContext);
  
  if (!context) {
    throw new Error('useSkills must be used within a SkillsProvider');
  }
  
  return context;
};

export default SkillsContext;
