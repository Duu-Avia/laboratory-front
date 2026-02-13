import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ColumnDef = {
  width: string; // tailwind width class e.g. "w-24"
  align?: "left" | "right";
};

type Props = {
  /** Number of skeleton rows */
  rows?: number;
  /** Column definitions — controls width/alignment of each skeleton cell */
  columns: ColumnDef[];
  /** Optional header labels — if provided, shows real headers above skeleton rows */
  headers?: string[];
};

export function SkeletonTable({ rows = 6, columns, headers }: Props) {
  return (
    <div className="rounded-xl border bg-background text-left">
      <Table>
        {headers && (
          <TableHeader>
            <TableRow>
              {headers.map((h, i) => (
                <TableHead key={i}>{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
        )}
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <TableRow key={rowIdx} className="hover:bg-transparent">
              {columns.map((col, colIdx) => (
                <TableCell
                  key={colIdx}
                  className={col.align === "right" ? "text-right" : ""}
                >
                  {/* Stagger animation delay per row for a smooth wave effect */}
                  <Skeleton
                    className={`${col.width} h-4 rounded-md`}
                    style={{ animationDelay: `${rowIdx * 75}ms` }}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
