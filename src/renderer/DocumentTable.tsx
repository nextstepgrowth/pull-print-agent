import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";

export type Document = {
  id: string;
  fileName: string;
};

export function DocumentTable({
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
    <Table className="bg-white rounded-md shadow">
      <TableHeader>
        <TableRow>
          <TableHead className="w-full">파일 이름</TableHead>
          <TableHead className="w-[280px] text-center">액션</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {documents.map((doc) => (
          <TableRow key={doc.id}>
            <TableCell className="truncate max-w-[400px]">{doc.fileName}</TableCell>
            <TableCell className="text-right space-x-2">
              <Button variant="outline" size="sm" onClick={() => onPrint(doc.id)}>인쇄</Button>
              <Button variant="outline" size="sm" onClick={() => onDownload(doc.id)}>다운로드</Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">삭제</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>문서 삭제</AlertDialogTitle>
                  </AlertDialogHeader>
                  정말로 "{doc.fileName}" 문서를 삭제하시겠습니까?
                  <AlertDialogFooter>
                    <AlertDialogCancel>취소</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(doc.id)}>삭제</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
