import { useEffect, useRef, useState } from "react";

// 비밀번호 입력 모달
export default function PasswordModal({ open, title, onClose, onConfirm }) {
  const [pw, setPw] = useState("");
  const inputRef = useRef(null);

  // open 시 입력 초기화 + 포커스
  useEffect(() => {
    if (!open) return;
    setPw("");
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  if (!open) return null;

  const close = () => {
    setPw("");
    onClose?.();
  };

  const confirm = () => {
    const v = pw.trim();
    if (!v) return;
    onConfirm?.(v);
    setPw("");
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") confirm();
    if (e.key === "Escape") close();
  };

  return (
    <div
      onClick={close}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "grid",
        placeItems: "center",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        style={{
          width: "min(520px, 100%)",
          background: "#fff",
          borderRadius: 12,
          padding: 16,
        }}
      >
        <h3 style={{ marginTop: 0 }}>{title}</h3>

        <input
          ref={inputRef}
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="비밀번호 입력"
          style={{ width: "100%", padding: 10, boxSizing: "border-box" }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            marginTop: 12,
          }}
        >
          <button type="button" onClick={close}>
            취소
          </button>
          <button type="button" onClick={confirm} style={{ padding: "8px 12px" }}>
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
