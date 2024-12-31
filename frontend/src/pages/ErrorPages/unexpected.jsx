import React from "react";
import { AiFillWarning } from "react-icons/ai";
import { FaWalking } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Unexpected = () => {
  const navigate = useNavigate();
  const handleError = (e) => {
    e.preventDefault();
    alert("Your report is submitted!");
    navigate("/");
  };
  return (
    <div className="w-screen h-screen bg-white text-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* <AiFillWarning size={70} color="red" /> */}
        <img src="/ErrorPics/unexpected-warning.png" width={200} alt="" />
        <div className="text-xl font-semibold text-center">
          Error Happening!
        </div>
        <form
          onSubmit={handleError}
          className="flex flex-col gap-3 w-80 bg-gray-100 p-5 rounded-lg shadow-md items-center"
        >
          <input
            type="text"
            placeholder="Describe the issue..."
            className="input input-bordered w-full bg-transparent"
          />
          <button className="btn text-white bg-black w-fit">
            Report Error
          </button>
        </form>
      </div>
    </div>
  );
};

export default Unexpected;
