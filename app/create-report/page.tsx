"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API_URL = "http://localhost:8000/api";

interface Sample {
  id: number;
  sample_name: string;
  sample_date: string;
  status: string;
  type_name: string;
}

export default function CreateReportPage() {
  const router = useRouter();
  const [samples, setSamples] = useState<Sample[]>([]);
  const [selectedSamples, setSelectedSamples] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    report_title: "",
    analyst: "Б. Түвшинжаргал",
    approver_name: "Б. Алдарбаяр",
    test_start_date: "",
    test_end_date: "",
  });

  useEffect(() => {
    fetch(`${API_URL}/sample/list`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
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

  const toggleSample = (sampleId: number) => {
    if (selectedSamples.includes(sampleId)) {
      setSelectedSamples(selectedSamples.filter((id) => id !== sampleId));
    } else {
      setSelectedSamples([...selectedSamples, sampleId]);
    }
  };

  const selectAll = () => {
    if (selectedSamples.length === samples.length) {
      setSelectedSamples([]);
    } else {
      setSelectedSamples(samples.map((s) => s.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedSamples.length === 0) {
      alert("Сорьц сонгоно уу");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`${API_URL}/report/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          report_title: form.report_title,
          analyst: form.analyst,
          approver_name: form.approver_name,
          test_start_date: form.test_start_date,
          test_end_date: form.test_end_date,
          sample_ids: selectedSamples,
        }),
      });

      const result = await response.json();

      if (result.success) {
        router.push(`/report/${result.reportId}`);
      } else {
        alert("Алдаа гарлаа");
      }
    } catch (error) {
      console.log("Error:", error);
      alert("Алдаа гарлаа");
    } finally {
      setSaving(false);
    }
  };

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
        <h1 className="text-2xl font-bold mb-6">📄 Тайлан үүсгэх</h1>

        <div className="mb-4 flex gap-4">
          <a href="/stored-samples" className="text-blue-600 hover:underline">
            ← Сорьцууд
          </a>
          <a href="/reports" className="text-blue-600 hover:underline">
            📋 Бүх тайлангууд
          </a>
        </div>

        {samples.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 mb-4">Дүн оруулсан сорьц байхгүй байна</p>
            
              <a href="/stored-samples"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Сорьцууд руу очих →
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="font-bold text-lg mb-4">Тайлангийн мэдээлэл</h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Тайлангийн гарчиг *</label>
                  <input
                    type="text"
                    value={form.report_title}
                    onChange={(e) => setForm({ ...form, report_title: e.target.value })}
                    placeholder="Нэгдсэн оффис"
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Шинжилгээ эхэлсэн</label>
                  <input
                    type="date"
                    value={form.test_start_date}
                    onChange={(e) => setForm({ ...form, test_start_date: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Шинжилгээ дууссан</label>
                  <input
                    type="date"
                    value={form.test_end_date}
                    onChange={(e) => setForm({ ...form, test_end_date: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Шинжээч</label>
                  <input
                    type="text"
                    value={form.analyst}
                    onChange={(e) => setForm({ ...form, analyst: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Хянасан</label>
                  <input
                    type="text"
                    value={form.approver_name}
                    onChange={(e) => setForm({ ...form, approver_name: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-lg">Сорьцууд сонгох</h2>
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {selectedSamples.length === samples.length ? "Бүгдийг болих" : "Бүгдийг сонгох"}
                </button>
              </div>

              <div className="space-y-2">
                {samples.map((sample) => (
                  <label
                    key={sample.id}
                    className="flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSamples.includes(sample.id)}
                      onChange={() => toggleSample(sample.id)}
                      className="w-5 h-5 mr-3"
                    />
                    <div className="flex-1">
                      <span className="font-medium">#{sample.id}</span>
                      <span className="ml-2">{sample.sample_name}</span>
                      <span className="text-gray-500 text-sm ml-2">
                        ({formatDate(sample.sample_date)})
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">{sample.type_name}</span>
                  </label>
                ))}
              </div>

              <p className="mt-4 text-sm text-gray-600">
                Сонгосон: {selectedSamples.length} / {samples.length}
              </p>
            </div>

            <button
              type="submit"
              disabled={saving || selectedSamples.length === 0}
              className="w-full bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700 disabled:bg-gray-400"
            >
              {saving ? "Үүсгэж байна..." : "📄 Тайлан үүсгэх"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}