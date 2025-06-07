import React from "react";
import Public from "../pages/app/public-pages";
import SharedNotes from "../pages/app/public-pages/shared-notes";
import PublicNotesPage from "../pages/app/public-pages/public-notes";

const publicRoutes = {
  path: "/public",
  element: <Public />,
  children: [
    {
      path: "notes",
      element: <PublicNotesPage />,
    },
    {
      path: "notes/:note_id",
      element: <SharedNotes />,
    },
  ],
};

export default publicRoutes;
