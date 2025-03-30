import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, Outlet } from "react-router-dom";
import { setWorkspace } from "../../../../redux/slices/workspaceSlice";

const WorkspaceOpened = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");
  const header = {
    authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const dispatch = useDispatch();
  const { workspaceId } = useParams();
  const navigate = useNavigate();

  // Get workspace from Redux store
  const workspace = useSelector((state) => state.workspace.workspace);

  const getWorkspaceDetails = async (id) => {
    try {
      const response = await fetch(`${apiURL}/api/workspaces/${id}`, {
        method: "GET",
        headers: header,
      });
      if (!response.ok) throw new Error("Failed to fetch workspace");

      const data = await response.json();
      dispatch(setWorkspace(data));
    } catch (error) {
      console.error("Error fetching workspace:", error);
    }
  };

  useEffect(() => {
    if (workspaceId) getWorkspaceDetails(workspaceId);
  }, [workspaceId]);

  useEffect(() => {
    if (workspace?.id) {
      navigate("overview");
    }
    // console.log(workspace);
  }, [workspace]);

  // const handleWorkspaceDelete = async () => {
  //   if (!window.confirm("Are you sure you want to delete this workspace?"))
  //     return;

  //   try {
  //     const response = await fetch(`${apiURL}/api/workspaces/${workspace.id}`, {
  //       method: "DELETE",
  //       headers: header,
  //     });
  //     if (!response.ok) throw new Error("Failed to delete");

  //     alert("Workspace deleted");
  //     navigate("/app/workspace", { state: { workspaceUpdate: true } });
  //   } catch (error) {
  //     console.error("Error deleting workspace:", error);
  //     alert("Failed to delete workspace");
  //   }
  // };

  // const handleNavigation = (link) => () =>
  //   navigate(link, { state: { workspace } });

  return (
    <div className="h-full flex flex-col justify-between rounded-md shadow-sm">
      <div className="grow flex flex-col">
        <div className="grow w-full">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default WorkspaceOpened;
