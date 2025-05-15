import React from "react";
import AddNew from "./contents/add-new";
import { ToastContainer } from "react-toastify";
import ClassroomList from "./contents/classroom-list";
import ClassroomManagement from "./management/ClassroomManagement"; // Import the new component

const Classroom = () => {
  return (
    <div>
      <ToastContainer />
      <div>
        <button
          className="btn rounded-full"
          onClick={() => document.getElementById("add_classroom").showModal()}
        >
          + Create New
        </button>
        <a href="/classroom-management" className="btn rounded-full">Manage Classroom</a> {/* Add a link to the ClassroomManagement page */}
      </div>
      <div className="flex flex-col md:flex-row">
        <div className="border m-2 p-3 rounded-md">
          <p className="font-bold ">Classroom I created</p>
          <ClassroomList requestType="created" />
        </div>
        <div className="border m-2 p-3 rounded-md">
          <p className="font-bold ">Classroom I Joined</p>
          <ClassroomList requestType="joined" />
        </div>
      </div>

      <dialog id="add_classroom" className="modal overflow-x-scroll">
        <div className="modal-box bg-white p-4 rounded-md shadow-md sm:w-fit lg:w-1/2 mx-auto mt-10 scrollbar-hide">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
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
