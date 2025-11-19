import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.scss";

import { store } from "./store/store.js";
import { Provider } from "react-redux";
import { PageContextProvider } from "./context/pageContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <PageContextProvider>
    <Provider store={store}>
      <App />
    </Provider>
  </PageContextProvider>
);
