"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { DeleteDialog } from "./DeleteDialog";
import { EditReport } from "./EditDialog";

export interface PdfViewModalProps {
  open: boolean;
  reportId: number | null;
  reportTitle: string | null;
  onOpenChange: (open: boolean) => void;

  // for edit form dropdown
  sampleTypes: any[]; // use your SampleType[] type if you have it
}

export function PdfViewModal({
  open,
  reportTitle,
  reportId,
  onOpenChange,
  sampleTypes,
}: PdfViewModalProps) {
  const [deleteDialogOpener, setDeleteDialogOpener] = useState(false);
  const [editDialogOpener, setEditDialogOpener] = useState(false);

  const onDeleteClick = () => setDeleteDialogOpener(true);
  const onEditClick = () => setEditDialogOpener(true);

  return (
    <div>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="max-w-[95vw] w-[65vw] h-[90vh] p-0 flex flex-col overflow-hidden"
          style={{ maxWidth: "1400px", maxHeight: "90vh" }}
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

          <div className="shrink-0 border-t bg-background p-4 flex justify-end gap-2">
            <Button
              className="text-black bg-gray-200/75 hover:bg-gray-500 hover:text-white border-1 border-cyan-200 h-[28px]"
              onClick={onEditClick}
            >
              Тайлан засах
            </Button>

            <Button
              className="text-black bg-gray-200/75 hover:bg-red-200 border-1 border-red-500 h-[28px]"
              onClick={onDeleteClick}
            >
              Устгах
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteDialog
        reportId={reportId}
        deleteDialogOpener={deleteDialogOpener}
        setDeleteDialogOpener={setDeleteDialogOpener}
      />

      <EditReport
        open={editDialogOpener}
        onOpenChange={setEditDialogOpener}
        reportId={reportId}
        sampleTypes={sampleTypes}
        onSaved={() => {
          // optional: close edit modal after save
          setEditDialogOpener(false);
          // optional: refresh pdf iframe or list if you want
        }}
      />
    </div>
  );
}
