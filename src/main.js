import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { ToastProvider } from "./components/toast/ToastProvider";
import App from "./App";
import store from "./store";
import "./styles.css";
ReactDOM.createRoot(document.getElementById("root")).render(_jsx(React.StrictMode, { children: _jsx(Provider, { store: store, children: _jsx(ToastProvider, { children: _jsx(App, {}) }) }) }));
