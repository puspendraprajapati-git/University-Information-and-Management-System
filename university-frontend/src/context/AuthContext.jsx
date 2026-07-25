import React, { createContext, useContext, useState, useEffect } from 'react';
import db from '../data/db.json';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('uims_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (email, password, role) => {
    // Simulate API delay
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const foundUser = db.users.find(
          (u) => u.email === email && u.password === password
        );
        if (foundUser) {
          if (role && foundUser.role !== role) {
            reject(new Error(`Incorrect role. You are not registered as a ${role}.`));
            return;
          }
          setUser(foundUser);
          localStorage.setItem('uims_user', JSON.stringify(foundUser));
          resolve(foundUser);
        } else {
          reject(new Error('Invalid email or password'));
        }
      }, 800);
    });
  };

  const signup = async (username, email, password, role) => {
    // Simulate API delay
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const foundUser = db.users.find(u => u.email === email);
        if (foundUser) {
          reject(new Error('User with this email already exists'));
        } else {
          const newUser = {
            user_id: Date.now(),
            username,
            email,
            password,
            role: role || 'student', // Use provided role or default to student
            profile_image: 'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/1.jpg'
          };
          // For demo purposes, we push to the imported db array
          db.users.push(newUser);
          setUser(newUser);
          localStorage.setItem('uims_user', JSON.stringify(newUser));
          resolve(newUser);
        }
      }, 800);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('uims_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
