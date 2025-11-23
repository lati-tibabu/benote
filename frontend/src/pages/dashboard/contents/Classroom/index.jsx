import React from "react";
import AddNew from "./contents/add-new";
import { ToastContainer } from "react-toastify";
import ClassroomList from "./contents/classroom-list";
import ClassroomManagement from "./management/ClassroomManagement"; // Import the new component

const Classroom = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-50 p-8">
      <ToastContainer />
      <div className="flex justify-end mb-8">
        <button
          className="px-7 py-2 rounded-sm bg-gray-600 text-white font-semibold shadow-sm hover:bg-gray-700 transition text-lg"
          onClick={() => document.getElementById("add_classroom").showModal()}
        >
          + Create New
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
        <div className="bg-white border border-gray-100 shadow-sm p-8 rounded-sm flex flex-col">
          <p className="font-bold text-2xl mb-6 text-gray-800 tracking-tight">
            Classrooms I Created
          </p>
          <ClassroomList requestType="created" />
        </div>
        <div className="bg-white border border-gray-100 shadow-sm p-8 rounded-sm flex flex-col">
          <p className="font-bold text-2xl mb-6 text-gray-800 tracking-tight">
            Classrooms I Joined
          </p>
          <ClassroomList requestType="joined" />
        </div>
      </div>

      <dialog id="add_classroom" className="modal">
        <div className="modal-box bg-white p-8 rounded-sm shadow-sm w-full max-w-2xl mx-auto relative">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-6 top-6 text-gray-400 hover:text-gray-700 text-xl font-bold">
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
