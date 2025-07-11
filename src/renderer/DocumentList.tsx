import React from "react";
import { Button } from "@/components/ui/button";

export type Document = {
  id: string;
  fileName: string;
};

export function DocumentList({
  documents,
  onPrint,
  onDownload,
  onDelete,
}: {
  documents: Document[];
  onPrint: (id: string) => void;
  onDownload: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="space-y-2 w-full max-w-xl mx-auto">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="flex items-center gap-2 p-2 bg-white rounded shadow border"
        >
          <span className="flex-1 text-left truncate">{doc.fileName}</span>
          <Button variant="outline" onClick={() => onPrint(doc.id)}>
            인쇄
          </Button>
          <Button variant="outline" onClick={() => onDownload(doc.id)}>
            다운로드
          </Button>
          <Button variant="destructive" onClick={() => onDelete(doc.id)}>
            삭제
          </Button>
        </div>
      ))}
    </div>
  );
}
