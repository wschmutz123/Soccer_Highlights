import React from "react";
import { Outlet } from "react-router-dom";

const App = () => {
  return (
    <div className="app-main-layout">
      <Outlet />
    </div>
  );
};

export default App;
