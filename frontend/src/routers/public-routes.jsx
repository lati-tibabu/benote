import React from "react";
import Public from "../pages/app/public-pages";
import SharedNotes from "../pages/app/public-pages/shared-notes";

const publicRoutes = {
  path: "/public",
  element: <Public />,
  children: [
    {
      path: "notes/:note_id",
      element: <SharedNotes />,
    },
  ],
};

export default publicRoutes;
