import { useState } from "react";



// 비밀번호 입력을 위한 공용 모달 컴포넌트
// - open: 표시 여부 제어 (부모 상태)
// - onConfirm: 비밀번호 확인 콜백

export default function PasswordModal({ open, title, onClose, onConfirm }) {
  const [pw, setPw] = useState("");
  
   // 모달이 닫힌 상태면 렌더링하지 않음
  if (!open) return null;

  const confirm = () => {
    onConfirm(pw);
    setPw("");
  };

  return (
    <div
      onClick={onClose} // 배경 클릭 시 모달 닫기
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
        display: "grid", placeItems: "center", padding: 16,
      }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ width: "min(520px, 100%)", background: "#fff", borderRadius: 12, padding: 16 }}>
        <h3 style={{ marginTop: 0 }}>{title}</h3>
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="비밀번호 입력"
          style={{ width: "100%", padding: 10 }}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
          <button onClick={onClose}>취소</button>
          <button onClick={confirm} style={{ padding: "8px 12px" }}>확인</button>
        </div>
      </div>
    </div>
  );
}
