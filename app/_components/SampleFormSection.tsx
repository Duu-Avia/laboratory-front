import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Indicator, SampleType } from "../types/types";

type SampleGroup = {
  sample_type_id: number | null;
  sample_ids?: (number | null)[];
  sample_names: string[];
  location: string;
  sample_date: string;
  sampled_by: string;
  indicators: number[];
  availableIndicators: Indicator[];
};

type Props = {
  sampleGroup: SampleGroup;
  setSampleGroup: (updater: (prev: SampleGroup) => SampleGroup) => void;
  sampleTypes: SampleType[];
};

export function SampleFormSection({ sampleGroup, setSampleGroup, sampleTypes }: Props) {
  const addSampleName = () => {
    console.log("=== ADD SAMPLE ===");
    setSampleGroup((prev) => {
      const newState = {
        ...prev,
        sample_names: [...prev.sample_names, ""],
        sample_ids: [...(prev.sample_ids ?? []), null],
      };
      console.log("After add:", { names: newState.sample_names, ids: newState.sample_ids });
      return newState;
    });
  };

  const removeSampleName = (index: number) => {
    console.log("=== REMOVE SAMPLE at index", index, "===");
    console.log("Before remove - ids:", sampleGroup.sample_ids);
    console.log("Before remove - names:", sampleGroup.sample_names);
    
    setSampleGroup((prev) => {
      const currentIds = prev.sample_ids ?? [];
      const newNames = prev.sample_names.filter((_, i) => i !== index);
      const newIds = currentIds.filter((_, i) => i !== index);
      
      console.log("After remove - ids:", newIds);
      console.log("After remove - names:", newNames);
      
      return {
        ...prev,
        sample_names: newNames,
        sample_ids: newIds,
      };
    });
  };

  const updateSampleName = (index: number, value: string) => {
    setSampleGroup((prev) => ({
      ...prev,
      sample_names: prev.sample_names.map((n, i) => (i === index ? value : n)),
    }));
  };

  const onFieldChange = (field: keyof SampleGroup, value: string) => {
    setSampleGroup((prev) => ({ ...prev, [field]: value }));
  };

  const onTypeChange = (typeId: number) => {
    setSampleGroup((prev) => ({ ...prev, sample_type_id: typeId }));
  };

  const toggleIndicator = (indicatorId: number) => {
    setSampleGroup((prev) => ({
      ...prev,
      indicators: prev.indicators.includes(indicatorId)
        ? prev.indicators.filter((x) => x !== indicatorId)
        : [...prev.indicators, indicatorId],
    }));
  };

  // Get current IDs safely
  const currentIds = sampleGroup.sample_ids ?? [];

  return (
    <div className="rounded-xl border p-4">
      <div className="grid grid-cols-3 gap-3">
        {/* Sample Type */}
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

        {/* Sample Names */}
        <div className="space-y-2 col-span-2">
          <div className="flex items-center justify-between">
            <Label>Дээжний нэр</Label>
            <Button variant="ghost" size="sm" onClick={addSampleName} type="button">
              + Дээж нэмэх
            </Button>
          </div>

          <div className="space-y-2">
            {sampleGroup.sample_names.map((name, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <Input
                  value={name}
                  onChange={(e) => updateSampleName(idx, e.target.value)}
                  placeholder={`Дээж ${idx + 1}`}
                />
                {/* Debug: show sample_id */}
                <span className="text-xs text-gray-400 min-w-[50px]">
                  #{currentIds[idx] ?? "new"}
                </span>
                {sampleGroup.sample_names.length > 1 && (
                  <Button variant="ghost" size="sm" onClick={() => removeSampleName(idx)} type="button">
                    ×
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="space-y-2 col-span-2">
          <Label>Дээж авсан байршил</Label>
          <Input
            value={sampleGroup.location}
            onChange={(e) => onFieldChange("location", e.target.value)}
            placeholder="байршил"
          />
        </div>

        {/* Sample Date */}
        <div className="space-y-2">
          <Label>Дээж авсан огноо</Label>
          <Input
            type="date"
            value={sampleGroup.sample_date}
            onChange={(e) => onFieldChange("sample_date", e.target.value)}
          />
        </div>

        {/* Sampled By */}
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

      {/* Indicators */}
      <div className="flex items-center justify-between">
        <div className="font-medium">Шинжилгээ сонгох</div>
        <div className="text-xs text-muted-foreground">
          {sampleGroup.sample_type_id ? "Санал болгох шинжилгээнүүд" : "Дээжний төрлөө эхлээд сонгоно уу"}
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
                onClick={() => toggleIndicator(ind.id)}
                className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left ${
                  checked ? "bg-muted" : "hover:bg-muted/50"
                }`}
              >
                <div>
                  <div className="text-sm font-medium">{ind.indicator_name}</div>
                  <div className="text-xs text-muted-foreground">
                    {ind.unit ? `Unit: ${ind.unit}` : "—"}
                  </div>
                </div>
                <Badge variant={checked ? "default" : "outline"}>
                  {checked ? "Сонгогдсон" : "Сонгох"}
                </Badge>
              </button>
            );
          })
        ) : (
          <div className="col-span-2 text-sm text-muted-foreground py-4">
            Шинжилгээний цэс.
          </div>
        )}
      </div>
    </div>
  );
}
