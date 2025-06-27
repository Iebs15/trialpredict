import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';


const PrivateRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/check_login`, { credentials: 'include' })
      .then(response => response.json())
      .then(data => {
        setIsAuthenticated(data.logged_in);
        console.log(data.logged_in,isAuthenticated);
      })
      .catch(() => setIsAuthenticated(false)); // Handle fetch errors
  }, []);

  if (isAuthenticated === null) {
    // return <div>Loading...</div>; // Show a loading spinner or message
    return (<div className="spinner-container">
      <div className="lds-grid">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
    )
  }

  return isAuthenticated ? children : <Navigate to="/" />;
};

export default PrivateRoute;
