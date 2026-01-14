"use client";
import { SampleColumn } from "@/app/types/types";
import { Badge } from "@/components/ui/badge";

interface SampleBadgesProps {
  reportTitle: string;
  samples: SampleColumn[];
}

export function SampleBadges({ reportTitle, samples }: SampleBadgesProps) {
  return (
    <div className="mb-4">
      <div className="text-[45px] font-semibold">{reportTitle}</div>
      <div className="flex gap-2 mt-2">
        {samples.map((s, index) => (
          <Badge className="text-[15px]" key={s.sample_id} variant="outline">
            Дээж-{index + 1} {s.sample_name}
          </Badge>
        ))}
      </div>
    </div>
  );
}