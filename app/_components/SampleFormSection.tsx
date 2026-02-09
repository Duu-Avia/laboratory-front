import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import {
  FlaskConical,
  MapPin,
  Beaker,
  Calendar,
  User,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
} from "lucide-react";
import type {
  LocationPackage,
  LocationSample,
  SampleGroup,
  LabType,
} from "@/types";
import { api } from "@/lib/api";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { logError } from "@/lib/errors";

type Props = {
  sampleGroup: SampleGroup;
  setSampleGroup: (updater: (prev: SampleGroup) => SampleGroup) => void;
  labTypes: LabType[];
};

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-modal-accent/10">
        <Icon className="h-4 w-4 text-modal-accent" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}

export function SampleFormSection({
  sampleGroup,
  setSampleGroup,
  labTypes,
}: Props) {
  const [locationPackages, setLocationPackages] = useState<LocationPackage[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);

  useEffect(() => {
    if (!sampleGroup.lab_type_id) {
      setLocationPackages([]);
      setSelectedPackageId(null);
      return;
    }

    api
      .get<LocationPackage[]>(
        ENDPOINTS.LOCATIONS.BY_LAB_TYPE(sampleGroup.lab_type_id)
      )
      .then((data) => {
        setLocationPackages(data);
        setSelectedPackageId(null);
      })
      .catch((err) => {
        logError(err, "Fetch location packages");
        setLocationPackages([]);
      });
  }, [sampleGroup.lab_type_id]);

  const handlePackageSelect = async (packageId: number) => {
    setSelectedPackageId(packageId);

    try {
      const samples = await api.get<LocationSample[]>(
        ENDPOINTS.LOCATIONS.SAMPLES(packageId)
      );

      const selectedPackage = locationPackages.find((p) => p.id === packageId);

      setSampleGroup((prev) => ({
        ...prev,
        location: selectedPackage?.package_name ?? "",
        sample_names: samples.map((s) => s.location_name),
        sample_ids: samples.map(() => null),
      }));
    } catch (err) {
      logError(err, "Fetch location samples");
    }
  };

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
      lab_type_id: typeId,
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

  const inputClasses =
    "h-10 bg-modal-section-bg border-modal-section-border focus:border-modal-accent focus:ring-modal-accent/20 transition-all duration-200";
  const selectTriggerClasses =
    "h-10 bg-modal-section-bg border-modal-section-border focus:border-modal-accent focus:ring-modal-accent/20 transition-all duration-200";

  return (
    <div className="space-y-5">
      {/* Sample Type & Location Section */}
      <div className="rounded-xl border border-modal-section-border bg-modal-section-bg/50 p-5">
        <SectionHeader
          icon={FlaskConical}
          title="Сорьцын мэдээлэл"
          description="Сорьцын төрөл болон байршлыг сонгоно уу"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Sample Type */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Сорьцын төрөл
            </Label>
            {labTypes.length > 1 ? (
              <Select
                value={
                  sampleGroup.lab_type_id
                    ? String(sampleGroup.lab_type_id)
                    : undefined
                }
                onValueChange={(v) => onTypeChange(Number(v))}
              >
                <SelectTrigger className={selectTriggerClasses}>
                  <SelectValue placeholder="Сонгох" />
                </SelectTrigger>
                <SelectContent>
                  {labTypes.map((t) => (
                    <SelectItem key={t.id} value={String(t.id)}>
                      {t.type_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                value={labTypes[0]?.type_name || ""}
                readOnly
                tabIndex={-1}
                className={inputClasses + " bg-muted cursor-not-allowed !text-gray-900 dark:!text-gray-100 font-semibold"}
              />
            )}
          </div>

          {/* Location Package */}
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Байршил сонгох
            </Label>
            <Select
              value={selectedPackageId ? String(selectedPackageId) : undefined}
              onValueChange={(v) => handlePackageSelect(Number(v))}
              disabled={!sampleGroup.lab_type_id || locationPackages.length === 0}
            >
              <SelectTrigger className={selectTriggerClasses}>
                <SelectValue
                  placeholder={
                    !sampleGroup.lab_type_id
                      ? "Эхлээд сорьцын төрөл сонгоно уу"
                      : locationPackages.length === 0
                        ? "Байршил байхгүй"
                        : "Байршил сонгох"
                  }
                />
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
        </div>
      </div>

      {/* Sample Names Section */}
      <div className="rounded-xl border border-modal-section-border bg-modal-section-bg/50 p-5">
        <div className="flex items-center justify-between mb-4">
          <SectionHeader
            icon={Beaker}
            title="Сорьцууд"
            description="Сорьцын нэрийг оруулна уу"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={addSampleName}
            type="button"
            className="h-8 text-xs border-modal-section-border hover:bg-modal-accent/10 hover:text-modal-accent hover:border-modal-accent/30 transition-all duration-200"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Сорьц нэмэх
          </Button>
        </div>

        <div className="space-y-2">
          <AnimatePresence>
            {sampleGroup.sample_names.map((name, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="flex gap-2 items-center"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-modal-accent/10 text-xs font-medium text-modal-accent shrink-0">
                  {idx + 1}
                </div>
                <Input
                  value={name}
                  onChange={(e) => updateSampleName(idx, e.target.value)}
                  placeholder={`Сорьц ${idx + 1}`}
                  className={inputClasses + " flex-1"}
                />
                {sampleGroup.sample_names.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSampleName(idx)}
                    type="button"
                    className="h-10 w-10 shrink-0 text-muted-foreground hover:text-modal-error hover:bg-modal-error-light transition-all duration-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Details Section */}
      <div className="rounded-xl border border-modal-section-border bg-modal-section-bg/50 p-5">
        <SectionHeader
          icon={MapPin}
          title="Нэмэлт мэдээлэл"
          description="Байршил, хэмжээ, огноо, нэр"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Location */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Сорьц авсан байршил
            </Label>
            <Input
              value={sampleGroup.location}
              onChange={(e) => onFieldChange("location", e.target.value)}
              placeholder="Байршил"
              className={inputClasses}
            />
          </div>

          {/* Sample Amount */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Сорьцын хэмжээ
            </Label>
            <Input
              value={sampleGroup.sample_amount ?? ""}
              onChange={(e) => onFieldChange("sample_amount", e.target.value)}
              placeholder="0.5л гэх мэт"
              className={inputClasses}
            />
          </div>

          {/* Sample Date */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Сорьц авсан огноо
            </Label>
            <Input
              type="date"
              value={sampleGroup.sample_date}
              onChange={(e) => onFieldChange("sample_date", e.target.value)}
              className={inputClasses}
            />
          </div>

          {/* Sampled By */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              Сорьц өгсөн хүний нэр
            </Label>
            <Input
              value={sampleGroup.sampled_by}
              onChange={(e) => onFieldChange("sampled_by", e.target.value)}
              placeholder="Нэр"
              className={inputClasses}
            />
          </div>
        </div>
      </div>

      {/* Indicators Section */}
      <div className="rounded-xl border border-modal-section-border bg-modal-section-bg/50 p-5">
        <div className="flex items-center justify-between mb-4">
          <SectionHeader
            icon={CheckCircle2}
            title="Шинжилгээ сонгох"
            description={
              sampleGroup.lab_type_id
                ? `${sampleGroup.indicators.length} шинжилгээ сонгогдсон`
                : "Сорьцын төрлөө эхлээд сонгоно уу"
            }
          />
          {sampleGroup.lab_type_id && sampleGroup.availableIndicators.length > 0 && (
            <Badge
              variant="secondary"
              className="bg-modal-accent/10 text-modal-accent border-0 text-xs"
            >
              {sampleGroup.indicators.length} / {sampleGroup.availableIndicators.length}
            </Badge>
          )}
        </div>

        {sampleGroup.lab_type_id ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {sampleGroup.availableIndicators.map((ind) => {
              const checked = sampleGroup.indicators.includes(ind.id);
              return (
                <motion.button
                  type="button"
                  key={ind.id}
                  onClick={() => toggleIndicator(ind.id)}
                  whileTap={{ scale: 0.98 }}
                  className={`group flex items-center gap-3 rounded-lg border px-3.5 py-3 text-left transition-all duration-200 ${
                    checked
                      ? "bg-modal-indicator-selected border-modal-indicator-selected-border shadow-sm"
                      : "border-modal-section-border hover:border-modal-accent/30 hover:bg-modal-accent/5"
                  }`}
                >
                  <div className="shrink-0">
                    {checked ? (
                      <CheckCircle2 className="h-5 w-5 text-modal-accent" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground/40 group-hover:text-modal-accent/50 transition-colors" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {ind.indicator_name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {ind.unit ? `Unit: ${ind.unit}` : "—"}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center rounded-lg border border-dashed border-modal-section-border py-8">
            <div className="text-center">
              <FlaskConical className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Шинжилгээний цэс
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}