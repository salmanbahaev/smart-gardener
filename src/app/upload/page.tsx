'use client';
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Loader from "@/components/Loader";
import Toast from "@/components/Toast";
import VoiceMessagePlayer from "@/components/VoiceMessagePlayer";
import ProtectedRoute from "@/components/ProtectedRoute";

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
  
  // Drag and drop states
  const [isDragOver, setIsDragOver] = useState(false);

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

  // Drag and drop handlers
  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      setPreview(URL.createObjectURL(imageFile));
      setFile(imageFile);
      setUploadedUrl(null);
      setRecommendations(null);
      setError(null);
      showToast("Файл добавлен!", "success");
      // Автоматически загружаем файл
      setTimeout(() => {
        handleSubmitWithFile(imageFile);
      }, 0);
    } else {
      showToast("Пожалуйста, перетащите изображение", "error");
    }
  }

  async function handleSubmitWithFile(selectedFile: File) {
    setError(null);
    setUploadedUrl(null);
    setRecommendations(null);
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Требуется авторизация");
        showToast("Требуется авторизация", "error");
        return;
      }
      const formData = new FormData();
      formData.append("file", selectedFile);
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          setError("Требуется авторизация");
          showToast("Требуется авторизация", "error");
        } else {
          setError(data.error || "Ошибка загрузки");
          showToast(data.error || "Ошибка загрузки", "error");
        }
      } else {
        setUploadedUrl(data.url);
        setPreview(null);
        if (inputRef.current) inputRef.current.value = "";
        showToast("Фото успешно загружено!", "success");
      }
    } catch (err) {
      setError("Ошибка сети");
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
        if (res.status === 401) {
          setError("Требуется авторизация");
          showToast("Требуется авторизация", "error");
        } else {
          setError(data.error || "Ошибка генерации рекомендаций");
          showToast(data.error || "Ошибка генерации рекомендаций", "error");
        }
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
    } else {
      if (res.status === 401) {
        setError("Требуется авторизация");
        showToast("Требуется авторизация", "error");
      } else {
        setError(data.error || "Ошибка отправки голосового сообщения");
        showToast(data.error || "Ошибка отправки голосового сообщения", "error");
      }
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



  const uploadFallback = (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-teal-400/20 to-cyan-400/20 rounded-full blur-3xl"></div>
      </div>
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-green-100 text-center">
          <Loader text="Проверка авторизации..." />
        </div>
      </div>
    </main>
  );

  return (
    <ProtectedRoute fallback={uploadFallback}>
      <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 relative overflow-hidden">
        {/* Декоративные элементы */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-teal-400/20 to-cyan-400/20 rounded-full blur-3xl"></div>
        </div>

        {/* Основной контент */}
        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center p-6">
          <div className="w-full max-w-2xl">
            {/* Заголовок */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                Анализ растения по фото
              </h1>
              <p className="text-gray-600">Загрузите фото растения для получения рекомендаций по уходу</p>
            </div>

            {/* Основная форма */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-green-100">
              {/* Этап 1: Нет файла */}
              {!file && !uploadedUrl && (
                <div className="space-y-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    ref={inputRef}
                    id="plant-photo-input"
                  />
                  {/* Drag and Drop область */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`group flex flex-col items-center justify-center gap-3 px-8 py-8 rounded-2xl text-green-800 font-bold shadow-lg transition-all duration-200 cursor-pointer border-2 text-lg w-full text-center transform hover:-translate-y-1 ${
                      isDragOver 
                        ? 'bg-gradient-to-r from-green-300 to-emerald-300 border-green-500 shadow-2xl scale-105' 
                        : 'bg-gradient-to-r from-green-100 to-emerald-100 border-green-200 hover:shadow-xl hover:from-green-200 hover:to-emerald-200 active:from-green-300 active:to-emerald-300 hover:border-green-400'
                    }`}
                  >
                    {isDragOver ? (
                      <>
                        <svg className="w-12 h-12 mb-2 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span className="text-lg">Отпустите файл здесь</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-12 h-12 mb-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span>Загрузить фото растения</span>
                        <span className="text-sm font-normal text-green-600 mt-2">или перетащите файл сюда</span>
                      </>
                    )}
                  </div>
                  
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
                    className="group flex flex-col items-center justify-center gap-3 px-8 py-6 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 font-bold shadow-lg hover:shadow-xl hover:from-emerald-100 hover:to-teal-100 active:from-emerald-200 active:to-teal-200 transition-all duration-200 cursor-pointer border-2 border-emerald-200 hover:border-emerald-400 text-lg w-full text-center transform hover:-translate-y-1 md:hidden"
                  >
                    <svg className="w-10 h-10 mb-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Сделать фото
                  </label>
                </div>
              )}
              {/* Этап 2: Файл выбран, но не загружен */}
              {file && !uploadedUrl && (
                <div className="space-y-4">
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                      <img src={preview!} alt="Превью" className="rounded-2xl shadow-lg max-h-64 border-2 border-green-200" />
                      <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-medium">
                        Выбрано
                      </div>
                    </div>
                    <div className="text-center">
                      <span className="text-green-700 text-sm font-medium">{file.name}</span>
                    </div>
                    
                    {/* Loader для загрузки фото */}
                    {loading && (
                      <div className="w-full flex justify-center">
                        <div className="flex items-center gap-3 bg-green-50 rounded-xl px-4 py-3">
                          <svg className="animate-spin h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                          </svg>
                          <span className="text-green-700 font-medium">Загрузка фото...</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Ошибка */}
                    {error && (
                      <div className="w-full p-4 bg-red-50 border border-red-200 rounded-xl">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-red-700 text-sm font-medium">{error}</span>
                        </div>
                      </div>
                    )}
                    
                    <button
                      type="button"
                      className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center gap-1 transition-colors duration-200"
                      onClick={() => { setFile(null); setPreview(null); setError(null); }}
                      disabled={loading}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Выбрать другое фото
                    </button>
                  </div>
                </div>
              )}
              {/* Этап 3: Фото загружено */}
              {uploadedUrl && (
                <div className="space-y-4">
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                      <img src={uploadedUrl} alt="Загружено" className="rounded-2xl shadow-lg max-h-64 border-2 border-green-200" />
                      <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-medium">
                        Загружено
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-green-700 font-semibold mb-2">Фото успешно загружено!</div>
                      <a href={uploadedUrl} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700 text-sm underline">
                        Посмотреть в Cloudinary
                      </a>
                    </div>
                    
                    <button
                      onClick={handleGetVisionRecommendations}
                      className="group w-full py-4 px-6 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold shadow-lg hover:shadow-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 disabled:opacity-60 cursor-pointer text-lg transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                      disabled={recVisionLoading}
                    >
                      {recVisionLoading ? (
                        <div className="flex items-center gap-2">
                          <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                          </svg>
                          <span>Анализ растения...</span>
                        </div>
                      ) : (
                        <>
                          <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          Получить рекомендации
                        </>
                      )}
                    </button>
                    
                    <button
                      type="button"
                      className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center gap-1 transition-colors duration-200"
                      onClick={() => { setFile(null); setUploadedUrl(null); setRecommendations(null); setError(null); }}
                      disabled={recVisionLoading}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Выбрать другое фото
                    </button>
                  </div>
                </div>
              )}
              {/* Ошибка авторизации */}
              {error === "Требуется авторизация" && (
                <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-center">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div className="text-red-700 font-semibold text-lg">Требуется авторизация</div>
                  </div>
                  <div className="text-red-600 text-sm mb-4">Для загрузки и анализа фото необходимо войти в систему</div>
                  <Link href="/login" className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Войти в систему
                  </Link>
                </div>
              )}
              
              {/* Другие ошибки */}
              {error && error !== "Требуется авторизация" && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-red-700 text-sm font-medium">{error}</span>
                  </div>
                </div>
              )}
              
              {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            </div>

            {/* Этап 4: Рекомендации и чат */}
            {recommendations && (
              <div className="mt-8 w-full">
                <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-green-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Чат с ботом</h3>
                  </div>
                  
                  {/* Чат с ботом */}
                  <div className="max-h-64 overflow-y-auto flex flex-col gap-3 mb-4 bg-gray-50 rounded-xl p-4 border border-gray-200">
                    {chatHistory.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`rounded-xl px-4 py-3 max-w-[80%] text-sm shadow-lg ${msg.role === "user" ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white" : "bg-white text-gray-800 border border-gray-200"}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs opacity-75">{msg.role === "user" ? "Вы" : "Бот"}</span>
                          </div>
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
                  
                  {/* Форма отправки */}
                  <div className="flex gap-3 items-center">
                    <input
                      type="text"
                      className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                      placeholder="Введите сообщение..."
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && chatInput.trim()) handleSendChat(); }}
                      disabled={chatLoading || recording}
                    />
                    {chatInput.trim() ? (
                      <button
                        onClick={handleSendChat}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl w-12 h-12 flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        disabled={chatLoading}
                        aria-label="Отправить"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </button>
                    ) : (
                      <button
                        onClick={handleMicButton}
                        className={`bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl w-12 h-12 flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex-shrink-0 ${recording ? 'ring-4 ring-red-500 animate-pulse' : ''}`}
                        disabled={chatLoading || isProcessing}
                        aria-label="Голосовое сообщение"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                      </button>
                    )}
                  </div>
                  
                  {/* Индикатор записи */}
                  {recording && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl">
                      <div className="flex items-center gap-2 text-red-700 font-medium animate-pulse">
                        <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
                        Идёт запись… Нажмите ещё раз, чтобы отправить
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
} 