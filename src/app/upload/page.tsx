'use client';
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader";
import Toast from "@/components/Toast";

export default function UploadPage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<string | null>(null);
  const [recVisionLoading, setRecVisionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<{ message: string, type?: "info" | "error" | "success" } | null>(null);
  const [comment, setComment] = useState("");

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) {
      setPreview(URL.createObjectURL(f));
      setFile(f);
      setUploadedUrl(null);
      setRecommendations(null);
      setError(null);
    } else {
      setPreview(null);
      setFile(null);
      setUploadedUrl(null);
      setRecommendations(null);
      setError(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setUploadedUrl(null);
    setRecommendations(null);
    if (!file) {
      setError("Выберите файл");
      showToast("Выберите файл", "error");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Ошибка загрузки");
        showToast(data.error || "Ошибка загрузки", "error");
      } else {
        setUploadedUrl(data.url);
        setPreview(null);
        if (inputRef.current) inputRef.current.value = "";
        showToast("Фото успешно загружено!", "success");
      }
    } catch {
      setError("Ошибка сети");
    } finally {
      setLoading(false);
    }
  }

  async function handleGetVisionRecommendations() {
    if (!uploadedUrl) return;
    setRecVisionLoading(true);
    setRecommendations(null);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      // Для vision API нужен файл, а не url, поэтому повторно выбираем файл
      if (file) formData.append("file", file);
      formData.append("comment", comment);
      const res = await fetch("/api/recommend-vision", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Ошибка генерации рекомендаций");
        showToast(data.error || "Ошибка генерации рекомендаций", "error");
      } else {
        setRecommendations(data.recommendations);
        showToast("Рекомендации получены!", "success");
      }
    } catch {
      setError("Ошибка сети");
      showToast("Ошибка сети", "error");
    } finally {
      setRecVisionLoading(false);
    }
  }

  function showToast(message: string, type: "info" | "error" | "success" = "info") {
    setToast({ message, type });
  }

  // UI этапы:
  // 1. Нет файла: большая кнопка "Загрузить фото"
  // 2. Файл выбран: превью + кнопка "Отправить фото"
  // 3. Фото загружено: превью из Cloudinary + кнопка "Получить рекомендации"
  // 4. Рекомендации: показать рекомендации

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-zinc-100">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10 flex flex-col items-center border border-zinc-100">
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-3 text-green-800 tracking-tight drop-shadow-sm text-center leading-tight">Анализ растения по фото</h2>
        <p className="mb-7 text-neutral-500 text-center text-base">Загрузите фото растения, чтобы получить лаконичные рекомендации по уходу с помощью искусственного интеллекта.</p>
        {/* Этап 1: Нет файла */}
        {!file && !uploadedUrl && (
          <>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              ref={inputRef}
              id="plant-photo-input"
            />
            <label
              htmlFor="plant-photo-input"
              className="flex flex-col items-center justify-center gap-2 px-8 py-5 rounded-2xl bg-green-100 text-green-800 font-bold shadow hover:bg-green-200 hover:text-green-900 active:bg-green-300 transition cursor-pointer border-2 border-green-200 hover:border-green-400 text-lg w-full text-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mb-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-8m0 0-3 3m3-3 3 3m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Загрузить фото растения
            </label>
          </>
        )}
        {/* Этап 2: Файл выбран, но не загружен */}
        {file && !uploadedUrl && (
          <>
            <div className="flex flex-col items-center gap-2 w-full">
              <img src={preview!} alt="Превью" className="rounded-2xl shadow-lg max-h-56 mb-2 border-2 border-green-200" />
              <span className="text-green-700 text-sm font-medium mb-2">{file.name}</span>
              <textarea
                className="w-full border rounded-xl p-3 mb-2 text-green-900 text-base resize-none focus:outline-green-400"
                rows={3}
                placeholder="Комментарий (необязательно): опишите проблему, условия, когда появились симптомы и т.д."
                value={comment}
                onChange={e => setComment(e.target.value)}
                maxLength={400}
              />
              <div className="text-xs text-zinc-500 mb-2 text-left w-full">Комментарий поможет нейросети точнее диагностировать проблему. Пример: "Пятна появились после пересадки. Поливала 2 дня назад. Стоит на северном окне."</div>
              <button
                onClick={handleSubmit}
                type="button"
                className="w-full py-3 px-4 rounded-xl bg-green-700 text-white font-bold shadow hover:bg-green-800 transition disabled:opacity-60 cursor-pointer text-lg"
                disabled={loading}
              >
                {loading ? <Loader text="Загрузка..." /> : "Отправить фото"}
              </button>
              <button
                type="button"
                className="mt-2 text-green-500 underline text-sm hover:text-green-700 transition"
                onClick={() => { setFile(null); setPreview(null); setError(null); setComment(""); }}
              >
                Выбрать другое фото
              </button>
            </div>
          </>
        )}
        {/* Этап 3: Фото загружено */}
        {uploadedUrl && (
          <>
            <div className="w-full border-t border-zinc-100 my-6"></div>
            <div className="mt-2 flex flex-col items-center w-full">
              <div className="text-green-700 mb-2 font-semibold">Фото успешно загружено!</div>
              <a href={uploadedUrl} target="_blank" rel="noopener noreferrer" className="underline text-green-800 text-sm mb-2">Посмотреть в Cloudinary</a>
              <img src={uploadedUrl} alt="Загружено" className="rounded-2xl shadow max-h-56 border-2 border-green-200 mb-4" />
              <button
                onClick={handleGetVisionRecommendations}
                className="w-full py-3 px-4 rounded-xl bg-green-900 text-white font-bold shadow hover:bg-green-800 transition disabled:opacity-60 cursor-pointer text-lg"
                disabled={recVisionLoading}
              >
                {recVisionLoading ? <Loader text="Генерация рекомендаций..." /> : "Получить рекомендации"}
              </button>
              <button
                type="button"
                className="mt-2 text-green-500 underline text-sm hover:text-green-700 transition"
                onClick={() => { setFile(null); setUploadedUrl(null); setRecommendations(null); setError(null); }}
              >
                Загрузить другое фото
              </button>
            </div>
          </>
        )}
        {/* Ошибка */}
        {error && <div className="text-red-600 mt-4 text-sm text-center font-medium">{error}</div>}
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        {/* Этап 4: Рекомендации */}
        {recommendations && (
          <div className="mt-8 p-5 bg-green-50 rounded-2xl text-green-900 whitespace-pre-line w-full shadow-inner border border-green-100">
            <h3 className="font-bold mb-2 text-green-800 text-lg">Рекомендации по уходу:</h3>
            {recommendations}
          </div>
        )}
      </div>
    </main>
  );
} 