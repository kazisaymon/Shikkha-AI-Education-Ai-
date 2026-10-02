import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();
const initialState = { user: null, token: localStorage.getItem('shikkha_token'), loading: true, language: 'bn' };

function authReducer(state, action) {
  switch (action.type) {
    case 'SET_USER': return { ...state, user: action.payload, loading: false };
    case 'SET_TOKEN': return { ...state, token: action.payload };
    case 'SET_LANGUAGE': return { ...state, language: action.payload };
    case 'LOGOUT': return { ...initialState, token: null, loading: false };
    case 'STOP_LOADING': return { ...state, loading: false };
    default: return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    if (!state.token) { dispatch({ type: 'STOP_LOADING' }); return; }
    authAPI.getMe().then(({ data }) => {
      dispatch({ type: 'SET_USER', payload: data.user });
      dispatch({ type: 'SET_LANGUAGE', payload: data.user.language || 'bn' });
    }).catch(() => {
      localStorage.removeItem('shikkha_token');
      dispatch({ type: 'LOGOUT' });
    });
  }, [state.token]);

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem('shikkha_token', data.token);
    dispatch({ type: 'SET_TOKEN', payload: data.token });
    dispatch({ type: 'SET_USER', payload: data.user });
    dispatch({ type: 'SET_LANGUAGE', payload: data.user.language || 'bn' });
    return data;
  };

  const register = async (name, email, password, role, phone) => {
    const { data } = await authAPI.register({ name, email, password, role, phone });
    localStorage.setItem('shikkha_token', data.token);
    dispatch({ type: 'SET_TOKEN', payload: data.token });
    dispatch({ type: 'SET_USER', payload: data.user });
    return data;
  };

  const logout = () => { localStorage.removeItem('shikkha_token'); dispatch({ type: 'LOGOUT' }); };
  const toggleLanguage = () => dispatch({ type: 'SET_LANGUAGE', payload: state.language === 'bn' ? 'en' : 'bn' });

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, toggleLanguage }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
