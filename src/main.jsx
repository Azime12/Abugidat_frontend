import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { Provider } from "react-redux";
import { store } from "./app/store";
import { TelegramProvider } from "./contexts/TelegramContext.jsx";
import "./index.css";
import "./translations/index.js";
import { BrowserRouter } from "react-router-dom";

const root = createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <TelegramProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </TelegramProvider>
  </Provider>
);
