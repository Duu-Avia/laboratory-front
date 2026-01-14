"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface PdfViewModalProps {
  open: boolean;
  reportId: number | null;
  reportTitle: string | null;
  onOpenChange: (open: boolean) => void;
}

export function PdfViewModal({ open, reportTitle, reportId, onOpenChange }: PdfViewModalProps) {
  const handleEdit = () => console.log("edit");
  const handleDelete = () => console.log("delete");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[95vw] w-[65vw] h-[90vh] p-0 flex flex-col overflow-hidden"
        style={{
          maxWidth: "1400px",
          maxHeight: "90vh",
        }}
      >
        <DialogTitle className="sr-only">Report PDF</DialogTitle>
        <div className="pt-2 pl-2 font-normal text-xl">{reportTitle}</div>
        <div className="flex-1 min-h-0">
          {reportId ? (
            <iframe
              title="Report PDF"
              className="w-full h-full"
              src={`http://localhost:8000/reports/${reportId}/pdf`}
            />
          ) : (
            <div className="p-6">No report selected</div>
          )}
        </div>

        {/* ✅ Footer buttons (always visible) */}
        <div className="shrink-0 border-t bg-background p-4 flex justify-end gap-2">
          <Button className="text-black bg-gray-200/75 hover:bg-gray-500 hover:text-white border-1 border-cyan-200 h-[28px]" onClick={handleEdit}>Тайлан засах</Button>
          <Button className="text-black bg-gray-200/75 hover:bg-red-200 border-1 border-red-500 h-[28px]" onClick={handleDelete}>
            Устгах
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
