"use client"
import { api } from "@/lib/api"
import { ENDPOINTS } from "@/lib/api/endpoints"
import { ActivityLogType } from "@/types/activity-log"
import { useEffect, useState } from "react";
import { ACTIVITY_LOGS_LABELS } from "@/lib/constants";
import { div } from "motion/react-client";


export default function LogsPage(){
   const [logData, setLogData] = useState<ActivityLogType | null>(null)
   const [page, setPage] = useState(1)
   const tTarget = (key?: string) =>
  (key && ACTIVITY_LOGS_LABELS.targetNames[key as keyof typeof ACTIVITY_LOGS_LABELS.targetNames]) || key || "-";

const tAction = (key?: string) =>
  (key && ACTIVITY_LOGS_LABELS.actionNames[key as keyof typeof ACTIVITY_LOGS_LABELS.actionNames]) || key || "-";


 useEffect(() => {
  let alive = true;

  const fetchLogs = async () => {
    try {
      const data = await api.get<ActivityLogType>(ENDPOINTS.USERS.ACTIVITY_LOGS(page));
      if (alive) setLogData(data);
    } catch (err) {
      console.log(err);
    }
  };

  fetchLogs(); // initial fetch

  // Poll only on first page (newest logs usually live here)
  if (page !== 1) return () => { alive = false; };

  const id = setInterval(fetchLogs, 7000); // 10 seconds

  return () => {
    alive = false;
    clearInterval(id);
  };
}, [page]);
 
console.log(logData)
    return (
<div className="min-h-screen bg-black text-white p-6">
    <h1 className="text-2xl font-bold mb-4">Activity Logs</h1>
    <table className="w-full text-left border-collapse">
        <thead>
            <tr className="border-b border-gray-700">
                <th className="p-2">#</th>
                <th className="p-2">User</th>
                <th className="p-2">Action</th>
                <th className="p-2">Method</th>
                <th className="p-2">Path</th>
                <th className="p-2">Status</th>
                <th className="p-2">Date</th>
            </tr>
        </thead>
        <tbody>
            {logData?.data?.map((item, index) => (
                <tr key={item.id} className="border-b border-gray-800 hover:bg-gray-900">
                    <td className="p-2">{item.row_num}</td>
                    <td className="p-2">{item.full_name}<br/><span className="text-gray-400 text-sm">{item.email}</span></td>
                <td className="p-2 flex gap-2"> {item.target_id ? (<div className="text-green-500">{item.target_id}#</div>): ""}{tTarget(item.target_type)} {tAction(item.action)}</td>
                    <td className="p-2">{item.method}</td>
                    <td className="p-2 text-gray-400 text-sm">{item.path}</td>
                    <td className="p-2">{item.status_code}</td>
                    <td className="p-2 text-sm text-gray-400">{new Date(item.created_at).toLocaleString()}</td>
                </tr>
            ))}
        </tbody>
    </table>

    {logData?.pagination && (
    <div className="flex items-center justify-between mt-4">
        <span className="text-sm text-gray-400">
            Total: {logData.pagination.total} | Page {logData.pagination.page} of {logData.pagination.totalPages}
        </span>
        <div className="flex gap-2">
            <button
                onClick={() => setPage(p => p - 1)}
                disabled={page <= 1}
                className="px-3 py-1 border border-gray-700 rounded disabled:opacity-30 hover:bg-gray-800"
            >
                Prev
            </button>
            <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= logData.pagination.totalPages}
                className="px-3 py-1 border border-gray-700 rounded disabled:opacity-30 hover:bg-gray-800"
            >
                Next
            </button>
        </div>
    </div>
    )}
</div>
    )
}
