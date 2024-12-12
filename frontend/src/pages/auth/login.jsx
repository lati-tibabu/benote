import React from "react";
import { Link } from "react-router-dom";

function Login() {
  return (
    <>
      <div>Login</div>
      <Link to={"/auth/signup"}>
        <button>Create New Account</button>
      </Link>
    </>
  );
}

export default Login;
