import React from "react";
import AddNew from "./contents/add-new";

const Classroom = () => {
  return (
    <div>
      <div>
        <button
          className="btn rounded-full"
          onClick={() => document.getElementById("add_classroom").showModal()}
        >
          + Create New
        </button>
      </div>
      <div></div>

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
