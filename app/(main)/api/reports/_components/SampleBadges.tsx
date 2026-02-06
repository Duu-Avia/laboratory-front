"use client";
import { SampleColumn } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Beaker } from "lucide-react";

interface SampleBadgesProps {
  reportTitle: string;
  samples: SampleColumn[];
}

export function SampleBadges({ reportTitle, samples }: SampleBadgesProps) {
  return (
    <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 p-6 shadow-sm">
      {/* Report Title */}
      <div className="flex items-center gap-3 mb-4">
   
      <div className="font-bold pl-2 text-lg text-slate-900 dark:text-white">Үүсгэсэн сорьцууд</div>  
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {reportTitle}
        </h2>
      </div>

        <div className="font-semibold text-gray-600 text-sm pl-2 pb-3">Дээж өгсөн : {samples[0]?.sampled_by} </div>
      {/* Sample Badges */}
      <div className="flex flex-wrap gap-2">
        {samples.map((s, index) => (
          <Badge
            key={s.sample_id}
            variant="outline"
            className="px-3 py-1.5 text-sm border-gray-100 dark:border-emerald-800 bg-gray-100  dark:bg-emerald-950/30 text-gray-700 dark:text-emerald-400 font-medium"
          >
            <span className="font-bold mr-1">Дээж-{index + 1}:</span>
            {s.sample_name}
          </Badge>
        ))}
      </div>
    </div>
  );
}
