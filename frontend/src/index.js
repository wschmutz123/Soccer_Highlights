import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import "./index.css";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import App from "./App";
import SoccerHighlightsPage from "./Highlights/pages/SoccerHighlightsPage";

// 1. Create the Apollo Client instance
const client = new ApolloClient({
  uri: "https://lapi.traceup.com/traceid-dev/graphql",
  cache: new InMemoryCache(),
});

const router = createBrowserRouter([
  {
    // App can serve as a layout wrapper if needed, or you can go straight to the page
    element: <App />,
    children: [
      {
        // The main page route, handles the initial / and the deep links
        path: "/:teamId?/:playerId?",
        element: <SoccerHighlightsPage />,
      },
      // You could add other pages here later
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ApolloProvider client={client}>
    <RouterProvider router={router} />
  </ApolloProvider>
);
