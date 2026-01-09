"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

const API_URL = "http://localhost:8000/api";

interface Sample {
  id: number;
  sample_name: string;
  sample_amount: string;
  sample_date: string;
  sampled_by: string;
  type_name: string;
  standard: string;
}

interface SampleIndicator {
  sample_indicator_id: number;
  indicator_id: number;
  indicator_name: string;
  unit: string;
  test_method: string;
  limit_value: string;
  result_value: string | null;
  is_detected: boolean | null;
  analyst_name: string | null;
}

export default function ReportPage() {
  const params = useParams();
  const sampleId = params.id as string;

  const [sample, setSample] = useState<Sample | null>(null);
  const [indicators, setIndicators] = useState<SampleIndicator[]>([]);
  const [loading, setLoading] = useState(true);

  // Load sample and indicators
  useEffect(() => {
    async function fetchData() {
      try {
        const samplesRes = await fetch(`${API_URL}/sample/list`);
        const samples = await samplesRes.json();
        const currentSample = samples.find((s: Sample) => s.id === parseInt(sampleId));
        setSample(currentSample);

        const indicatorsRes = await fetch(`${API_URL}/sample/${sampleId}/indicators`);
        const indicatorsData = await indicatorsRes.json();
        if (Array.isArray(indicatorsData)) {
          setIndicators(indicatorsData);
        }
      } catch (error) {
        console.log("Error:", error);
      } finally {
        setLoading(false);
      }
    }

    if (sampleId) {
      fetchData();
    }
  }, [sampleId]);

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "____.__.__";
    const date = new Date(dateString);
    return date.toLocaleDateString("zh-CN").replace(/\//g, ".");
  };

  

  // Download PDF
  const downloadPDF = async () => {
    const html2pdf = (await import("html2pdf.js")).default;
    const element = document.getElementById("pdf-content");

    if (!element) {
      console.error("PDF content element not found");
      return;
    }

    const opt = {
      margin: 0,
      filename: `report_${sample?.id || sampleId}.pdf`,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
    };

    html2pdf().set(opt).from(element).save();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p>Уншиж байна...</p>
      </div>
    );
  }

  if (!sample) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Сорьц олдсонгүй</p>
          <a href="/choose-results" className="text-blue-600 hover:underline">
            ← Буцах
          </a>
        </div>
      </div>
    );
  }

  const reportNumber = `2024_${sample.id.toString().padStart(3, "0")}`;
  const labNumber = `${sample.id}`;
  const printDate = new Date().toLocaleDateString("zh-CN").replace(/\//g, ".");
  const analystName = indicators[0]?.analyst_name || "Б. Түвшинжаргал";

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header Buttons */}
      <div className="max-w-4xl mx-auto mb-4 flex justify-between items-center">
        <a href="/choose-results" className="text-blue-600 hover:underline">
          ← Буцах
        </a>
        <div className="flex gap-2">
          <button
            onClick={downloadPDF}
            className="bg-red-600 text-white px-6 py-2 rounded font-bold hover:bg-red-700"
          >
            📥 PDF татах
          </button>
        </div>
      </div>

      {/* PDF Content */}
      {/* PDF Content */}
<div className="max-w-4xl mx-auto">
  <div
    id="pdf-content"
    style={{ 
      width: "210mm", 
      minHeight: "297mm", 
      margin: "0 auto", 
      backgroundColor: "#ffffff",
      color: "#000000",
      padding: "40px",
      fontFamily: "Arial, sans-serif"
    }}
  >
    {/* HEADER */}
    <div style={{ display: "flex", alignItems: "flex-start", marginBottom: "20px" }}>
      <div 
        style={{ 
          backgroundColor: '#1e40af',
          color: '#ffffff',
          padding: '12px 16px',
          marginRight: '20px',
          fontWeight: 'bold',
          fontSize: '14px',
          lineHeight: '1.3'
        }}
      >
        ЭНЕРЖИ
        <br />
        РЕСУРС ХХК
      </div>
      <div style={{ flex: 1, textAlign: "center" }}>
        <h2 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "4px" }}>
          УСНЫ ШИНЖИЛГЭЭНИЙ ЛАБОРАТОРИ
        </h2>
        <p style={{ fontSize: "11px", margin: "2px 0" }}>
          Өмнөговь аймаг, Цогтцэций сум, "Ухаа Худаг" уурхай
        </p>
        <p style={{ fontSize: "11px", margin: "2px 0" }}>
          И-мэйл хаяг:{" "}
          <span style={{ color: '#2563eb' }}>laboratory@mmc.mn</span>
        </p>
      </div>
    </div>

    {/* TITLE */}
    <h1 style={{ textAlign: "center", fontSize: "20px", fontWeight: "bold", marginTop: "32px", marginBottom: "8px" }}>
      СОРИЛТЫН ТАЙЛАН
    </h1>
    <p style={{ textAlign: "center", fontSize: "14px", marginBottom: "8px" }}>№: {reportNumber}</p>

    {/* Right info */}
    <div style={{ textAlign: "right", fontSize: "11px", marginBottom: "20px" }}>
      <p>Хэвлэсэн огноо: {printDate}</p>
      <p>Хуудасны дугаар: 1/1</p>
    </div>

    {/* INFO TABLE */}
    <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "16px", fontSize: "11px" }}>
      <thead>
        <tr style={{ backgroundColor: "#f3f4f6" }}>
          <th style={{ border: "1px solid #000", padding: "8px", fontWeight: "bold" }}>
            Лабораторийн дугаар
          </th>
          <th style={{ border: "1px solid #000", padding: "8px", fontWeight: "bold" }}>
            Техникийн шаардлага
          </th>
          <th style={{ border: "1px solid #000", padding: "8px", fontWeight: "bold" }}>
            Сорьцын тодорхойлолт
          </th>
          <th style={{ border: "1px solid #000", padding: "8px", fontWeight: "bold" }}>
            Сорьц авсан аргачлал
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style={{ border: "1px solid #000", padding: "8px", textAlign: "center" }}>
            {labNumber}
          </td>
          <td style={{ border: "1px solid #000", padding: "8px", textAlign: "center" }}>
            {sample.standard || "MNS 0900:2018"}
          </td>
          <td style={{ border: "1px solid #000", padding: "8px", textAlign: "center" }}>
            {sample.type_name}
          </td>
          <td style={{ border: "1px solid #000", padding: "8px", textAlign: "center" }}>
            MNS ISO 5667-5:2001
          </td>
        </tr>
      </tbody>
    </table>

    {/* SAMPLE NAMES */}
    <div style={{ marginBottom: "16px", fontSize: "11px" }}>
      <p style={{ fontWeight: "bold", marginBottom: "4px" }}>Сорьцын нэр:</p>
      <p style={{ marginLeft: "20px" }}>
        1. {sample.id} {sample.sample_name}
      </p>
      <p style={{ marginTop: "12px" }}>
        <span style={{ fontWeight: "bold" }}>Сорьц авсан:</span>{" "}
        {sample.sampled_by || "-"}
      </p>
    </div>

    {/* SAMPLE INFO TABLE */}
    <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px", fontSize: "11px" }}>
      <thead>
        <tr style={{ backgroundColor: "#f3f4f6" }}>
          <th style={{ border: "1px solid #000", padding: "8px", fontWeight: "bold" }}>
            Сорьцын хэмжээ
          </th>
          <th style={{ border: "1px solid #000", padding: "8px", fontWeight: "bold" }}>
            Сорьц авсан огноо
          </th>
          <th style={{ border: "1px solid #000", padding: "8px", fontWeight: "bold" }}>
            Шинжилсэн огноо
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style={{ border: "1px solid #000", padding: "8px", textAlign: "center" }}>
            {sample.sample_amount}
          </td>
          <td style={{ border: "1px solid #000", padding: "8px", textAlign: "center" }}>
            {formatDate(sample.sample_date)}
          </td>
          <td style={{ border: "1px solid #000", padding: "8px", textAlign: "center" }}>
            {formatDate(sample.sample_date)} - {printDate}
          </td>
        </tr>
      </tbody>
    </table>

    {/* RESULTS TABLE */}
    <p style={{ fontWeight: "bold", marginBottom: "8px", fontSize: "11px" }}>Шинжилгээний үр дүн:</p>
    <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "8px", fontSize: "10px" }}>
      <thead>
        <tr style={{ backgroundColor: "#f3f4f6" }}>
          <th style={{ border: "1px solid #000", padding: "8px", fontWeight: "bold" }}>№</th>
          <th style={{ border: "1px solid #000", padding: "8px", fontWeight: "bold" }}>Үзүүлэлт</th>
          <th style={{ border: "1px solid #000", padding: "8px", fontWeight: "bold" }}>
            Аргын стандарт
          </th>
          <th style={{ border: "1px solid #000", padding: "8px", fontWeight: "bold" }}>
            Зөвшөөрөгдөх хэмжээ
          </th>
          <th style={{ border: "1px solid #000", padding: "8px", fontWeight: "bold" }}>Дүн</th>
        </tr>
      </thead>
      <tbody>
        {indicators.map((ind, index) => (
          <tr key={ind.sample_indicator_id}>
            <td style={{ border: "1px solid #000", padding: "8px", textAlign: "center" }}>
              {index + 1}.
            </td>
            <td style={{ border: "1px solid #000", padding: "8px" }}>
              {ind.indicator_name}
            </td>
            <td style={{ border: "1px solid #000", padding: "8px" }}>{ind.test_method}</td>
            <td style={{ border: "1px solid #000", padding: "8px", textAlign: "center" }}>
              {ind.limit_value}
            </td>
            <td style={{ border: "1px solid #000", padding: "8px", textAlign: "center", fontWeight: "bold" }}>
              {ind.result_value || "-"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    <p style={{ fontSize: "10px", fontStyle: "italic", marginBottom: "20px" }}>*Итгэмжлэлд хамрагдаагүй.</p>
    <p style={{ textAlign: "right", fontStyle: "italic", fontSize: "11px", marginBottom: "32px" }}>
      Энэхүү сорилтын дүн нь тухайн сорьцын хувьд хүчинтэй.
    </p>

    {/* SIGNATURES */}
    <div style={{ marginTop: "40px", fontSize: "11px" }}>
      <p style={{ marginBottom: "12px" }}>
        <span style={{ fontWeight: "bold" }}>Шинжилгээ гүйцэтгэсэн:</span>{" "}
        Микробиологич
        <span style={{ marginLeft: "48px" }}>/{analystName}/</span>
      </p>
      <p>
        <span style={{ fontWeight: "bold" }}>Хянаж баталгаажуулсан:</span> Ахлах
        химич
        <span style={{ marginLeft: "48px" }}>/Б. Алдарбаяр/</span>
      </p>
    </div>

    {/* FOOTER */}
    <p style={{ textAlign: "center", fontSize: "10px", fontStyle: "italic", marginTop: "40px" }}>
      Сорилтын лабораторийн зөвшөөрөлгүй хуулбарлахыг хориглоно.
    </p>
  </div>
</div>
<button>save</button>
    </div>
  );
}