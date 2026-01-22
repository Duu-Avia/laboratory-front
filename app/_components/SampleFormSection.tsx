import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Indicator, LocationPackage, LocationSample, SampleGroup, SampleType } from "../types/types";


type Props = {
  sampleGroup: SampleGroup;
  setSampleGroup: (updater: (prev: SampleGroup) => SampleGroup) => void;
  sampleTypes: SampleType[];
};

export function SampleFormSection({ sampleGroup, setSampleGroup, sampleTypes }: Props) {
  // Location packages state
  const [locationPackages, setLocationPackages] = useState<LocationPackage[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);

  // Fetch location packages when sample_type changes
  useEffect(() => {
    if (!sampleGroup.sample_type_id) {
      setLocationPackages([]);
      setSelectedPackageId(null);
      return;
    }

    fetch(`http://localhost:8000/locations?sample_type_id=${sampleGroup.sample_type_id}`)
      .then((r) => r.json())
      .then((data) => {
        setLocationPackages(data);
        setSelectedPackageId(null); // Reset selection
      })
      .catch((err) => {
        console.error("Error fetching location packages:", err);
        setLocationPackages([]);
      });
  }, [sampleGroup.sample_type_id]);

  // When package is selected, fetch samples and populate sample_names
  const handlePackageSelect = async (packageId: number) => {
    setSelectedPackageId(packageId);

    try {
      const res = await fetch(`http://localhost:8000/locations/samples/${packageId}`);
      const samples: LocationSample[] = await res.json();

      // Get package name for location field
      const selectedPackage = locationPackages.find((p) => p.id === packageId);

      setSampleGroup((prev) => ({
        ...prev,
        location: selectedPackage?.package_name ?? "",
        sample_names: samples.map((s) => s.location_name),
        sample_ids: samples.map(() => null), // All new samples
      }));
    } catch (err) {
      console.error("Error fetching location samples:", err);
    }
  };
  console.log(locationPackages,selectedPackageId)
  const addSampleName = () => {
    setSampleGroup((prev) => ({
      ...prev,
      sample_names: [...prev.sample_names, ""],
      sample_ids: [...(prev.sample_ids ?? []), null],
    }));
  };

  const removeSampleName = (index: number) => {
    setSampleGroup((prev) => {
      const currentIds = prev.sample_ids ?? [];
      return {
        ...prev,
        sample_names: prev.sample_names.filter((_, i) => i !== index),
        sample_ids: currentIds.filter((_, i) => i !== index),
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
    setSampleGroup((prev) => ({
      ...prev,
      sample_type_id: typeId,
      // Reset when type changes
      sample_names: [""],
      sample_ids: [],
      location: "",
    }));
  };

  const toggleIndicator = (indicatorId: number) => {
    setSampleGroup((prev) => ({
      ...prev,
      indicators: prev.indicators.includes(indicatorId)
        ? prev.indicators.filter((x) => x !== indicatorId)
        : [...prev.indicators, indicatorId],
    }));
  };

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
              <SelectValue placeholder="Сонгох" />
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

        {/* Location Package Selection */}
        <div className="space-y-2 col-span-2">
          <Label>Байршил сонгох</Label>
          <Select
            value={selectedPackageId ? String(selectedPackageId) : undefined}
            onValueChange={(v) => handlePackageSelect(Number(v))}
            disabled={!sampleGroup.sample_type_id || locationPackages.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder={
                !sampleGroup.sample_type_id 
                  ? "Эхлээд дээжний төрөл сонгоно уу" 
                  : locationPackages.length === 0 
                    ? "Байршил байхгүй" 
                    : "Байршил сонгох"
              } />
            </SelectTrigger>
            <SelectContent>
              {locationPackages.map((pkg) => (
                <SelectItem key={pkg.id} value={String(pkg.id)}>
                  {pkg.package_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sample Names */}
        <div className="space-y-2 col-span-3">
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
                {sampleGroup.sample_names.length > 1 && (
                  <Button variant="ghost" size="sm" onClick={() => removeSampleName(idx)} type="button">
                    ×
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Location (auto-filled from package, but editable) */}
        <div className="space-y-2 col-span-2">
          <Label>Дээж авсан байршил</Label>
          <Input
            value={sampleGroup.location}
            onChange={(e) => onFieldChange("location", e.target.value)}
            placeholder="Байршил"
          />
        </div>

        {/* Sample Amount */}
        <div className="space-y-2">
          <Label>Сорьцын хэмжээ</Label>
          <Input
            value={sampleGroup.sample_amount ?? ""}
            onChange={(e) => onFieldChange("sample_amount", e.target.value)}
            placeholder="0.5л гэх мэт"
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
          <Label>Дээж өгсөн хүний нэр</Label>
          <Input
            value={sampleGroup.sampled_by}
            onChange={(e) => onFieldChange("sampled_by", e.target.value)}
            placeholder="Нэр"
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