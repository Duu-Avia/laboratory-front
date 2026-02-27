"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HeaderProps, StatusFilter } from "@/types";

const statusOptions: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "Бүгд" },
  { key: "signed", label: "Шалгагдаж байна" },
  { key: "pending_samples", label: "Сорьц хүлээгдэж байна" },
  { key: "tested", label: "Шинжилгээ хийгдсэн" },
  { key: "rejected", label: "Буцаагдсан" },
];

export function Header({
  from,
  to,
  search,
  selectedLabType,
  status,
  labTypes,
  labTypeCounts,
  onFromChange,
  onToChange,
  onSearchChange,
  onLabTypeChange,
  onStatusChange,
  onCreateClick,
  onExportClick,
}: HeaderProps) {
  const totalCount = labTypeCounts
    ? Object.values(labTypeCounts).reduce((a, b) => a + b, 0)
    : 0;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-[170px]">
          <Label className="text-xs text-muted-foreground">Эхлэх он</Label>
          <Input
            type="date"
            value={from}
            onChange={(e) => onFromChange(e.target.value)}
          />
        </div>

        <div className="w-[170px]">
          <Label className="text-xs text-muted-foreground">Дуусах он</Label>
          <Input
            type="date"
            value={to}
            onChange={(e) => onToChange(e.target.value)}
          />
        </div>

        <div className="w-[260px]">
          <Label className="text-xs text-muted-foreground">
            Түлхүүр үгээр хайх
          </Label>
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Тайлангийн нэрээр хайх"
          />
        </div>

        <div className="flex-1" />

        <Button
          className="cursor-pointer bg-gray-200 hover:bg-gray-400 active:bg-gray-400"
          variant="secondary"
          onClick={onExportClick}
        >
          Экселрүү хөрвүүлэх
        </Button>

        <Button className="bg-cyan-800 hover:bg-cyan-500" onClick={onCreateClick}>+ Сорьц шинээр оруулах</Button>
      </div>

      <div className="flex justify-between gap-6">
        {labTypes.length > 1 && (
          <div>
            <label className="py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center justify-center gap-2 text-center">
              <span className="h-1 w-1 rounded-full bg-blue-500" />
              Лаб төрлөөр шүүх
            </label>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="pill"
                size="sm"
                active={selectedLabType === "all"}
                type="button"
                onClick={() => onLabTypeChange("all")}
              >
                Бүгд
                <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-blue-100 text-[12px] font-semibold leading-none border-1 border-sky-500">
                  {totalCount}
                </span>
              </Button>

              {labTypes.map((type) => {
                const count = labTypeCounts?.[type.type_name] ?? 0;
                return (
                  <Button
                    key={type.id}
                    variant="pill"
                    size="sm"
                    active={selectedLabType === type.type_name}
                    type="button"
                    onClick={() => onLabTypeChange(type.type_name)}
                  >
                    {type.type_name}
                    <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-blue-100 text-[12px]  font-semibokd leading-none border-1 border-sky-500">
                      {count}
                    </span>
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label className="w-fit mx-auto pl-1.5 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-blue-500" />
            Тайлангийн төлөвөөр хайх
          </label>

          <div className="flex flex-wrap gap-2">
            {statusOptions.map((s) => (
              <Button
                key={s.key}
                size="sm"
                variant="pill"
                active={status === s.key}
                type="button"
                onClick={() => onStatusChange(s.key)}
              >
                {s.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
