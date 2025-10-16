import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import "./index.css";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  HttpLink,
} from "@apollo/client";
import App from "./App";
import SoccerHighlightsPage from "./highlights/pages/SoccerHighlightsPage";
import { TeamsProvider } from "./highlights/context/TeamsContext";

// 1. Create the Apollo Client instance
const client = new ApolloClient({
  link: new HttpLink({
    uri: "https://lapi.traceup.com/traceid-dev/graphql",
  }),
  cache: new InMemoryCache(),
});

const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      {
        // The main page route, handles the initial / and the deep links
        path: "/:teamId?/:playerId?",
        element: <SoccerHighlightsPage />,
      },
      // Add other pages
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ApolloProvider client={client}>
    <TeamsProvider>
      <RouterProvider router={router} />
    </TeamsProvider>
  </ApolloProvider>
);
