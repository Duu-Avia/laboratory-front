"use client";
import { useState, useEffect } from "react";

const API_URL = "http://localhost:8000/api";

interface Sample {
  id: number;
  sample_name: string;
  sample_amount: string;
  sample_date: string;
  sampled_by: string;
  status: string;
  type_name: string;
}

export default function ChooseResultsPage() {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [loading, setLoading] = useState(true);

  // Load samples with completed results
  useEffect(() => {
    fetch(`${API_URL}/sample/list`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Filter only completed samples
          const completedSamples = data.filter((s: Sample) => s.status === "completed");
          setSamples(completedSamples);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, []);

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("mn-MN");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p>Уншиж байна...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">📊 Дүн бүхий сорьцууд</h1>

        {/* Navigation */}
        <div className="mb-4 flex gap-4">
          <a href="/sample" className="text-blue-600 hover:underline">
            ← Шинэ сорьц бүртгэх
          </a>
          <a href="/stored-samples" className="text-blue-600 hover:underline">
            📋 Бүх сорьцууд
          </a>
        </div>

        {/* Empty State */}
        {samples.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 mb-4">Дүн оруулсан сорьц байхгүй байна</p>
            
             <a href="/stored-samples"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Сорьцууд харах →
            </a>
          </div>
        ) : (
          /* Samples Table */
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">ID</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Нэр</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Төрөл</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Огноо</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Төлөв</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Үйлдэл</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {samples.map((sample) => (
                  <tr key={sample.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-bold">{sample.id}</td>
                    <td className="px-4 py-3 text-sm">{sample.sample_name}</td>
                    <td className="px-4 py-3 text-sm">{sample.type_name}</td>
                    <td className="px-4 py-3 text-sm">{formatDate(sample.sample_date)}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                        Дууссан
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      
                       <a href={`/report/${sample.id}`}
                        className="inline-block bg-red-600 text-white px-4 py-1 rounded text-sm hover:bg-red-700"
                      >
                        📄 Тайлан харах
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary */}
        {samples.length > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            Нийт: {samples.length} сорьц (дүн оруулсан)
          </div>
        )}
      </div>
    </div>
  );
}
