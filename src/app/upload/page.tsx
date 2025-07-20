'use client';
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader";
import Toast from "@/components/Toast";
import VoiceMessagePlayer from "@/components/VoiceMessagePlayer";

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
  type ChatMessage = { role: "user" | "assistant"; content: string; audio?: string };
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [chatMode, setChatMode] = useState<'text' | 'voice'>('text');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [recording, setRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // блокировка кнопки во время stop
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    console.log('handleFileChange called');
    const f = e.target.files?.[0];
    if (f) {
      setPreview(URL.createObjectURL(f));
      setFile(f);
      setUploadedUrl(null);
      setRecommendations(null);
      setError(null);
      // handleSubmit с передачей файла напрямую
      setTimeout(() => {
        handleSubmitWithFile(f);
      }, 0);
    } else {
      setPreview(null);
      setFile(null);
      setUploadedUrl(null);
      setRecommendations(null);
      setError(null);
    }
  }

  async function handleSubmitWithFile(selectedFile: File) {
    console.log('handleSubmitWithFile called, file:', selectedFile);
    setError(null);
    setUploadedUrl(null);
    setRecommendations(null);
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", selectedFile);
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      console.log('Upload response:', res.status, data);
      if (!res.ok) {
        setError(data.error || "Ошибка загрузки");
        showToast(data.error || "Ошибка загрузки", "error");
      } else {
        setUploadedUrl(data.url);
        setPreview(null);
        if (inputRef.current) inputRef.current.value = "";
        showToast("Фото успешно загружено!", "success");
      }
    } catch (err) {
      setError("Ошибка сети");
      console.log('Upload error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleGetVisionRecommendations() {
    if (!file) return;
    setRecVisionLoading(true);
    setRecommendations(null);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", file);
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

  // После получения рекомендаций — инициализируем чат
  useEffect(() => {
    if (recommendations && chatHistory.length === 0) {
      setChatHistory([
        { role: "assistant", content: recommendations }
      ]);
    }
    // scroll to end
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [recommendations, chatHistory.length]);

  async function handleSendChat() {
    if (!chatInput.trim()) return;
    const newHistory = [...chatHistory, { role: "user" as const, content: chatInput }];
    setChatHistory(newHistory);
    setChatInput("");
    setChatLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history: newHistory }),
      });
      const data = await res.json();
      if (res.ok) {
        setChatHistory(h => [...h, { role: "assistant" as const, content: data.answer }]);
      }
    } finally {
      setChatLoading(false);
      setTimeout(() => {
        if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }

  function renderChatMessage(content: string) {
    // Удаляем markdown-заголовки и делаем их жирными
    let lines = content.split(/\r?\n/);
    return (
      <div className="whitespace-pre-line">
        {lines.map((line, i) => {
          // Заголовки: **Текст** или - **Текст**
          const boldMatch = line.match(/^\s*-?\s*\*\*(.+?)\*\*:?\s*$/);
          if (boldMatch) {
            return <div key={i} className="font-bold mt-2 mb-1">{boldMatch[1]}</div>;
          }
          // Списки: - текст
          if (/^\s*-\s+/.test(line)) {
            return <div key={i} className="pl-4 relative"><span className="absolute left-0">•</span> {line.replace(/^\s*-\s+/, "")}</div>;
          }
          // Просто текст
          return <div key={i}>{line.replace(/\*\*/g, "")}</div>;
        })}
      </div>
    );
  }

  // UI для голосового режима
  async function handleStartRecording() {
    if (recording || isProcessing) return;
    if (!navigator.mediaDevices?.getUserMedia) return;
    setRecording(true);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new window.MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    const chunks: BlobPart[] = [];
    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'audio/webm' });
      setAudioBlob(blob);
      setAudioUrl(URL.createObjectURL(blob));
      setRecording(false);
      setIsProcessing(false);
      handleSendVoice(blob); // передаём blob напрямую
    };
    mediaRecorder.onstart = () => setRecording(true);
    mediaRecorder.start();
  }
  function handleStopRecording() {
    if (!recording || isProcessing) return;
    setIsProcessing(true);
    mediaRecorderRef.current?.stop();
  }
  async function handleSendVoice(blobParam?: Blob) {
    const blobToSend = blobParam || audioBlob;
    if (!blobToSend) return;
    setChatLoading(true);
    // Сразу отображаем bubble пользователя
    const localAudioUrl = audioUrl || URL.createObjectURL(blobToSend);
    setChatHistory(h => [
      ...h,
      { role: 'user', content: '[Голосовое сообщение]', audio: localAudioUrl }
    ]);
    const formData = new FormData();
    formData.append('audio', blobToSend, 'voice.webm');
    // Фильтруем историю: только role и content, исключаем голосовые сообщения и пустые/некорректные content
    const filteredHistory = chatHistory
      .filter(msg => typeof msg.content === 'string' && msg.content && msg.content !== '[Голосовое сообщение]')
      .map(({ role, content }) => ({ role, content }));
    formData.append('history', JSON.stringify(filteredHistory));
    const res = await fetch('/api/chat-voice', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (res.ok) {
      setChatHistory(h => [
        ...h,
        { role: 'assistant', content: data.answer, audio: data.audioUrl || undefined }
      ]);
      setAudioUrl(null);
      setAudioBlob(null);
    }
    setChatLoading(false);
    setTimeout(() => {
      if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }

  // Кнопка записи: старт/стоп
  function handleRecordButton() {
    if (recording) {
      handleStopRecording();
    } else {
      handleStartRecording();
    }
  }

  // Новая логика: клик по микрофону — старт/стоп записи
  function handleMicButton() {
    if (recording && !isProcessing) {
      handleStopRecording();
    } else if (!recording && !isProcessing) {
      handleStartRecording();
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-zinc-100">
      <div className="w-full max-w-md bg-white/30 backdrop-blur-md border border-green-300/60 rounded-2xl shadow-2xl p-10 flex flex-col items-center my-8 animate-fade-in">
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
            {/* Кнопка загрузки из галереи */}
            <label
              htmlFor="plant-photo-input"
              className="flex flex-col items-center justify-center gap-2 px-8 py-5 rounded-2xl bg-green-100 text-green-800 font-bold shadow hover:bg-green-200 hover:text-green-900 active:bg-green-300 transition cursor-pointer border-2 border-green-200 hover:border-green-400 text-lg w-full text-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mb-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-8m0 0-3 3m3-3 3 3m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Загрузить фото растения
            </label>
            {/* Кнопка сделать фото (только для мобильных устройств) */}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
              id="plant-photo-camera-input"
            />
            <label
              htmlFor="plant-photo-camera-input"
              className="flex flex-col items-center justify-center gap-1.5 px-8 py-5 rounded-2xl bg-green-50 text-green-700 font-bold shadow hover:bg-green-100 hover:text-green-900 active:bg-green-200 transition cursor-pointer border-2 border-green-100 hover:border-green-300 text-lg w-full text-center mt-3 md:hidden"
              style={{ display: 'block' }}
            >
              {/* Иконка камеры */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mb-1 mx-auto">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5A2.25 2.25 0 015.25 5.25h1.086a2.25 2.25 0 001.591-.659l.828-.828A2.25 2.25 0 0110.914 3h2.172a2.25 2.25 0 011.591.659l.828.828a2.25 2.25 0 001.591.659h1.086A2.25 2.25 0 0121 7.5v9A2.25 2.25 0 0118.75 18.75h-13.5A2.25 2.25 0 013 16.5v-9z" />
                <circle cx="12" cy="13" r="3.25" />
              </svg>
              Сделать фото
            </label>
          </>
        )}
        {/* Этап 2: Файл выбран, но не загружен */}
        {file && !uploadedUrl && (
          <>
            <div className="flex flex-col items-center gap-2 w-full">
              <img src={preview!} alt="Превью" className="rounded-2xl shadow-lg max-h-56 mb-2 border-2 border-green-200" />
              <span className="text-green-700 text-sm font-medium mb-2">{file.name}</span>
              {/* Loader для загрузки фото */}
              {loading && (
                <div className="w-full flex justify-center my-2">
                  <Loader text="Загрузка фото..." />
                </div>
              )}
              {/* Явный вывод ошибки */}
              {error && <div className="text-red-600 mt-2 text-sm text-center font-medium">{error}</div>}
              <button
                type="button"
                className="mt-2 text-green-500 underline text-sm hover:text-green-700 transition"
                onClick={() => { setFile(null); setPreview(null); setError(null); }}
                disabled={loading}
              >
                Выбрать другое фото
              </button>
            </div>
          </>
        )}
        {/* Этап 3: Фото загружено */}
        {uploadedUrl && (
          <>
            <div className="mt-2 flex flex-col items-center w-full">
              <div className="text-green-700 mb-2 font-semibold">Фото успешно загружено!</div>
              <a href={uploadedUrl} target="_blank" rel="noopener noreferrer" className="underline text-green-800 text-sm mb-2">Посмотреть в Cloudinary</a>
              <img src={uploadedUrl} alt="Загружено" className="rounded-2xl shadow max-h-56 border-2 border-green-200 mb-2" />
              <button
                onClick={handleGetVisionRecommendations}
                className="w-full py-3 px-4 rounded-xl bg-green-900 text-white font-bold shadow hover:bg-green-800 transition disabled:opacity-60 cursor-pointer text-lg mb-2"
                disabled={recVisionLoading}
              >
                {recVisionLoading ? <Loader text="Анализ растения..." /> : "Получить рекомендации"}
              </button>
              <button
                type="button"
                className="text-green-500 underline text-sm hover:text-green-700 transition"
                onClick={() => { setFile(null); setUploadedUrl(null); setRecommendations(null); setError(null); }}
                disabled={recVisionLoading}
              >
                Выбрать другое фото
              </button>
            </div>
          </>
        )}
        {/* Ошибка */}
        {error && <div className="text-red-600 mt-4 text-sm text-center font-medium">{error}</div>}
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        {/* Этап 4: Рекомендации и чат */}
        {recommendations && (
          <div className="mt-8 w-full">
            {/* Чат с ботом */}
            <div className="max-h-64 overflow-y-auto flex flex-col gap-2 mb-2 bg-white rounded-lg p-3 border border-green-100">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`rounded-xl px-3 py-2 max-w-[80%] text-sm shadow ${msg.role === "user" ? "bg-green-200 text-green-900" : "bg-green-700 text-white"}`}>
                    <span className="mr-2 align-middle">{msg.role === "user" ? "🧑" : "🌱"}</span>
                    {msg.audio ? (
                      <VoiceMessagePlayer src={msg.audio} />
                    ) : (
                      renderChatMessage(msg.content)
                    )}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            {/* Новая форма отправки в стиле мессенджеров */}
            <div className="flex gap-2 items-center mt-2">
              <input
                type="text"
                className="flex-1 border rounded-lg px-3 py-2 text-green-900 focus:outline-green-400"
                placeholder="Сообщение..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && chatInput.trim()) handleSendChat(); }}
                disabled={chatLoading || recording}
              />
              {chatInput.trim() ? (
                <button
                  onClick={handleSendChat}
                  className="bg-green-700 hover:bg-green-800 text-white rounded-full w-10 h-10 flex items-center justify-center transition"
                  disabled={chatLoading}
                  aria-label="Отправить"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M3 20L21 12L3 4V10L17 12L3 14V20Z" fill="currentColor"/></svg>
                </button>
              ) : (
                <button
                  onClick={handleMicButton}
                  className={`bg-green-600 hover:bg-green-700 text-white rounded-full w-10 h-10 flex items-center justify-center transition flex-shrink-0 ${recording ? 'ring-4 ring-red-500 animate-pulse' : ''}`}
                  disabled={chatLoading || isProcessing}
                  aria-label="Голосовое сообщение"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 16a4 4 0 0 0 4-4V8a4 4 0 1 0-8 0v4a4 4 0 0 0 4 4Z" fill="white"/>
                    <path d="M19 12a7 7 0 0 1-14 0" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M12 19v3m0 0h-3m3 0h3" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              )}
            </div>
            {/* Индикатор записи */}
            {recording && (
              <div className="text-red-600 text-sm mt-2 flex items-center gap-2 font-bold animate-pulse">
                <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
                Идёт запись… Нажмите ещё раз, чтобы отправить
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
} 