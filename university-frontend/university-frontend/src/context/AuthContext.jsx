// Import required React hooks and functions
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
} from "react";

/*
|--------------------------------------------------------------------------
| Create Authentication Context
|--------------------------------------------------------------------------
| This context allows us to share authentication data
| (logged-in user, login function, logout function, etc.)
| with every component without passing props manually.
*/
const AuthContext = createContext();


/*
|--------------------------------------------------------------------------
| AuthProvider Component
|--------------------------------------------------------------------------
| This component wraps the entire application and provides
| authentication-related data to all child components.
|
| Example:
|
| <AuthProvider>
|     <App />
| </AuthProvider>
|
| Any component inside App can access authentication data
| using the useAuth() custom hook.
*/
export const AuthProvider = ({ children }) => {

  /*
  ---------------------------------------------------------
  | user
  |
  | Stores the currently logged-in user's information.
  | Initially it is null because nobody is logged in.
  ---------------------------------------------------------
  */
  const [user, setUser] = useState(null);


  /*
  ---------------------------------------------------------
  | loading
  |
  | Used to know whether authentication data is still
  | being checked from localStorage.
  ---------------------------------------------------------
  */
  const [loading, setLoading] = useState(true);


  /*
  |--------------------------------------------------------------------------
  | Check Login Status
  |--------------------------------------------------------------------------
  | Runs only once when the application loads.
  |
  | Purpose:
  | If the user was already logged in previously,
  | restore their login information from localStorage.
  */
  useEffect(() => {

    // Read stored user information
    const storedUser = localStorage.getItem("user");

    // Read stored JWT token
    const token = localStorage.getItem("token");

    /*
    ------------------------------------------------------
    | If both token and user exist,
    | restore the login session.
    ------------------------------------------------------
    */
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }

    // Authentication checking is finished
    setLoading(false);

  }, []);


  /*
  |--------------------------------------------------------------------------
  | Login Function
  |--------------------------------------------------------------------------
  | Called after successful login.
  |
  | Steps:
  | 1. Save JWT token.
  | 2. Save user details.
  | 3. Update React state.
  */
  const login = (userData, token) => {

    // Save token in browser
    localStorage.setItem("token", token);

    // Save user information
    localStorage.setItem("user", JSON.stringify(userData));

    // Update current user state
    setUser(userData);
  };


  /*
  |--------------------------------------------------------------------------
  | Logout Function
  |--------------------------------------------------------------------------
  | Removes user information and token from localStorage.
  | After logout, the application treats the user
  | as unauthenticated.
  */
  const logout = () => {

    // Remove saved JWT token
    localStorage.removeItem("token");

    // Remove stored user information
    localStorage.removeItem("user");

    // Reset user state
    setUser(null);
  };


  /*
  |--------------------------------------------------------------------------
  | Provide Authentication Data
  |--------------------------------------------------------------------------
  | Every component wrapped inside AuthProvider
  | can access these values:
  |
  | user
  | login()
  | logout()
  | loading
  */
  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


/*
|--------------------------------------------------------------------------
| Custom Hook
|--------------------------------------------------------------------------
| Instead of writing:
|
| const auth = useContext(AuthContext);
|
| We simply write:
|
| const { user, login, logout } = useAuth();
|
| This makes the code cleaner and easier to read.
*/
export const useAuth = () => {
  return useContext(AuthContext);
};