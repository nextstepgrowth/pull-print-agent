import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { DocumentList, Document } from "./DocumentList";
import { SettingsDialog } from "./SettingsDialog";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { GearIcon } from "@radix-ui/react-icons";

const MOCK_DOCS: Document[] = [
  { id: "1", fileName: "문서1.pdf" },
  { id: "2", fileName: "문서2.docx" },
  { id: "3", fileName: "문서3.xlsx" },
];

function App() {
  const [authCode, setAuthCode] = useState("123456");
  const [remoteUrl, setRemoteUrl] = useState("");
  const [docs, setDocs] = useState<Document[]>(MOCK_DOCS);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id?: string }>({ open: false });

  // 문서 삭제
  const handleDelete = (id: string) => {
    setDeleteDialog({ open: true, id });
  };
  const confirmDelete = () => {
    if (deleteDialog.id) {
      setDocs((prev) => prev.filter((d) => d.id !== deleteDialog.id));
    }
    setDeleteDialog({ open: false });
  };

  // 설정 다이얼로그에서 URL 삭제
  const handleDeleteUrl = () => setRemoteUrl("");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단바 */}
      <header className="flex items-center justify-between px-6 py-4 bg-white shadow">
        <div className="flex items-center gap-4">
          <span className="font-bold text-xl">🖨️ PullPrint</span>
          <span className="ml-2 text-gray-700 text-sm">인증번호: <b>{authCode}</b></span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setSettingsOpen(true)}>
          <GearIcon className="w-5 h-5" />
        </Button>
      </header>

      {/* 문서 리스트 */}
      <main className="max-w-2xl mx-auto mt-8 px-2">
        <DocumentList
          documents={docs}
          onPrint={() => {}}
          onDownload={() => {}}
          onDelete={handleDelete}
        />
      </main>

      {/* 삭제 확인 모달 */}
      <DeleteConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog((prev) => ({ ...prev, open }))}
        onConfirm={confirmDelete}
        fileName={docs.find((d) => d.id === deleteDialog.id)?.fileName || ""}
      />

      {/* 설정 다이얼로그 */}
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        authCode={authCode}
        setAuthCode={setAuthCode}
        remoteUrl={remoteUrl}
        setRemoteUrl={setRemoteUrl}
        onDeleteUrl={handleDeleteUrl}
        onSave={() => {}}
      />
    </div>
  );
}

export default App;
