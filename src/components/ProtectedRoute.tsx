import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { RootState } from "../store";

export default function ProtectedRoute({
  children,
}: {
  children: JSX.Element;
}) {
  const { user, bootstrapped } = useSelector((s: RootState) => s.auth);
  if (!bootstrapped) {
    return (
      <div className="h-screen grid place-items-center text-slate-500">
        Loading…
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
