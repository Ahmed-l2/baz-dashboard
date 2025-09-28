import { useState } from "react";
import { useAuth } from "../lib/contexts/AuthContext";

export default function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await signIn(email, password);
    if (error) setError(error.message);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-baz" dir="rtl">
      <div className="w-full max-w-md border-4 bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* رأس مع الشعار */}
        <div className="bg-baz text-white py-8 px-6 text-center flex flex-col items-center">
          <img
            src="/assets/logo/baz-logo-bg.jpg"
            alt="شعار باز"
            className="w-16 h-16 mb-3 rounded-xl"
          />
          <h1 className="text-2xl font-bold tracking-wide">
            شركة باز العالمية للصناعة
          </h1>
        </div>

        {/* النموذج */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded px-3 py-2">
              {error}
            </p>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-baz focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              كلمة المرور
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-baz focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-baz text-white py-3 rounded-lg font-semibold hover:bg-baz/90 transition-colors"
          >
            تسجيل الدخول
          </button>
        </form>
      </div>
    </div>
  );
}
