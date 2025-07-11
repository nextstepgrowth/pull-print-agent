import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { DocumentTable, Document } from "./DocumentTable";
import { SettingsDialog } from "./SettingsDialog";

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
  

  // 문서 삭제 (Table 내부 AlertDialog에서 호출)
  const handleDelete = (id: string) => {
    setDocs((prev) => prev.filter((d) => d.id !== id));
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
        <DocumentTable
          documents={docs}
          onPrint={() => {}}
          onDownload={() => {}}
          onDelete={handleDelete}
        />
      </main>

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
