import React from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = ({ setIsSignIn, setRoleId }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear token and roleId from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('roleId');

    setIsSignIn(false);
    setRoleId(null);

    // Redirect to SignIn page
    navigate('/');
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition duration-300"
    >
      Logout
    </button>
  );
};

export default Logout;
