import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ component: Component, ...rest }) => {
  const [exp, setExp] = useState(false);
  const handleExpireToken = () => {
    localStorage.removeItem("jwt");
    localStorage.removeItem("jwt_expiration");
  };

  useEffect(() => {
    const storedExpiration = localStorage.getItem("jwt_expiration");
    if (storedExpiration) {
      const expirationTime = new Date(parseInt(storedExpiration));
      if (expirationTime < new Date()) {
        handleExpireToken();
        setExp(true);
      }
    }
  });
  const token = localStorage.getItem("jwt");

  return !exp && token ? (
    <Component {...rest} />
  ) : (
    <Navigate to="/auth/login" />
  );
};

export default ProtectedRoute;
