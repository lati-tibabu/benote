import React, { useEffect, useState } from "react";
import { AiOutlineEdit } from "react-icons/ai";
import { FaXmark } from "react-icons/fa6";
import MarkdownRenderer from "../../../../../../components/markdown-renderer";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import AddNewRoadmapItem from "./add-new-item";

const OpenedRoadmap = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");
  const header = {
    authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const userData = useSelector((state) => state.auth.user) || {};
  const { workspaceId, roadmap_id } = useParams();

  const [roadmap, setRoadmap] = useState({});
  const [refreshList, setRefreshList] = useState(false);

  const [descriptionOpened, setDescriptionOpened] = useState(false);
  const [mapDetail, setMapDetail] = useState("");
  const [mapEditMode, setMapEditMode] = useState(false);

  const handleMapOpened = (msg) => {
    setDescriptionOpened(true);
    setMapDetail(msg);
  };

  const handleMapClosed = () => {
    setDescriptionOpened(false);
    setMapEditMode(false);
  };

  const handleEditMap = () => {
    setMapEditMode(!mapEditMode);
  };

  const fetchRoadmap = async () => {
    const response = await fetch(`${apiURL}/api/roadmaps/${roadmap_id}`, {
      method: "GET",
      headers: header,
    });

    if (!response.ok) {
      console.log("Error loading roadmap");
      return;
    }

    const data = await response.json();
    setRoadmap(data);
  };

  useEffect(() => {
    fetchRoadmap();
  }, [roadmap_id, refreshList]);

  return (
    <div>
      <h1>OpenedRoadmap</h1>

      <div className="border border-black p-2 flex h-fit">
        <div className="w-full p-2 ">
          {roadmap?.roadmap_items?.map((item, i) => (
            <div
              className="w-fit max-w-96 h-fit mx-auto flex flex-col"
              //   onMouseEnter={() => handleMapOpened(item.description)}
              //   onMouseLeave={handleMouseLeave}
              key={item.id}
            >
              <div className="border-2 border-black p-3 rounded">
                <p>{item.title}</p>

                <button
                  className="text-blue-500 font-bold text-sm cursor-pointer"
                  onClick={() => handleMapOpened(item)}
                >
                  Description
                </button>
              </div>

              <div className="">
                <div className="h-7 w-[3px] bg-black mx-auto"></div>
              </div>
            </div>
          ))}

          <div className="mx-auto w-fit">
            <button
              className="btn rounded-full"
              onClick={() =>
                document.getElementById("new-roadmap-item-form").showModal()
              }
            >
              + add new
            </button>
          </div>
        </div>

        {descriptionOpened && (
          <div className="border border-gray-400 shadow-lg bg-white absolute w-96 right-5 z-10 rounded-lg p-2 max-h-96 overflow-auto">
            <div className="p-2 flex justify-between">
              <AiOutlineEdit
                className="cursor-pointer"
                onClick={handleEditMap}
              />
              <FaXmark className="cursor-pointer" onClick={handleMapClosed} />
            </div>

            {mapEditMode ? (
              <form action="">
                <fieldset className="flex flex-col relative border-2 p-4 rounded-lg">
                  <legend className="text-lg font-medium text-gray-600 mb-2">
                    Title
                  </legend>
                  <input
                    className="p-3 border rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 bg-transparent"
                    type="text"
                    value={mapDetail.title}
                  />
                </fieldset>
                <fieldset className="flex flex-col relative border-2 p-4 rounded-lg">
                  <legend className="text-lg font-medium text-gray-600 mb-2">
                    Description
                  </legend>
                  <textarea
                    className="border border-gray-300 bg-transparent"
                    name=""
                    id=""
                    value={mapDetail.description}
                  ></textarea>
                </fieldset>
              </form>
            ) : (
              <>
                <h1 className="font-semibold">{mapDetail.title}</h1>
                <MarkdownRenderer content={mapDetail.description} />
              </>
            )}
          </div>
        )}
      </div>

      <dialog id="new-roadmap-item-form" className="modal overflow-x-scroll">
        <div className="modal-box bg-white p-4 rounded-md shadow-md sm:w-fit lg:w-1/2 mx-auto mt-10">
          <form method="dialog">
            {/* if there is a button in form, it will close the modal */}
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => setRefreshList(!refreshList)}
            >
              ✕
            </button>
          </form>
          <AddNewRoadmapItem />
        </div>
      </dialog>
    </div>
  );
};

export default OpenedRoadmap;

const roadmapItems = [
  {
    id: 1,
    title: "Roadmap number 1",
    description:
      " Lorem, ipsum dolor sit amet consectetur adipisicing elit. Aliquid dolorem fugiat nostrum, voluptatum corporis magnam consectetur ratione saepe blanditiis animi quod repellendus! Ut nesciunt quibusdam quam ad autem, cum perspiciatis! Lorem ipsum dolor sit amet, consectetur adipisicing elit.",
  },
  {
    id: 2,
    title: "Roadmap number 2 Just to find out",
    description:
      " # ipsum dolor \n sit amet consectetur adipisicing elit. Aliquid dolorem fugiat nostrum, voluptatum corporis magnam consectetur ratione saepe blanditiis animi quod repellendus! Ut nesciunt quibusdam quam ad autem, cum perspiciatis! Lorem ipsum dolor sit amet, consectetur adipisicing elit.",
  },
  {
    id: 3,
    title: "Roadmap number 3 that everybody was lying",
    description:
      " dolor sit amet consectetur adipisicing elit. Aliquid dolorem fugiat nostrum, voluptatum corporis magnam consectetur ratione saepe blanditiis animi quod repellendus! Ut nesciunt quibusdam quam ad autem, cum perspiciatis! Lorem ipsum dolor sit amet, consectetur adipisicing elit.",
  },
  {
    id: 4,
    title: "Roadmap fixer",
    description:
      " sit amet consectetur adipisicing elit. Aliquid dolorem fugiat nostrum, voluptatum corporis magnam consectetur ratione saepe blanditiis animi quod repellendus! Ut nesciunt quibusdam quam ad autem, cum perspiciatis! Lorem ipsum dolor sit amet, consectetur adipisicing elit.",
  },
  {
    id: 5,
    title:
      "sit amet consectetur adipisicing elit. Aliquid dolorem fugiat nostrum, voluptatum corporis magnam consectetur ratione saepe blanditiis animi quod repellendus! Ut nesciunt quibusdam quam ad autem, cum perspiciatis! Lorem ipsum dolor sit amet, consectetur adipisicing elit.",
    description:
      " sit amet consectetur adipisicing elit. Aliquid dolorem fugiat nostrum, voluptatum corporis magnam consectetur ratione saepe blanditiis animi quod repellendus! Ut nesciunt quibusdam quam ad autem, cum perspiciatis! Lorem ipsum dolor sit amet, consectetur adipisicing elit.",
  },
];
