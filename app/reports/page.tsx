"use client";
import { useState, useEffect } from "react";

const API_URL = "http://localhost:8000/api";

interface Report {
  id: number;
  report_title: string;
  analyst_name: string;
  approver_name: string;
  test_start_date: string;
  test_end_date: string;
  status: string;
  sample_count: number;
  created_at: string;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/report/list`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setReports(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, []);

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
        <h1 className="text-2xl font-bold mb-6">📋 Бүх тайлангууд</h1>

        <div className="mb-4 flex gap-4">
          <a href="/create-report" className="text-blue-600 hover:underline">
            + Шинэ тайлан үүсгэх
          </a>
          <a href="/stored-samples" className="text-blue-600 hover:underline">
            📦 Сорьцууд
          </a>
        </div>

        {reports.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 mb-4">Тайлан байхгүй байна</p>
            
             <a href="/create-report"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              + Тайлан үүсгэх
            </a>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">№</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Гарчиг</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Сорьц</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Огноо</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Үйлдэл</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-bold">{report.id}</td>
                    <td className="px-4 py-3 text-sm">{report.report_title}</td>
                    <td className="px-4 py-3 text-sm">{report.sample_count} ширхэг</td>
                    <td className="px-4 py-3 text-sm">{formatDate(report.created_at)}</td>
                    <td className="px-4 py-3 text-center">
                      
                       <a href={`/report/${report.id}`}
                        className="inline-block bg-red-600 text-white px-4 py-1 rounded text-sm hover:bg-red-700"
                      >
                        📄 Харах
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reports.length > 0 && (
          <div className="mt-4 text-sm text-gray-600">Нийт: {reports.length} тайлан</div>
        )}
      </div>
    </div>
  );
}