import React from "react";
import { FaBeer, FaBriefcase, FaDesktop, FaFolder } from "react-icons/fa";
import {
  AiFillChrome,
  AiOutlineFileAdd,
  AiOutlineFolder,
} from "react-icons/ai";

function Home() {
  return (
    <div>
      <div className="breadcrumbs text-sm">
        <ul>
          <li className="flex items-center gap-1 justify-center">
            <AiOutlineFolder size={20} />
            <a>Home</a>
          </li>
          <li className="flex items-center gap-1 justify-center">
            <AiOutlineFolder size={20} />
            <a>Dashboard</a>
          </li>
          <li className="flex items-center gap-1 justify-center">
            {/* <FaFolder size={20} /> */}
            <AiOutlineFolder size={20} />
            <a>Workspace</a>
          </li>
          <li className="flex items-center gap-1 justify-center">
            <AiOutlineFileAdd />
            <a>Create new</a>
          </li>
        </ul>
      </div>

      <div className="w-full h-1/4 bg-gray-400 rounded-sm"></div>
      <div className="bg-transparent p-4 rounded-md shadow-md w-fit lg:w-1/2 mx-auto mt-10">
        <div className="flex items-center gap-2 font-bold text-lg">
          <p className="text-2xl">🗂️</p>
          <h1>add new workspace</h1>
        </div>
        <p>Fill in the form below to create a new workspace</p>
        <form className="flex flex-col gap-2">
          <label htmlFor="workspaceName">workspace's name</label>
          <input
            type="text"
            id="workspaceName"
            name="workspaceName"
            placeholder="eg. My workspace"
            className="p-2 border border-gray-300 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-950"
            required
          />

          <label htmlFor="description">description</label>
          <textarea
            id="description"
            name="description"
            className="p-2 border border-gray-300 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-950"
            placeholder="eg. This workspace is for my personal projects"
          ></textarea>

          {/* Add more fields as needed */}
          <button className="btn btn-primary bg-black hover:bg-gray-800 text-white border-none">
            Create Workspace
          </button>
        </form>
      </div>
    </div>
  );
}

export default Home;
