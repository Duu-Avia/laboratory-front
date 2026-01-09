"use client";
import { useState, useEffect } from "react";

const API_URL = "http://localhost:8000/api";

interface SampleType {
  id: number;
  type_name: string;
  standard: string;
}

interface Indicator {
  id: number;
  indicator_name: string;
  is_default: boolean;
}

export default function SamplePage() {
  const [sampleTypes, setSampleTypes] = useState<SampleType[]>([]);
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [selectedIndicators, setSelectedIndicators] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [reportId, setReportId] = useState<number | null>(null);

  // Олон сорьцын нэрс
  const [sampleNames, setSampleNames] = useState<string[]>([""]);

  const [form, setForm] = useState({
    sample_type_id: "",
    sample_amount: "Тус бүр 0.5л",
    sample_date: "",
    sampled_by: "",
  });

  // Load sample types
  useEffect(() => {
    fetch(`${API_URL}/sample/types`)
      .then((res) => res.json())
      .then((data) => setSampleTypes(data))
      .catch((err) => console.log(err));
  }, []);

  // Load indicators when sample type changes
  useEffect(() => {
    if (form.sample_type_id) {
      fetch(`${API_URL}/sample/indicators/${form.sample_type_id}`)
        .then((res) => res.json())
        .then((data) => {
          setIndicators(data);
          const defaults = data
            .filter((ind: Indicator) => ind.is_default)
            .map((ind: Indicator) => ind.id);
          setSelectedIndicators(defaults);
        })
        .catch((err) => console.log(err));
    } else {
      setIndicators([]);
      setSelectedIndicators([]);
    }
  }, [form.sample_type_id]);

  // Сорьц нэмэх
  const addSample = () => {
    setSampleNames([...sampleNames, ""]);
  };

  // Сорьц устгах
  const removeSample = (index: number) => {
    if (sampleNames.length > 1) {
      const newNames = sampleNames.filter((_, i) => i !== index);
      setSampleNames(newNames);
    }
  };

  // Сорьцын нэр өөрчлөх
  const updateSampleName = (index: number, value: string) => {
    const newNames = [...sampleNames];
    newNames[index] = value;
    setSampleNames(newNames);
  };

  // Indicator toggle
  const toggleIndicator = (id: number) => {
    if (selectedIndicators.includes(id)) {
      setSelectedIndicators(selectedIndicators.filter((i) => i !== id));
    } else {
      setSelectedIndicators([...selectedIndicators, id]);
    }
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Хоосон сорьцын нэр шүүх
    const validSampleNames = sampleNames.filter((name) => name.trim() !== "");

    if (validSampleNames.length === 0) {
      alert("Сорьцын нэр оруулна уу");
      return;
    }

    if (selectedIndicators.length === 0) {
      alert("Үзүүлэлт сонгоно уу");
      return;
    }

    setLoading(true);
    setSuccess(false);

    try {
      const response = await fetch(`${API_URL}/sample/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sample_type_id: parseInt(form.sample_type_id),
          sample_names: validSampleNames,
          sample_amount: form.sample_amount,
          sample_date: form.sample_date,
          sampled_by: form.sampled_by,
          indicator_ids: selectedIndicators,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        setReportId(result.reportId);
        
        // Form reset
        setSampleNames([""]);
        setForm({
          sample_type_id: "",
          sample_amount: "Тус бүр 0.5л",
          sample_date: "",
          sampled_by: "",
        });
        setIndicators([]);
        setSelectedIndicators([]);
      } else {
        alert("Алдаа гарлаа");
      }
    } catch (error) {
      console.log("Error:", error);
      alert("Алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-6">🧪 Сорьц бүртгэх</h1>

        {/* Success Message */}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            ✅ Амжилттай хадгалагдлаа! (Тайлан #{reportId})
            <div className="mt-2 flex gap-4">
              <a href="/stored-samples" className="text-blue-600 underline">
                Сорьцууд харах →
              </a>
              <a href="/reports" className="text-blue-600 underline">
                Тайлангууд харах →
              </a>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
          
          {/* Sample Type */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Сорьцын төрөл *</label>
            <select
              value={form.sample_type_id}
              onChange={(e) => setForm({ ...form, sample_type_id: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            >
              <option value="">-- Сонгох --</option>
              {sampleTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.type_name} ({type.standard})
                </option>
              ))}
            </select>
          </div>

          {/* Sample Names */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Сорьцууд *</label>
            <div className="space-y-2">
              {sampleNames.map((name, index) => (
                <div key={index} className="flex gap-2">
                  <span className="py-2 text-sm text-gray-500 w-6">{index + 1}.</span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => updateSampleName(index, e.target.value)}
                    placeholder="645 Ариун цэврийн өрөөний ус"
                    className="flex-1 border border-gray-300 rounded px-3 py-2"
                  />
                  {sampleNames.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSample(index)}
                      className="text-red-500 hover:text-red-700 px-2"
                    >
                      ❌
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addSample}
              className="text-blue-600 hover:underline text-sm mt-2"
            >
              + Сорьц нэмэх
            </button>
          </div>

          {/* Indicators */}
          {indicators.length > 0 && (
            <div className="mb-4 p-4 bg-gray-50 rounded">
              <label className="block text-sm font-medium mb-2">Үзүүлэлтүүд *</label>
              {indicators.map((ind) => (
                <label key={ind.id} className="flex items-center mb-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedIndicators.includes(ind.id)}
                    onChange={() => toggleIndicator(ind.id)}
                    className="mr-2 w-4 h-4"
                  />
                  <span className="text-sm">
                    {ind.indicator_name}
                    {ind.is_default && (
                      <span className="text-green-600 text-xs ml-1">(default)</span>
                    )}
                  </span>
                </label>
              ))}
            </div>
          )}

          {/* Sample Date */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Сорьц авсан огноо *</label>
            <input
              type="date"
              value={form.sample_date}
              onChange={(e) => setForm({ ...form, sample_date: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>

          {/* Sampled By */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Сорьц авсан хүн</label>
            <input
              type="text"
              value={form.sampled_by}
              onChange={(e) => setForm({ ...form, sampled_by: e.target.value })}
              placeholder="Ус хангамжийн техникч"
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          {/* Sample Amount */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Сорьцын хэмжээ</label>
            <select
              value={form.sample_amount}
              onChange={(e) => setForm({ ...form, sample_amount: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="Тус бүр 0.5л">Тус бүр 0.5л</option>
              <option value="Тус бүр 1л">Тус бүр 1л</option>
              <option value="5 минут">5 минут</option>
              <option value="50см²">50см²</option>
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || selectedIndicators.length === 0}
            className="w-full bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Хадгалж байна..." : `💾 Хадгалах (${sampleNames.filter(n => n.trim()).length} сорьц)`}
          </button>
        </form>

        {/* Navigation */}
        <div className="mt-6 text-center space-y-2">
          <a href="/stored-samples" className="block text-blue-600 hover:underline">
            📦 Хадгалсан сорьцууд →
          </a>
          <a href="/reports" className="block text-blue-600 hover:underline">
            📋 Тайлангууд →
          </a>
        </div>
      </div>
    </div>
  );
}
