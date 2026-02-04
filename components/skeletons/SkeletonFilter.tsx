import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  /** Show the lab type pill row */
  showLabTypes?: boolean;
  /** Number of lab type pills to show */
  labTypeCount?: number;
  /** Number of status pills to show */
  statusCount?: number;
};

export function SkeletonFilter({
  showLabTypes = true,
  labTypeCount = 3,
  statusCount = 4,
}: Props) {
  return (
    <div className="flex flex-col gap-3">
      {/* Top row: date inputs, search, buttons */}
      <div className="flex flex-wrap items-end gap-3">
        {/* Date from */}
        <div className="w-[170px] space-y-1.5">
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
        {/* Date to */}
        <div className="w-[170px] space-y-1.5">
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
        {/* Search */}
        <div className="w-[260px] space-y-1.5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-9 w-full rounded-md" />
        </div>

        <div className="flex-1" />

        {/* Buttons */}
        <Skeleton className="h-9 w-[155px] rounded-md" />
        <Skeleton className="h-9 w-[190px] rounded-md" />
      </div>

      {/* Bottom row: lab types + status pills */}
      <div className="flex justify-between">
        {showLabTypes && (
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-16 mx-auto" />
            <div className="flex gap-2">
              {Array.from({ length: labTypeCount }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-7 w-16 rounded-md"
                  style={{ animationDelay: `${i * 75}ms` }}
                />
              ))}
            </div>
          </div>
        )}

        <div className="space-y-1.5 ml-auto">
          <Skeleton className="h-3 w-28 mx-auto" />
          <div className="flex gap-2">
            {Array.from({ length: statusCount }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-7 w-20 rounded-full"
                style={{ animationDelay: `${i * 75}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
