import { ReportHeaderSaveProps } from "@/types";
import { Button } from "@/components/ui/button";
import { FileText, Save, FileDown, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";

export const ReportHeader = ({ reportId, onSave, saving }: ReportHeaderSaveProps & { saving?: boolean }) => {
  return (
    <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 p-6 shadow-sm">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-4">
        <Link
          href="/reports"
          className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
        >
          Тайлангийн дугаар
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-slate-900 dark:text-white font-medium">
          № {reportId}
        </span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gray-100 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900">
            <FileText className="h-7 w-7 text-emerald-black dark:text-emerald-4400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Үр дүн оруулах
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              Шинжилгээний үр дүнг бүртгэх
            </p>
          </div>
        </div>

        <div className="flex gap-3">
         <Button
            onClick={onSave}
            disabled={saving}
            className="gap-2 text-emerald-700 bg-emerald-50 border border-emerald-400 hover:bg-emerald-100 ring-emerald-500/20"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? "Хадгалж байна..." : "Хадгалах"}
          </Button>
        </div>
      </div>
    </div>
  );
};
