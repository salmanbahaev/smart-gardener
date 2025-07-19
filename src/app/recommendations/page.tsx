export default function RecommendationsPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-green-50">
      <div className="bg-white rounded shadow p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-green-800">Рекомендации по уходу</h2>
        <div className="text-green-900">
          <p>Здесь будут появляться индивидуальные рекомендации по уходу за растением после распознавания и анализа состояния.</p>
        </div>
      </div>
    </main>
  );
} 