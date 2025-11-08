import { useAuth } from "./AuthContext";
import { Loader2 } from "../../components/loader-0";
import Login from "../../pages/Login";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) return <Loader2 />; // your dashboard loader

  // No session => redirect to login
  if (!session) return <Login />;

  return <>{children}</>;
}
