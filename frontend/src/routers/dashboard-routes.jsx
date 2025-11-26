import React from "react";

import Dashboard from "../pages/dashboard";

// Home feature
import Home from "../features/home/pages/Home";

// Workspace feature
import Workspace from "../features/workspace/pages";
import WorkspaceOpened from "../features/workspace/pages/workspace_opened";
import Overview from "../features/workspace/pages/OpenedWorkspace/overview";
import Projects from "../features/workspace/pages/OpenedWorkspace/projects";
import StudyPlans from "../features/workspace/pages/OpenedWorkspace/study-plans";
import Tasks from "../features/workspace/pages/OpenedWorkspace/tasks";
import TodoLists from "../features/workspace/pages/OpenedWorkspace/todo-lists";
import Teams from "../features/workspace/pages/OpenedWorkspace/teams";
import Notes from "../features/workspace/pages/OpenedWorkspace/notes";
import Roadmaps from "../features/workspace/pages/OpenedWorkspace/roadmaps";
import Settings from "../features/workspace/pages/OpenedWorkspace/settings";
import StudyPlanOpened from "../features/workspace/pages/OpenedWorkspace/study-plan-open";
import OpenedNote from "../features/workspace/pages/OpenedWorkspace/Notes/opened-note";
import OpenedRoadmap from "../features/workspace/pages/OpenedWorkspace/roadmaps/opened-roadmap";

// Team feature
import Team from "../features/team/pages/Team";
import TeamOpened from "../features/team/pages/Team/team_opened";
import TeamOverview from "../features/team/pages/Team/OpenedTeam/overview";
import TeamWorkspaces from "../features/team/pages/Team/OpenedTeam/workspaces";
import Discussions from "../features/team/pages/Team/OpenedTeam/discussions";
import TeamSettings from "../features/team/pages/Team/OpenedTeam/settings";
import Resources from "../features/team/pages/Team/OpenedTeam/resources";
import TeamTodoLists from "../features/team/pages/Team/OpenedTeam/todo-lists";

// Other features
import Profile from "../features/profile/pages/Profile";
import LLMSetting from "../features/settings/pages/LlmSetting";
import Setting from "../features/settings/pages/Setting";
import Notification from "../features/notifications/pages/Notification";
import Classroom from "../features/classroom/pages/Classroom";
import OpenedClassroom from "../features/classroom/pages/Classroom/contents/opened-classroom";
import News from "../features/news/pages/News";
import AskAI from "../features/ai/pages/AskAI/askAI";

// Error pages
import ProtectedRoute from "./protected-routes";
import Unexpected from "../pages/ErrorPages/unexpected";
import WorkspaceNotFound from "../pages/ErrorPages/workspace-unexpected";

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
