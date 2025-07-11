import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SettingsDialog({
  open,
  onOpenChange,
  authCode,
  setAuthCode,
  remoteUrl,
  setRemoteUrl,
  onDeleteUrl,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  authCode: string;
  setAuthCode: (v: string) => void;
  remoteUrl: string;
  setRemoteUrl: (v: string) => void;
  onDeleteUrl: () => void;
  onSave: () => void;
}) {
  const [localAuthCode, setLocalAuthCode] = useState(authCode);
  const [localRemoteUrl, setLocalRemoteUrl] = useState(remoteUrl);

  // 숫자만 입력되도록
  const handleAuthCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    setLocalAuthCode(val);
  };

  const handleRemoteUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalRemoteUrl(e.target.value);
  };

  const handleSave = () => {
    setAuthCode(localAuthCode);
    setRemoteUrl(localRemoteUrl);
    onSave();
    onOpenChange(false);
  };

  const handleCancel = () => {
    setLocalAuthCode(authCode);
    setLocalRemoteUrl(remoteUrl);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>설정</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block mb-1">인증번호</label>
            <Input
              value={localAuthCode}
              onChange={handleAuthCodeChange}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={10}
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="block mb-1">원격서버URL</label>
              <Input
                value={localRemoteUrl}
                onChange={handleRemoteUrlChange}
                placeholder="원격 서버 URL 입력"
              />
            </div>
            <Button variant="outline" onClick={onDeleteUrl} type="button">
              URL 삭제
            </Button>
          </div>
        </div>
        <DialogFooter className="mt-4 flex gap-2 justify-end">
          <Button variant="outline" onClick={handleCancel} type="button">
            취소
          </Button>
          <Button onClick={handleSave} type="button">
            저장
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
