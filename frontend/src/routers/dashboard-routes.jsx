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
import StudyPlanOpened from "../pages/dashboard/contents/Workspace/OpenedWorkspace/study-plan-open";

const dashboardRoutes = {
  path: "/app",
  errorElement: <Unexpected />,
  element: <ProtectedRoute component={Dashboard} />,
  children: [
    { path: "home", element: <ProtectedRoute component={Home} /> },
    {
      path: "workspace",
      element: <ProtectedRoute component={Workspace} />,
      children: [
        {
          path: "open/:workspaceId",
          element: <ProtectedRoute component={WorkspaceOpened} />,
          children: [
            {
              path: "overview",
              element: <ProtectedRoute component={Overview} />,
            },
            {
              path: "projects",
              element: <ProtectedRoute component={Projects} />,
            },
            {
              path: "study-plans",
              element: <ProtectedRoute component={StudyPlans} />,
            },
            {
              path: "study-plans/plan/:plan_id",
              element: <ProtectedRoute component={StudyPlanOpened} />,
            },
            { path: "tasks", element: <ProtectedRoute component={Tasks} /> },
            {
              path: "todo-lists",
              element: <ProtectedRoute component={TodoLists} />,
            },
            { path: "teams", element: <ProtectedRoute component={Teams} /> },
            { path: "notes", element: <ProtectedRoute component={Notes} /> },
            {
              path: "settings",
              element: <ProtectedRoute component={Settings} />,
            },
            { path: "*", element: <WorkspaceNotFound /> },
          ],
        },
      ],
    },
    {
      path: "team",
      element: <ProtectedRoute component={Team} />,
      children: [
        {
          path: "open/:teamId",
          element: <ProtectedRoute component={TeamOpened} />,
          children: [
            {
              path: "overview",
              element: <ProtectedRoute component={TeamOverview} />,
            },
            {
              path: "workspaces",
              element: <ProtectedRoute component={TeamWorkspaces} />,
            },
            {
              path: "discussions",
              element: <ProtectedRoute component={Discussions} />,
            },
            {
              path: "settings",
              element: <ProtectedRoute component={TeamSettings} />,
            },
            {
              path: "resources",
              element: <ProtectedRoute component={Resources} />,
            },
            {
              path: "todo-lists",
              element: <ProtectedRoute component={TeamTodoLists} />,
            },
          ],
        },
      ],
    },
    { path: "profile", element: <ProtectedRoute component={Profile} /> },
    {
      path: "notification",
      element: <ProtectedRoute component={Notification} />,
    },
    { path: "setting", element: <ProtectedRoute component={Setting} /> },
  ],
};

export default dashboardRoutes;
