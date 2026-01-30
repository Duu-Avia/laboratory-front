"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { DeleteDialog } from "./DeleteDialog";
import { EditReport } from "./EditDialog";
import { ApproveDialog } from "./ApproveDialog";
import { SignDialog } from "./SignDialog";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { fetchBlob } from "@/lib/api";
import { logError } from "@/lib/errors";
import { useAuth } from "@/lib/hooks/useAuth";
import type { ReportStatus, SampleType } from "@/types";

const ELEVATED_ROLES = ["senior_engineer", "admin", "superadmin"];

export interface PdfViewModalProps {
  open: boolean;
  reportId: number | null;
  reportTitle: string | null;
  reportStatus?: ReportStatus;
  onOpenChange: (open: boolean) => void;
  onApproved?: () => void;
  sampleTypes: SampleType[];
}

export function PdfViewModal({
  open,
  reportTitle,
  reportId,
  reportStatus,
  onOpenChange,
  onApproved,
  sampleTypes,
}: PdfViewModalProps) {
  const { getUser } = useAuth();
  const user = getUser();
  const canSign = reportStatus === "tested";
  const canApprove =
    reportStatus === "signed" && ELEVATED_ROLES.includes(user?.roleName ?? "");

  const [deleteDialogOpener, setDeleteDialogOpener] = useState(false);
  const [editDialogOpener, setEditDialogOpener] = useState(false);
  const [signDialogOpen, setSignDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    if (!open || !reportId) {
      setPdfUrl(null);
      setPdfLoading(false);
      return;
    }

    let revoked = false;
    setPdfLoading(true);

    fetchBlob(ENDPOINTS.REPORTS.PDF(reportId))
      .then((blob) => {
        if (!revoked) {
          setPdfUrl(URL.createObjectURL(blob));
        }
      })
      .catch((err) => logError(err, "Fetch PDF"))
      .finally(() => {
        if (!revoked) setPdfLoading(false);
      });

    return () => {
      revoked = true;
      setPdfUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    };
  }, [open, reportId]);

  const onDeleteClick = () => setDeleteDialogOpener(true);
  const onEditClick = () => setEditDialogOpener(true);
  const onSignClick = () => setSignDialogOpen(true);
  const onApproveClick = () => setApproveDialogOpen(true);

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
            {pdfLoading ? (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                PDF ачаалж байна...
              </div>
            ) : pdfUrl ? (
              <iframe
                title="Report PDF"
                className="w-full h-full"
                src={pdfUrl}
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

            {canSign && (
              <Button
                className="text-black bg-gray-200/75 hover:bg-violet-200 border-1 border-violet-500 h-[28px]"
                onClick={onSignClick}
              >
                Гарын үсэг зурах
              </Button>
            )}

            {canApprove && (
              <Button
                className="text-black bg-gray-200/75 hover:bg-blue-200 border-1 border-blue-500 h-[28px]"
                onClick={onApproveClick}
              >
                Батлах
              </Button>
            )}

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
          setEditDialogOpener(false);
        }}
      />

      <SignDialog
        open={signDialogOpen}
        onOpenChange={setSignDialogOpen}
        reportId={reportId}
        onSigned={() => {
          onOpenChange(false);
          onApproved?.();
        }}
      />

      <ApproveDialog
        open={approveDialogOpen}
        onOpenChange={setApproveDialogOpen}
        reportId={reportId}
        onApproved={() => {
          onOpenChange(false);
          onApproved?.();
        }}
      />
    </div>
  );
}
