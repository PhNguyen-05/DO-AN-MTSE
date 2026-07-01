import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./styles/index.css";
import App from "./App.jsx";
import { store } from "./redux/store.js";


const GOOGLE_CLIENT_ID = "975944498654-d1496h08oj50qktcomef9c7kn43vav0i.apps.googleusercontent.com";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <App />
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      </GoogleOAuthProvider>

    </Provider>
  </React.StrictMode>
);
