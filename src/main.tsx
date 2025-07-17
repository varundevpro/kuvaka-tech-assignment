import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import "./index.css";

import { Dashboard } from "./pages/Dashboard";
import { Chatroom } from "./pages/Chatroom";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { AuthLayout } from "./layouts/AuthLayout";
import { Home } from "./pages/Home";
import { NotFound } from "./pages/NotFound";

import { RootLayout } from "./layouts/RootLayout";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

import { Provider } from "react-redux";
import { persistor, store } from "./app/store";
import { PersistGate } from "redux-persist/integration/react";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          <BrowserRouter>
            <Routes>
              <Route element={<RootLayout />}>
                <Route index element={<Home />} />
                {/* <Route path="about" element={<About />} /> */}

                <Route element={<AuthLayout />}>
                  <Route path="login" element={<Login />} />
                  <Route path="register" element={<Register />} />
                </Route>

                <Route path="chatrooms">
                  <Route index element={<Dashboard />} />
                  <Route path=":chatroom" element={<Chatroom />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
      </PersistGate>
    </Provider>

    <Toaster closeButton />
  </StrictMode>
);
