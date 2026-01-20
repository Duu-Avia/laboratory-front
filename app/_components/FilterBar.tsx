"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FilterBarProps, SampleType, StatusFilter } from "../types/types";

const statusOptions: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "Бүгд" },
  { key: "draft", label: "Draft" },
  { key: "pending_samples", label: "Дээж хүлээгдэж байна" },
  { key: "tested", label: "Шинжилгээ хийгдсэн" },
  { key: "approved", label: "Батлагдсан" },
];

export function FilterBar({
  from,
  to,
  search,
  selectedSampleType,
  status,
  sampleTypes,
  onFromChange,
  onToChange,
  onSearchChange,
  onSampleTypeChange,
  onStatusChange,
  onCreateClick,
  onExportClick,
}: FilterBarProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-[170px]">
          <Label className="text-xs text-muted-foreground">Эхлэх он</Label>
          <Input type="date" value={from} onChange={(e) => onFromChange(e.target.value)} />
        </div>
        <div className="w-[170px]">
          <Label className="text-xs text-muted-foreground">Дуусах он</Label>
          <Input type="date" value={to} onChange={(e) => onToChange(e.target.value)} />
        </div>

        <div className="w-[260px]">
          <Label className="text-xs text-muted-foreground">Түлхүүр үгээр хайх</Label>
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Тайлангийн нэрээр хайх"
          />
        </div>

        <div className="flex-1" />

        <Button className="cursor-pointer hover:bg-gray-300 active:bg-gray-400" variant="secondary" onClick={onExportClick}>
          Экселрүү хөрвүүлэх
        </Button>

        <Button onClick={onCreateClick}>+ Дээж шинээр оруулах</Button>
      </div>

      <div className="flex justify-between">
        <div>
          <div className="text-xs text-center text-muted-foreground">Лаб төрөлөөр хайх</div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              className="text-[13px] w-100% h-7"
              variant={selectedSampleType === "all" ? "default" : "outline"}
              onClick={() => onSampleTypeChange("all")}
            >
              Бүгд
            </Button>
            {sampleTypes.map((type) => (
              <Button
                className="text-[13px] w-100% h-7"
                key={type.id}
                variant={selectedSampleType === type.type_name ? "default" : "outline"}
                onClick={() => onSampleTypeChange(type.type_name)}
              >
                {type.type_name}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="text-xs text-center text-muted-foreground">Тайлангийн төлөвөөр хайх</div>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((s) => {
              const active = status === s.key;
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => onStatusChange(s.key)}
                  className={[
                    "rounded-full border px-3 py-1 text-sm transition text-[13px] w-100% h-7",
                    active ? "bg-black text-white border-black" : "bg-white hover:bg-muted",
                  ].join(" ")}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}