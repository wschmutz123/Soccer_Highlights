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
        path: "/:teamId?/:playerId?",
        element: <SoccerHighlightsPage />,
      },
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ApolloProvider client={client}>
    <RouterProvider router={router} />
  </ApolloProvider>
);
