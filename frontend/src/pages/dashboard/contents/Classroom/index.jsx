import React from "react";
import AddNew from "./contents/add-new";
import { ToastContainer } from "react-toastify";
import ClassroomList from "./contents/classroom-list";
import ClassroomManagement from "./management/ClassroomManagement"; // Import the new component

const Classroom = () => {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <ToastContainer />
      <div className="flex justify-end mb-4">
        <button
          className="btn bg-blue-600 text-white px-6 py-2 rounded-full shadow-md hover:bg-blue-700 transition"
          onClick={() => document.getElementById("add_classroom").showModal()}
        >
          + Create New
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 shadow-md p-6 rounded-lg">
          <p className="font-bold text-lg mb-4">Classroom I created</p>
          <ClassroomList requestType="created" />
        </div>
        <div className="bg-white border border-gray-200 shadow-md p-6 rounded-lg">
          <p className="font-bold text-lg mb-4">Classroom I Joined</p>
          <ClassroomList requestType="joined" />
        </div>
      </div>

      <dialog id="add_classroom" className="modal">
        <div className="modal-box bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl mx-auto">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 text-gray-500 hover:text-gray-800">
              ✕
            </button>
          </form>
          <AddNew />
        </div>
      </dialog>
    </div>
  );
};

export default Classroom;
