import React from "react";
import { Link } from "react-router-dom";

function SignUp() {
  return (
    <>
      <div>SignUp</div>
      <Link to={"/auth/login"}>
        <button className="btn">Login</button>
      </Link>
    </>
  );
}

export default SignUp;
