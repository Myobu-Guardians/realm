import React from "react";
import ReactDOM from "react-dom/client";
import { createHashRouter, RouterProvider, Route } from "react-router-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import AppContainer from "./containers/app";
import FeedsContainer from "./containers/feeds";
import "toastr/build/toastr.min.css";
import { Tab } from "./lib/types";
import ProposalsContainer from "./containers/proposals";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  //<React.StrictMode>
  <AppContainer.Provider>
    <FeedsContainer.Provider>
      <ProposalsContainer.Provider>
        <RouterProvider
          router={createHashRouter([
            { path: "mns", element: <App tab={Tab.MNS} /> },
            { path: "notes", element: <App tab={Tab.Notes} /> },
            { path: "notes/:noteId", element: <App tab={Tab.Note} /> },
            { path: "proposals", element: <App tab={Tab.Proposals}></App> },
            {
              path: "proposals/:proposalId",
              element: <App tab={Tab.Proposal}></App>,
            },
            { path: ":username", element: <App tab={Tab.User}></App> },
            { path: "/", element: <App tab={Tab.Notes} /> },
          ])}
        ></RouterProvider>
      </ProposalsContainer.Provider>
    </FeedsContainer.Provider>
  </AppContainer.Provider>
  //</React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
