import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function AuthLoading() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("jwt", token);
      localStorage.setItem("jwt_expiration", Date.now() + 60 * 60 * 1000);

      navigate("/app/home"); // Redirect to the protected route AFTER setting the token
    } else {
      // Handle missing token
      navigate("/auth/login");
    }
  }, [location, navigate]);

  return <div>Loading...</div>;
}

export default AuthLoading;
