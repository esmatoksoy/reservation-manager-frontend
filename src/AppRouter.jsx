import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import ErrorBoundary from "./ErrorBoundary";
import AdminLogin from "./components/AdminLogin";
import RootHandler from "./RootHandler";

const appRouter = createBrowserRouter([
  {
    path: "/admin/login",
    element: <AdminLogin />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/guest-form/:requestId",
    element: <App />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/",
    element: <RootHandler />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/reservations/create",
    element: <App />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "*",
    element: <div>Page not found</div>,
  },
]);

export default appRouter;