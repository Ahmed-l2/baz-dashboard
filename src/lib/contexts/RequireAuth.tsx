import { useAuth } from "./AuthContext";
import Login from "../../pages/Login";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!session) return <Login />;

  return <>{children}</>;
}
