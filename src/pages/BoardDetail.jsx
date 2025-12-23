import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PasswordModal from "../components/PasswordModal";
import { apiGet, apiJson } from "../api/http";

export default function BoardDetail() {
  const { id } = useParams(); 
  const nav = useNavigate();

  const [post, setPost] = useState(null);
  const [err, setErr] = useState("");

  const [pwModal, setPwModal] = useState({ open: false, mode: null }); 
 //mode: 'delete' | 'edit-open' | 'edit-save'

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState({ title: "", content: "" });



  // 게시글 상세 조회 (초기 로딩 / 수정 후 재조회 공용)
  const load = async () => {
    const data = await apiGet(`/api/posts/${id}`);
    setPost(data);
    setDraft({ title: data?.title ?? "", content: data?.content ?? "" });
  };

  useEffect(() => {
    (async () => {
      try {
        setErr("");
        await load();
      } catch (e) {
        setErr(e.message);
      }
    })();
  }, [id]);

  const requestDelete = () => setPwModal({ open: true, mode: "delete" });


  // 수정 버튼 클릭 시 → 비밀번호 확인 후 편집 모드 진입
  const requestEdit = () => {
  setDraft({ title: post?.title ?? "", content: post?.content ?? "" });
  setPwModal({ open: true, mode: "edit-open" }); // ✅ 편집 열기용
};


  const cancelEdit = () => {
    setIsEditing(false);
    setDraft({ title: post?.title ?? "", content: post?.content ?? "" });
  };


  /**
 * 비밀번호 확인 후 처리
 * - delete    : 게시글 삭제
 * - edit-open : 편집 모드 진입
 * - edit-save : 수정 내용 저장
 */

  const onConfirmPassword = async (pw) => {
  try {
    if (!pw?.trim()) return alert("비밀번호를 입력하세요.");

    await apiJson(`/api/posts/${id}/verify-password`, "POST", { postPassword: pw });

    if (pwModal.mode === "delete") {
      const ok = window.confirm("정말로 삭제하시겠습니까?");
      if (!ok) return;

      await apiJson(`/api/posts/${id}/delete`, "POST", { postPassword: pw });
      setPwModal({ open: false, mode: null });
      nav("/");
      return;
    }

    if (pwModal.mode === "edit-open") {
      // 비번 맞으면 편집 열기 + 모달 닫기
      setPwModal({ open: false, mode: null });
      setIsEditing(true);
      return;
    }

    if (pwModal.mode === "edit-save") {
      //  비번 맞으면 저장(update)
      if (!draft.title.trim()) return alert("제목을 입력하세요.");
      if (!draft.content.trim()) return alert("내용을 입력하세요.");

      await apiJson(`/api/posts/${id}/update`, "POST", {
        title: draft.title,
        content: draft.content,
        postPassword: pw,
      });

      setPwModal({ open: false, mode: null });
      setIsEditing(false);
      await load();
      alert("수정 완료");
      return;
    }
  } catch (e) {
    alert(e.message || "비밀번호가 틀립니다.");
  }
};


  if (err) return <div style={{ padding: 24 }}>{err}</div>;
  if (!post) return <div style={{ padding: 24 }}>로딩중...</div>;

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: 24 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        {isEditing ? (
          <input
            value={draft.title}
            onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))}
            style={{ flex: 1, fontSize: 24, fontWeight: 700 }}
          />
        ) : (
          <h1 style={{ margin: 0 }}>{post.title}</h1>
        )}
        <button onClick={() => nav("/")} style={{ padding: "10px 14px" }}>
          목록
        </button>
      </header>

      <div style={{ marginTop: 8, opacity: 0.7, fontSize: 13 }}>{post.createdAt}</div>

      <div style={{ marginTop: 16, whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
        {isEditing ? (
          <textarea
            value={draft.content}
            onChange={(e) => setDraft((p) => ({ ...p, content: e.target.value }))}
            rows={12}
            style={{ width: "100%" }}
          />
        ) : (
          post.content
        )}
      </div>

      <section style={{ marginTop: 20 }}>
        <h3>첨부파일</h3>
        {post.files?.length ? (
          <ul>
            {post.files.map((f) => (
              <li key={f.fileId}>
                <a href={`/api/files/${f.fileId}/download`}>{f.originalName}</a>
              </li>
            ))}
          </ul>
        ) : (
          <div style={{ opacity: 0.7 }}>첨부 없음</div>
        )}
      </section>

      <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
        {!isEditing ? (
          <>
            <button onClick={requestEdit}>수정</button>
            <button onClick={requestDelete}>삭제</button>
          </>
        ) : (
          <>
           <button onClick={() => setPwModal({ open: true, mode: "edit-save" })}>저장</button>
            <button onClick={cancelEdit}>취소</button>
          </>
        )}
      </div>

      <PasswordModal
        open={pwModal.open}
        title={pwModal.mode === "delete" ? "삭제 비밀번호 입력" : "수정 비밀번호 입력"}
        onClose={() => setPwModal({ open: false, mode: null })}
        onConfirm={onConfirmPassword}
      />
    </div>
  );
}
