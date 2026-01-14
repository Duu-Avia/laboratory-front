"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Indicator, SampleType } from "../types/types";

interface SampleFormSectionProps {
  sampleGroup: {
    sample_type_id: number | null;
    sample_names: string[];
    location: string;
    sample_date: string;
    sampled_by: string;
    indicators: number[];
    availableIndicators: Indicator[];
  };
  sampleTypes: SampleType[];
  onAddSampleName: () => void;
  onRemoveSampleName: (index: number) => void;
  onUpdateSampleName: (index: number, value: string) => void;
  onTypeChange: (typeId: number) => void;
  onFieldChange: (field: string, value: string) => void;
  onToggleIndicator: (indicatorId: number) => void;
}

export function SampleFormSection({
  sampleGroup,
  sampleTypes,
  onAddSampleName,
  onRemoveSampleName,
  onUpdateSampleName,
  onTypeChange,
  onFieldChange,
  onToggleIndicator,
}: SampleFormSectionProps) {
  return (
    <div className="rounded-xl border p-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-2">
          <Label>Дээжний төрөл</Label>
          <Select
            value={sampleGroup.sample_type_id ? String(sampleGroup.sample_type_id) : undefined}
            onValueChange={(v) => onTypeChange(Number(v))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Төрөл" />
            </SelectTrigger>
            <SelectContent>
              {sampleTypes.map((t) => (
                <SelectItem key={t.id} value={String(t.id)}>
                  {t.type_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 col-span-2">
          <div className="flex items-center justify-between">
            <Label>Дээжний нэр</Label>
            <Button variant="ghost" size="sm" onClick={onAddSampleName}>
              + Дээж нэмэх
            </Button>
          </div>
          <div className="space-y-2">
            {sampleGroup.sample_names.map((name, idx) => (
              <div key={idx} className="flex gap-2">
                <Input
                  value={name}
                  onChange={(e) => onUpdateSampleName(idx, e.target.value)}
                  placeholder={`Дээж ${idx + 1}`}
                />
                {sampleGroup.sample_names.length > 1 && (
                  <Button variant="ghost" size="sm" onClick={() => onRemoveSampleName(idx)}>
                    ×
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2 col-span-2">
          <Label>Дээж авсан байршил</Label>
          <Input
            value={sampleGroup.location}
            onChange={(e) => onFieldChange("location", e.target.value)}
            placeholder="байршил"
          />
        </div>

        <div className="space-y-2">
          <Label>Дээж авсан огноо</Label>
          <Input
            type="date"
            value={sampleGroup.sample_date}
            onChange={(e) => onFieldChange("sample_date", e.target.value)}
          />
        </div>

        <div className="space-y-2 col-span-2">
          <Label>Дээж авсан хүний нэр</Label>
          <Input
            value={sampleGroup.sampled_by}
            onChange={(e) => onFieldChange("sampled_by", e.target.value)}
            placeholder="нэр"
          />
        </div>
      </div>

      <Separator className="my-4" />

      <div className="flex items-center justify-between">
        <div className="font-medium">Шинжилгээ сонгох</div>
        <div className="text-xs text-muted-foreground">
          {sampleGroup.sample_type_id ? "Сануулсан шинжилгээнүүд" : "Дээжний төрлөө эхлээд сонгоно уу"}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {sampleGroup.sample_type_id ? (
          sampleGroup.availableIndicators.map((ind) => {
            const checked = sampleGroup.indicators.includes(ind.id);
            return (
              <button
                type="button"
                key={ind.id}
                onClick={() => onToggleIndicator(ind.id)}
                className={[
                  "flex items-center justify-between rounded-lg border px-3 py-2 text-left",
                  checked ? "bg-muted" : "hover:bg-muted/50",
                ].join(" ")}
              >
                <div>
                  <div className="text-sm font-medium">{ind.indicator_name}</div>
                  <div className="text-xs text-muted-foreground">{ind.unit ? `Unit: ${ind.unit}` : "—"}</div>
                </div>
                <Badge variant={checked ? "default" : "outline"}>{checked ? "Сонгогдсон" : "Сонгох"}</Badge>
              </button>
            );
          })
        ) : (
          <div className="col-span-2 text-sm text-muted-foreground py-4">Шинжилгээний цэс.</div>
        )}
      </div>
    </div>
  );
}