import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole }) => {
  const location = useLocation();
  const userType = localStorage.getItem('userType');
  const token = localStorage.getItem('authToken');

  if (!token) {
    // Redirect to login page, saving the current location they came from
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && userType !== requiredRole) {
    // Redirect to unauthorized page if role doesn't match
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  // If all checks pass, render the child components
  return children;
};

export default ProtectedRoute;