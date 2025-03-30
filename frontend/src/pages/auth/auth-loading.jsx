import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { setAuthenticatedUser } from "../../redux/slices/authSlice";
import { jwtDecode } from "jwt-decode";

function AuthLoading() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("jwt", token);
      localStorage.setItem(
        "jwt_expiration",
        Date.now() + 30 * 24 * 60 * 60 * 1000
      );
      const data = jwtDecode(token);
      const authenticatedUser = {
        id: data.id,
        email: data.email,
        name: data.name,
      };
      dispatch(setAuthenticatedUser(authenticatedUser));

      navigate("/app/home"); // Redirect to the protected route AFTER setting the token
    } else {
      // Handle missing token
      navigate("/auth/login");
    }
  }, [location, navigate]);

  return <div>Loading...</div>;
}

export default AuthLoading;
