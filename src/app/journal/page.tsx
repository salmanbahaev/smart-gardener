'use client';
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function JournalPage() {
  const router = useRouter();
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-green-50">
      <div className="bg-white rounded shadow p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-green-800">Журнал растений</h2>
        <div className="text-green-900">
          <p>Здесь будет список ваших растений, история действий и заметки.</p>
        </div>
      </div>
    </main>
  );
} 