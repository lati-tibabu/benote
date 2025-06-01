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
import Roadmaps from "../pages/dashboard/contents/Workspace/OpenedWorkspace/roadmaps";
import Settings from "../pages/dashboard/contents/Workspace/OpenedWorkspace/settings";

import Team from "../pages/dashboard/contents/Team";
import Profile from "../pages/dashboard/contents/Profile";
import LLMSetting from "../pages/dashboard/contents/LlmSetting";
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
import OpenedNote from "../pages/dashboard/contents/Workspace/OpenedWorkspace/Notes/opened-note";
import OpenedRoadmap from "../pages/dashboard/contents/Workspace/OpenedWorkspace/roadmaps/opened-roadmap";

import Classroom from "../pages/dashboard/contents/Classroom";
import OpenedClassroom from "../pages/dashboard/contents/Classroom/contents/opened-classroom";
import News from "../pages/dashboard/contents/News";
import AskAI from "../pages/dashboard/contents/AskAI/askAI";

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
              path: "notes/:note_id",
              element: <ProtectedRoute component={OpenedNote} />,
            },
            {
              path: "roadmaps",
              element: <ProtectedRoute component={Roadmaps} />,
            },
            {
              path: "roadmaps/:roadmap_id",
              element: <ProtectedRoute component={OpenedRoadmap} />,
            },
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
    {
      path: "classroom",
      element: <ProtectedRoute component={Classroom} />,
    },
    {
      path: "classroom/:classroomId",
      element: <ProtectedRoute component={OpenedClassroom} />,
    },
    {
      path: "news",
      element: <ProtectedRoute component={News} />,
    },
    { path: "profile", element: <ProtectedRoute component={Profile} /> },
    {
      path: "llm-setting",
      element: <ProtectedRoute component={LLMSetting} />,
    },
    {
      path: "notifications",
      element: <ProtectedRoute component={Notification} />,
    },
    { path: "setting", element: <ProtectedRoute component={Setting} /> },
    { path: "askAI", element: <ProtectedRoute component={AskAI} /> },
  ],
};

export default dashboardRoutes;
