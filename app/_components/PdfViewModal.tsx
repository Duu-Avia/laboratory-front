"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { DeleteDialog } from "./DeleteDialog";
import { EditReport } from "./EditDialog";
import { ApproveDialog } from "./ApproveDialog";
import { RejectDialog } from "./RejectDialog";
import { SignDialog } from "./SignDialog";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { api, fetchBlob } from "@/lib/api";
import { logError } from "@/lib/errors";
import { useAuth } from "@/lib/hooks/useAuth";
import type { ReportStatus, LabType } from "@/types";

export interface PdfViewModalProps {
  open: boolean;
  reportId: number | null;
  reportTitle: string | null;
  reportStatus?: ReportStatus;
  assignedTo?: number | null;
  createdBy?: number | null;
  reportLabType?: string | null;
  onOpenChange: (open: boolean) => void;
  onApproved?: () => void;
  onDeleted?: () => void;
  labTypes: LabType[];
}

export function PdfViewModal({
  open,
  reportTitle,
  reportId,
  reportStatus,
  assignedTo,
  createdBy,
  reportLabType,
  onOpenChange,
  onApproved,
  onDeleted,
  labTypes,
}: PdfViewModalProps) {
  const { getUser } = useAuth();
  const user = getUser();

  const MANAGEMENT_ROLES = ["superadmin", "admin", "senior_engineer"];
  const isManagement = MANAGEMENT_ROLES.includes(user?.roleName ?? "");
  const isOwner =
    user?.userId != null && createdBy != null && user.userId === createdBy;

  const labTypeId =
    labTypes.find((lt) => lt.type_name === reportLabType)?.id ?? null;

  const canEdit = isOwner || isManagement;
  const canDelete = isOwner || isManagement;
  const canSign =
    (reportStatus === "tested" || reportStatus === "rejected") && isOwner;
  const canApprove =
    reportStatus === "signed" && assignedTo !== undefined && isManagement;
  const canReject = reportStatus === "signed" && isManagement;

  const [deleteDialogOpener, setDeleteDialogOpener] = useState(false);
  const [editDialogOpener, setEditDialogOpener] = useState(false);
  const [signDialogOpen, setSignDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [comments, setComments] = useState<
    { comment: string; action_type: string; created_at: string }[]
  >([]);

  // Fetch rejection comments when viewing a rejected report
  useEffect(() => {
    if (!open || !reportId || reportStatus !== "rejected") {
      setComments([]);
      return;
    }
    api
      .get<{
        comments?: {
          comment: string;
          action_type: string;
          created_at: string;
        }[];
      }>(ENDPOINTS.REPORTS.DETAIL(reportId))
      .then((data) => setComments(data.comments ?? []))
      .catch((err) => logError(err, "Fetch report comments"));
  }, [open, reportId, reportStatus]);

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

          {/* Rejection comments banner */}
          {reportStatus === "rejected" && comments.length > 0 && (
            <div className="mx-4 mt-2 rounded-lg border border-orange-200 bg-orange-50 p-3">
              <p className="text-sm font-medium text-red-900 mb-1">
                Буцаасан шалтгаан:
              </p>
              {comments.map((c, i) => (
                <p key={i} className="text-sm text-orange-700">
                  {c.comment}
                </p>
              ))}
            </div>
          )}

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
            {canEdit && (
              <Button
                className="text-black bg-gray-200/75 hover:bg-gray-500 hover:text-white border-1 border-cyan-200 h-[28px]"
                onClick={onEditClick}
              >
                Тайлан засах
              </Button>
            )}

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

            {canReject && (
              <Button
                className="text-black bg-gray-200/75 hover:bg-orange-200 border-1 border-orange-500 h-[28px]"
                onClick={() => setRejectDialogOpen(true)}
              >
                Буцаах
              </Button>
            )}

            {canDelete && (
              <Button
                className="text-black bg-gray-200/75 hover:bg-red-200 border-1 border-red-500 h-[28px]"
                onClick={onDeleteClick}
              >
                Устгах
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <DeleteDialog
        reportId={reportId}
        deleteDialogOpener={deleteDialogOpener}
        setDeleteDialogOpener={setDeleteDialogOpener}
        onDeleted={() => {
          onOpenChange(false);
          onDeleted?.();
        }}
      />

      <EditReport
        open={editDialogOpener}
        onOpenChange={setEditDialogOpener}
        reportId={reportId}
        labTypes={labTypes}
        onSaved={() => {
          setEditDialogOpener(false);
        }}
      />

      <SignDialog
        open={signDialogOpen}
        onOpenChange={setSignDialogOpen}
        reportId={reportId}
        labTypeId={labTypeId}
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

      <RejectDialog
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        reportId={reportId}
        onRejected={() => {
          onOpenChange(false);
          onApproved?.();
        }}
      />
    </div>
  );
}
