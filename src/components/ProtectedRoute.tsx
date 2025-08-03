'use client';
import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export default function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.push("/login");
    } else {
      setIsAuthChecking(false);
    }
  }, [router]);

  // Показываем загрузку во время проверки авторизации
  if (isAuthChecking) {
    return fallback || (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-green-50">
        <div className="bg-white rounded shadow p-6 w-full max-w-md">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
            <div className="text-green-700">Проверка авторизации...</div>
          </div>
        </div>
      </main>
    );
  }

  return <>{children}</>;
} 