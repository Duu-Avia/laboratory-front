import { ReportHeaderSaveProps } from "@/app/types/types";
import { Button } from "@/components/ui/button";
import { Separator } from "@radix-ui/react-separator";
import Link from "next/link";

export const ReportHeader = ({ reportId, onSave }: ReportHeaderSaveProps) => {
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">
            <Link href="/reports" className="hover:underline">
              Reports
            </Link>{" "}
            / #{reportId}
          </div>
          <div className="text-2xl font-semibold">Үр дүн оруулах</div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => console.log("export pdf (ui only)")}
          >
            Export PDF
          </Button>
          <Button onClick={onSave}>Save results</Button>
        </div>
      </div>
      <Separator />
    </>
  );
};
