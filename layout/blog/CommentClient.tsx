"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/apiFetch";

type CommentType = {
  id: number;
  authorName: string;
  authorEmail?: string | null;
  authorHomepage?: string | null;
  content: string;
  isSecret: boolean;
  createdAt: string | Date;
  replies?: CommentType[];
};

type Props = {
  postId: number;
  comments: CommentType[];
  canViewSecret?: boolean;
};

const CommentSection = ({ postId, comments, canViewSecret = false }: Props) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mt-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">댓글 {comments.length}개</h2>

      <div className="space-y-6">
        {comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} postId={postId} canViewSecret={canViewSecret} isAdmin={canViewSecret} />
        ))}
      </div>

      <CommentForm postId={postId} parentId={null} isAdmin={canViewSecret} />
    </div>
  );
};

const DeletePasswordModal = ({ open, onClose, onConfirm, busy }: { open: boolean; onClose: () => void; onConfirm: (password: string) => void; busy?: boolean }) => {
  const [password, setPassword] = useState("");

  useMemo(() => {
    if (open) setPassword("");
    return null;
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => {
          if (!busy) onClose();
        }}
      />

      <div className="relative w-[92vw] max-w-md rounded-xl bg-white shadow-xl border border-gray-200 p-5">
        <h3 className="text-lg font-semibold text-gray-900">댓글 삭제</h3>
        <p className="text-sm text-gray-600 mt-1">작성 시 설정한 비밀번호를 입력해주세요.</p>

        <div className="mt-4">
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={!!busy}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-2">* 비밀번호가 일치하면 댓글이 삭제됩니다.</p>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} disabled={!!busy} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50">
            취소
          </button>
          <button type="button" onClick={() => onConfirm(password)} disabled={!!busy || password.trim().length < 1} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50">
            {busy ? "확인 중..." : "삭제"}
          </button>
        </div>
      </div>
    </div>
  );
};

const CommentItem = ({ comment, postId, canViewSecret, isAdmin = false, isReply = false }: { comment: CommentType; postId: number; canViewSecret: boolean; isAdmin?: boolean; isReply?: boolean }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pwModalOpen, setPwModalOpen] = useState(false);

  const date = new Date(comment.createdAt);

  if (comment.isSecret && !canViewSecret) {
    return (
      <div className={`${isReply ? "ml-12" : ""}`}>
        <div className="border-l-4 border-gray-300 pl-4 py-3 bg-gray-50 rounded-r">
          <p className="text-gray-500 text-sm">🔒 비밀댓글입니다</p>
        </div>
      </div>
    );
  }

  const doDelete = async (password?: string) => {
    setIsDeleting(true);
    try {
      // ✅ apiFetch 사용: body 넣으면 자동 JSON 처리됨
      await apiFetch(`/blog/comments/${comment.id}`, {
        method: "DELETE",
        body: password ? { password } : undefined,
        cache: "no-store",
      });

      alert("댓글이 삭제되었습니다");
      window.location.reload();
    } catch (err: any) {
      console.error("Delete error:", err);
      alert(`댓글 삭제에 실패했습니다: ${err.message}`);
      setIsDeleting(false);
    }
  };

  const handleDeleteClick = async () => {
    if (!confirm("정말 이 댓글을 삭제하시겠습니까?")) return;

    if (isAdmin) {
      // ✅ 관리자: 바로 삭제
      await doDelete();
      return;
    }

    // ✅ 일반: 비밀번호 모달
    setPwModalOpen(true);
  };

  const handlePasswordConfirm = async (password: string) => {
    if (!password.trim()) {
      alert("비밀번호를 입력해주세요");
      return;
    }
    setPwModalOpen(false);
    await doDelete(password);
  };

  return (
    <div className={`${isReply ? "ml-12" : ""}`}>
      <DeletePasswordModal open={pwModalOpen} busy={isDeleting} onClose={() => setPwModalOpen(false)} onConfirm={handlePasswordConfirm} />

      <div className="border-l-4 border-blue-500 pl-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-sm">
            {comment.authorHomepage ? (
              <Link href={comment.authorHomepage} target="_blank" rel="noopener noreferrer" className="font-semibold text-gray-900 hover:text-blue-600">
                {comment.authorName}
              </Link>
            ) : (
              <span className="font-semibold text-gray-900">{comment.authorName}</span>
            )}

            <span className="text-gray-400">•</span>

            <time className="text-gray-500">
              {date
                .toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                })
                .replace(/\. /g, "-")
                .replace(".", "")}{" "}
              {date.toLocaleTimeString("ko-KR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </time>

            {comment.isSecret && (
              <>
                <span className="text-gray-400">•</span>
                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">🔒 비밀댓글</span>
              </>
            )}
          </div>

          <button onClick={handleDeleteClick} disabled={isDeleting} className="text-xs text-red-600 hover:text-red-700 hover:underline disabled:opacity-50" title={isAdmin ? "관리자 삭제" : "비밀번호로 삭제"}>
            {isDeleting ? "삭제 중..." : "삭제"}
          </button>
        </div>

        {comment.authorHomepage && (
          <div className="mb-2">
            <span className="text-xs text-gray-500">
              homepage:{" "}
              <Link href={comment.authorHomepage} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                {comment.authorHomepage}
              </Link>
            </span>
          </div>
        )}

        <div className="text-gray-700 whitespace-pre-wrap mb-3">{comment.content}</div>

        {!isReply && (
          <button onClick={() => setShowReplyForm(!showReplyForm)} className="text-sm text-gray-500 hover:text-blue-600 transition">
            답글 작성
          </button>
        )}

        {showReplyForm && (
          <div className="mt-4">
            <CommentForm postId={postId} parentId={comment.id} onCancel={() => setShowReplyForm(false)} isAdmin={isAdmin} />
          </div>
        )}
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} postId={postId} canViewSecret={canViewSecret} isAdmin={isAdmin} isReply={true} />
          ))}
        </div>
      )}
    </div>
  );
};

const CommentForm = ({ postId, parentId, onCancel, isAdmin = false }: { postId: number; parentId: number | null; onCancel?: () => void; isAdmin?: boolean }) => {
  const [formData, setFormData] = useState({
    authorName: "",
    authorEmail: "",
    authorHomepage: "",
    authorPassword: "",
    content: "",
    isSecret: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = isAdmin
      ? {
          ...formData,
          authorName: "관리자",
          authorEmail: "admin@example.com",
          authorPassword: "admin-password",
        }
      : formData;

    if (!submitData.authorName.trim()) {
      alert("이름을 입력해주세요");
      return;
    }

    if (!isAdmin && !submitData.authorPassword.trim()) {
      alert("비밀번호를 입력해주세요");
      return;
    }

    if (!isAdmin && submitData.authorPassword.length < 4) {
      alert("비밀번호는 4자 이상이어야 합니다");
      return;
    }

    if (!submitData.content.trim()) {
      alert("내용을 입력해주세요");
      return;
    }

    try {
      // ✅ 여기도 apiFetch로 바꾸고 싶으면 아래처럼
      await apiFetch(`/blog/posts/${postId}/comments`, {
        method: "POST",
        body: {
          ...submitData,
          parentId,
        },
        cache: "no-store",
      });

      alert("댓글이 등록되었습니다");
      setFormData({
        authorName: "",
        authorEmail: "",
        authorHomepage: "",
        authorPassword: "",
        content: "",
        isSecret: false,
      });

      if (onCancel) onCancel();

      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("댓글 등록에 실패했습니다");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      {!isAdmin && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="이름 *"
              required
              value={formData.authorName}
              onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="password"
              placeholder="비밀번호 * (4자 이상)"
              required
              minLength={4}
              maxLength={20}
              value={formData.authorPassword}
              onChange={(e) => setFormData({ ...formData, authorPassword: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="email"
              placeholder="이메일 (선택)"
              value={formData.authorEmail}
              onChange={(e) => setFormData({ ...formData, authorEmail: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="url"
              placeholder="홈페이지 (선택)"
              value={formData.authorHomepage}
              onChange={(e) => setFormData({ ...formData, authorHomepage: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </>
      )}

      <textarea
        placeholder="댓글을 입력하세요 *"
        required
        rows={4}
        value={formData.content}
        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
      />

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input type="checkbox" checked={formData.isSecret} onChange={(e) => setFormData({ ...formData, isSecret: e.target.checked })} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
          비밀댓글
        </label>

        <div className="flex gap-2">
          {onCancel && (
            <button type="button" onClick={onCancel} className="px-5 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
              취소
            </button>
          )}
          <button type="submit" className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition">
            {parentId ? "답글 등록" : "댓글 등록"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default CommentSection;
