"use client";
import { useState, useEffect } from "react";

const API_URL = "http://localhost:8000/api";

interface SampleData {
  report_id: number;
  report_status: string;
  report_created_at: string;
  sample_id: number;
  sample_name: string;
  sample_date: string;
  sample_amount: string;
  sampled_by: string;
  sample_status: string;
  type_name: string;
}

interface GroupedReport {
  report_id: number;
  report_status: string;
  report_created_at: string;
  type_name: string;
  samples: SampleData[];
}

export default function StoredSamplesPage() {
  const [groupedReports, setGroupedReports] = useState<GroupedReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/sample/list`)
      .then((res) => res.json())
      .then((data) => {
        // report_id-аар бүлэглэх
        const grouped: { [key: number]: GroupedReport } = {};

        for (let i = 0; i < data.length; i++) {
          const row = data[i];
          
          if (!grouped[row.report_id]) {
            grouped[row.report_id] = {
              report_id: row.report_id,
              report_status: row.report_status,
              report_created_at: row.report_created_at,
              type_name: row.type_name,
              samples: []
            };
          }
          
          grouped[row.report_id].samples.push(row);
        }

        // Object-оос Array руу хөрвүүлэх
        const reportsArray = Object.values(grouped);
        setGroupedReports(reportsArray);
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

  // Бүх сорьцын status шалгах
  const getReportStatus = (samples: SampleData[]) => {
    const allCompleted = samples.every((s) => s.sample_status === "completed");
    return allCompleted ? "completed" : "pending";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p>Уншиж байна...</p>
      </div>
    );
  }
  console.log(groupedReports);
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">📋 Хадгалсан сорьцууд</h1>

        <div className="mb-4">
          <a href="/sample" className="text-blue-600 hover:underline">
            ← Шинэ сорьц бүртгэх
          </a>
        </div>

        {groupedReports.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 mb-4">Хадгалсан сорьц байхгүй байна</p>
            
            <a  href="/sample"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              + Сорьц бүртгэх
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {groupedReports.map((report) => (
              <div key={report.report_id} className="bg-white rounded-lg shadow overflow-hidden">
                {/* Report Header */}
                <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
                  <div>
                    <span className="font-bold">Хадгалсан сорьц #{report.report_id}</span>
                    <span className="text-gray-500 text-sm ml-2">
                      ({formatDate(report.report_created_at)})
                    </span>
                    <span className="text-gray-500 text-sm ml-2">
                      - {report.type_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        getReportStatus(report.samples) === "completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {getReportStatus(report.samples) === "completed" ? "Дууссан" : "Хүлээгдэж буй"}
                    </span>
                    {getReportStatus(report.samples) === "completed" ? (
                      
                      <a  href={`/report/${report.report_id}`}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                      >
                        📄 Тайлан
                      </a>
                    ) : (
                      
                      <a  href={`/results/${report.report_id}`}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                      >
                        Дүн оруулах →
                      </a>
                    )}
                  </div>
                </div>

                {/* Samples List */}
                <div className="px-4 py-2">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-gray-500">
                        <th className="py-2">№</th>
                        <th className="py-2">Сорьцын нэр</th>
                        <th className="py-2">Огноо</th>
                        <th className="py-2">Төлөв</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.samples.map((sample, index) => (
                        <tr key={index} className="border-t">
                          <td className="py-2 text-sm">{index + 1}</td>
                          <td className="py-2 text-sm">{sample.sample_name}</td>
                          <td className="py-2 text-sm">{formatDate(sample.sample_date)}</td>
                          <td className="py-2">
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                sample.sample_status === "completed"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {sample.sample_status === "completed" ? "Дууссан" : "Хүлээгдэж буй"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        {groupedReports.length > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            Нийт: {groupedReports.length} сорьц
          </div>
        )}
      </div>
    </div>
  );
}
