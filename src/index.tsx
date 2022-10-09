import React from "react";
import ReactDOM from "react-dom/client";
import { createHashRouter, RouterProvider, Route } from "react-router-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import AppContainer from "./containers/app";
import FeedsContainer from "./containers/feeds";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  //<React.StrictMode>
  <AppContainer.Provider>
    <FeedsContainer.Provider>
      <RouterProvider
        router={createHashRouter([
          { path: "/mns", element: <App /> },
          { path: "/notes", element: <App /> },
          { path: "/", element: <App /> },
        ])}
      ></RouterProvider>
    </FeedsContainer.Provider>
  </AppContainer.Provider>
  //</React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
