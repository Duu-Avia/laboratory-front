import { IndicatorRowForLabSpec } from "@/app/types/types";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FlaskConical, CheckCircle2, Circle } from "lucide-react";

interface IndicatorCardProps {
  typeName: string;
  standard?: string;
  items: IndicatorRowForLabSpec[];
}

export function IndicatorCard({
  typeName,
  standard,
  items,
}: IndicatorCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 bg-secondary/50 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <FlaskConical className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{typeName}</h3>
            {standard && (
              <p className="text-xs text-muted-foreground">
                Стандарт: {standard}
              </p>
            )}
          </div>
        </div>
        <Badge variant="secondary" className="font-medium">
          {items.length} шинжилгээ
        </Badge>
      </div>

      {/* Table */}
      <div className="overflow-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="w-[70px] text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                ID
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Шинжилгээ
              </TableHead>
              <TableHead className="w-[100px] text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Нэгж
              </TableHead>
              <TableHead className="w-[200px] text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Арга стандарт
              </TableHead>
              <TableHead className="w-[150px] text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Зөвш / хэмжээ
              </TableHead>
              <TableHead className="w-[100px] text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Default
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => (
              <TableRow
                key={item.id}
                className="group transition-colors hover:bg-accent/50"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <TableCell className="text-sm text-muted-foreground font-mono">
                  {item.id}
                </TableCell>
                <TableCell className="font-medium text-foreground">
                  {item.indicator_name}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {item.unit || "—"}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {item.test_method || "—"}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {item.limit_value || "—"}
                </TableCell>
                <TableCell className="text-right">
                  {item.is_default ? (
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Default
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 text-muted-foreground/50">
                      <Circle className="h-3.5 w-3.5" />
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}

            {items.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-12 text-center text-muted-foreground"
                >
                  <FlaskConical className="mx-auto h-8 w-8 mb-2 opacity-30" />
                  Шинжилгээ олдсонгүй
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
