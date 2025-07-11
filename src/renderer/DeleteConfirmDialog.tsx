import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  fileName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  fileName: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>문서 삭제</DialogTitle>
        </DialogHeader>
        <div className="py-4">정말로 "{fileName}" 문서를 삭제하시겠습니까?</div>
        <DialogFooter className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)} type="button">
            취소
          </Button>
          <Button variant="destructive" onClick={onConfirm} type="button">
            삭제
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
