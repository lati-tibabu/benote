import React from "react";

import Dashboard from "../pages/dashboard";

import Home from "../pages/dashboard/contents/Home";
import Workspace from "../pages/dashboard/contents/Workspace";
import WorkspaceOpened from "../pages/dashboard/contents/Workspace/workspace_opened";

import Overview from "../pages/dashboard/contents/Workspace/OpenedWorkspace/overview";
import Projects from "../pages/dashboard/contents/Workspace/OpenedWorkspace/projects";
import StudyPlans from "../pages/dashboard/contents/Workspace/OpenedWorkspace/study-plans";
import Tasks from "../pages/dashboard/contents/Workspace/OpenedWorkspace/tasks";
import TodoLists from "../pages/dashboard/contents/Workspace/OpenedWorkspace/todo-lists";
import Teams from "../pages/dashboard/contents/Workspace/OpenedWorkspace/teams";
import Notes from "../pages/dashboard/contents/Workspace/OpenedWorkspace/notes";
import Settings from "../pages/dashboard/contents/Workspace/OpenedWorkspace/settings";

import Team from "../pages/dashboard/contents/Team";
import Profile from "../pages/dashboard/contents/Profile";
import Setting from "../pages/dashboard/contents/Setting";

import ProtectedRoute from "./protected-routes";
import Notification from "../pages/dashboard/contents/Notification";
import Unexpected from "../pages/ErrorPages/unexpected";
import WorkspaceNotFound from "../pages/ErrorPages/workspace-unexpected";

import TeamOpened from "../pages/dashboard/contents/Team/team_opened";
import TeamOverview from "../pages/dashboard/contents/Team/OpenedTeam/overview";
import TeamWorkspaces from "../pages/dashboard/contents/Team/OpenedTeam/workspaces";
import Discussions from "../pages/dashboard/contents/Team/OpenedTeam/discussions";
import TeamSettings from "../pages/dashboard/contents/Team/OpenedTeam/settings";
import Resources from "../pages/dashboard/contents/Team/OpenedTeam/resources";
import TeamTodoLists from "../pages/dashboard/contents/Team/OpenedTeam/todo-lists";

const dashboardRoutes = {
  path: "/app",
  errorElement: <Unexpected />,
  // element: <Dashboard />,
  element: <ProtectedRoute component={Dashboard} />,
  children: [
    { path: "home", element: <Home /> },
    {
      path: "workspace",
      element: <Workspace />,
      children: [
        {
          path: "open/:workspaceId",
          element: <WorkspaceOpened />,
          children: [
            { path: "overview", element: <Overview /> },
            { path: "projects", element: <Projects /> },
            { path: "study-plans", element: <StudyPlans /> },
            { path: "tasks", element: <Tasks /> },
            { path: "todo-lists", element: <TodoLists /> },
            { path: "teams", element: <Teams /> },
            { path: "notes", element: <Notes /> },
            { path: "settings", element: <Settings /> },
            { path: "*", element: <WorkspaceNotFound /> },
          ],
        },
      ],
    },
    {
      path: "team",
      element: <Team />,
      children: [
        {
          path: "open/:teamId",
          element: <TeamOpened />,
          children: [
            {
              path: "overview",
              element: <TeamOverview />,
            },
            {
              path: "workspaces",
              element: <TeamWorkspaces />,
            },
            {
              path: "discussions",
              element: <Discussions />,
            },
            {
              path: "settings",
              element: <TeamSettings />,
            },
            {
              path: "resources",
              element: <Resources />,
            },
            {
              path: "todo-lists",
              element: <TeamTodoLists />,
            },
          ],
        },
      ],
    },
    { path: "profile", element: <Profile /> },
    { path: "notification", element: <Notification /> },
    { path: "setting", element: <Setting /> },
  ],
};

export default dashboardRoutes;
