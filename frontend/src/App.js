import React from "react";
import { Outlet } from "react-router-dom";
import SoccerHighlightsPage from "./Highlights/pages/SoccerHighlightsPage";

const App = () => {
  return (
    <div className="app-main-layout">
      <Outlet />
    </div>
  );
};

export default App;
