import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes/router";
import { initSession } from "./features/auth/authSlice";
import { RootState } from "./store";

export default function App() {
  const dispatch = useDispatch<any>();
  const bootstrapped = useSelector((s: RootState) => s.auth.bootstrapped);

  useEffect(() => {
    dispatch(initSession());
  }, [dispatch]);

  if (!bootstrapped) {
    return (
      <div className="h-screen grid place-items-center text-slate-500">
        Loading…
      </div>
    );
  }

  // v7: remove the future prop completely
  return <RouterProvider router={router} />;
}
