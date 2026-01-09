"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

const API_URL = "http://localhost:8000/api";

interface Sample {
  sample_id: number;
  sample_name: string;
  sample_amount: string;
  sample_date: string;
  sampled_by: string;
  type_name: string;
}

interface Indicator {
  indicator_id: number;
  indicator_name: string;
  unit: string;
  test_method: string;
  limit_value: string;
}

export default function ResultsPage() {
  const params = useParams();
  const reportId = params.id as string;

  const [report, setReport] = useState<any>(null);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [analystName, setAnalystName] = useState("Б. Түвшинжаргал");
  const [results, setResults] = useState<Record<number, { value: string; detected: boolean }>>({});

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`${API_URL}/sample/result/${reportId}`);
        const data = await response.json();
                
        if (data.success) {
          setReport(data.report);
          setSamples(data.samples || []);
          setIndicators(data.indicators || []);
          
          // Initialize empty results
          const existingResults: Record<number, { value: string; detected: boolean }> = {};
          data.indicators?.forEach((ind: Indicator) => {
            existingResults[ind.indicator_id] = {
              value: "",
              detected: false,
            };
          });
          setResults(existingResults);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    }

    if (reportId) fetchData();
  }, [reportId]);

  const updateResult = (indicatorId: number, field: "value" | "detected", val: string | boolean) => {
    setResults(prev => ({
      ...prev,
      [indicatorId]: {
        ...prev[indicatorId] || { value: "", detected: false },
        [field]: val,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    const resultsArray = indicators.map(ind => ({
      indicator_id: ind.indicator_id,
      result_value: results[ind.indicator_id]?.value || "",
      is_detected: results[ind.indicator_id]?.detected || false,
      analyst_name: analystName,
    }));

    console.log("Submitting results:", resultsArray);

    try {
      const response = await fetch(`${API_URL}/sample/results`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ results: resultsArray }),
      });

      const result = await response.json();
      if (result.success) setSuccess(true);
      else alert("Алдаа гарлаа");
    } catch (error) {
      console.error("Error:", error);
      alert("Алдаа гарлаа");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("mn-MN");
  };

  if (loading) return <div className="min-h-screen bg-gray-100 flex items-center justify-center"><p>Уншиж байна...</p></div>;
  if (!samples.length) return <div className="min-h-screen bg-gray-100 flex items-center justify-center"><div className="text-center"><p className="text-gray-500 mb-4">Сорьц олдсонгүй</p><a href="/stored-samples" className="text-blue-600 hover:underline">← Буцах</a></div></div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">📝 Дүн оруулах</h1>
        <div className="mb-4"><a href="/stored-samples" className="text-blue-600 hover:underline">← Сорьцууд руу буцах</a></div>

        {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">✅ Дүн амжилттай хадгалагдлаа!</div>}

        {/* SAMPLE INFO SECTION - ADDED BACK */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h2 className="font-bold text-lg mb-2">Сорьцийн мэдээлэл</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-500">Тайлан ID:</span><span className="ml-2 font-medium">{reportId}</span></div>
            <div><span className="text-gray-500">Төлөв:</span><span className="ml-2">{report?.status}</span></div>
            <div className="col-span-2">
              <span className="text-gray-500">Сорьцууд:</span>
              <div className="ml-2">
                {samples.map(s => (
                  <div key={s.sample_id}>• {s.sample_name} {s.type_name && `(${s.type_name})`}</div>
                ))}
              </div>
            </div>
            <div><span className="text-gray-500">Огноо:</span><span className="ml-2">{formatDate(samples[0]?.sample_date)}</span></div>
            <div><span className="text-gray-500">Авсан:</span><span className="ml-2">{samples[0]?.sampled_by || "-"}</span></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Шинжилгээ хийсэн:</label>
            <input type="text" value={analystName} onChange={(e) => setAnalystName(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" />
          </div>

          {indicators.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Энэ тайланд үзүүлэлт олдсонгүй</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border px-3 py-2 text-left text-sm">№</th>
                      <th className="border px-3 py-2 text-left text-sm">Үзүүлэлт</th>
                      <th className="border px-3 py-2 text-left text-sm">Зөвшөөрөгдөх</th>
                      <th className="border px-3 py-2 text-left text-sm">Дүн</th>
                      <th className="border px-3 py-2 text-center text-sm">Илэрсэн?</th>
                    </tr>
                  </thead>
                  <tbody>
                    {indicators.map((ind, index) => (
                      <tr key={ind.indicator_id} className="hover:bg-gray-50">
                        <td className="border px-3 py-2 text-sm">{index + 1}</td>
                        <td className="border px-3 py-2 text-sm">
                          {ind.indicator_name}
                          {ind.unit && <span className="text-gray-500 ml-1">({ind.unit})</span>}
                        </td>
                        <td className="border px-3 py-2 text-sm">{ind.limit_value}</td>
                        <td className="border px-3 py-2">
                          <input 
                            type="text" 
                            value={results[ind.indicator_id]?.value || ""} 
                            onChange={(e) => updateResult(ind.indicator_id, "value", e.target.value)} 
                            placeholder="Дүн" 
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm" 
                          />
                        </td>
                        <td className="border px-3 py-2 text-center">
                          <input 
                            type="checkbox" 
                            checked={results[ind.indicator_id]?.detected || false} 
                            onChange={(e) => updateResult(ind.indicator_id, "detected", e.target.checked)} 
                            className="w-4 h-4" 
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6">
                <button type="submit" disabled={saving} className="w-full bg-green-600 text-white py-3 rounded font-bold hover:bg-green-700 disabled:bg-gray-400">
                  {saving ? "Хадгалж байна..." : "💾 Дүн хадгалах"}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}