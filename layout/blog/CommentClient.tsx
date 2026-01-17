"use client";
import { useState } from "react";
import Link from "next/link";

type CommentType = {
  id: number;
  authorName: string;
  authorEmail?: string | null;
  authorHomepage?: string | null;
  content: string;
  isSecret: boolean;
  createdAt: string;
  replies?: CommentType[];
};

type Props = {
  postId: number;
  comments: CommentType[];
  canViewSecret?: boolean; // 작성자/관리자만 true
};

const CommentSection = ({ postId, comments, canViewSecret = false }: Props) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mt-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">댓글 {comments.length}개</h2>

      {/* 댓글 목록 */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} postId={postId} canViewSecret={canViewSecret} />
        ))}
      </div>

      {/* 댓글 작성 폼 */}
      <CommentForm postId={postId} parentId={null} />
    </div>
  );
};

// 개별 댓글 컴포넌트
const CommentItem = ({ comment, postId, canViewSecret, isReply = false }: { comment: CommentType; postId: number; canViewSecret: boolean; isReply?: boolean }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const date = new Date(comment.createdAt);

  // 비밀댓글이고 볼 수 없는 경우
  if (comment.isSecret && !canViewSecret) {
    return (
      <div className={`${isReply ? "ml-12" : ""}`}>
        <div className="border-l-4 border-gray-300 pl-4 py-3 bg-gray-50 rounded-r">
          <p className="text-gray-500 text-sm">🔒 비밀댓글입니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isReply ? "ml-12" : ""}`}>
      <div className="border-l-4 border-blue-500 pl-4">
        {/* 댓글 헤더 */}
        <div className="flex items-center gap-2 mb-2 text-sm">
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

        {/* 홈페이지 (있는 경우) */}
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

        {/* 댓글 내용 */}
        <div className="text-gray-700 whitespace-pre-wrap mb-3">{comment.content}</div>

        {/* 답글 버튼 */}
        {!isReply && (
          <button onClick={() => setShowReplyForm(!showReplyForm)} className="text-sm text-gray-500 hover:text-blue-600 transition">
            답글 작성
          </button>
        )}

        {/* 답글 작성 폼 */}
        {showReplyForm && (
          <div className="mt-4">
            <CommentForm postId={postId} parentId={comment.id} onCancel={() => setShowReplyForm(false)} />
          </div>
        )}
      </div>

      {/* 대댓글 목록 */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} postId={postId} canViewSecret={canViewSecret} isReply={true} />
          ))}
        </div>
      )}
    </div>
  );
};

// 댓글 작성 폼
const CommentForm = ({ postId, parentId, onCancel }: { postId: number; parentId: number | null; onCancel?: () => void }) => {
  const [formData, setFormData] = useState({
    authorName: "",
    authorEmail: "",
    authorHomepage: "",
    content: "",
    isSecret: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.authorName.trim()) {
      alert("이름을 입력해주세요");
      return;
    }

    if (!formData.content.trim()) {
      alert("내용을 입력해주세요");
      return;
    }

    try {
      const res = await fetch(`/api/blog/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          parentId,
        }),
      });

      if (!res.ok) throw new Error("Failed to post comment");

      alert("댓글이 등록되었습니다");
      setFormData({
        authorName: "",
        authorEmail: "",
        authorHomepage: "",
        content: "",
        isSecret: false,
      });

      if (onCancel) onCancel();

      // 페이지 새로고침 또는 댓글 목록 refetch
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("댓글 등록에 실패했습니다");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          type="text"
          placeholder="이름 *"
          required
          value={formData.authorName}
          onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <input
          type="email"
          placeholder="이메일"
          value={formData.authorEmail}
          onChange={(e) => setFormData({ ...formData, authorEmail: e.target.value })}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <input
          type="url"
          placeholder="홈페이지"
          value={formData.authorHomepage}
          onChange={(e) => setFormData({ ...formData, authorHomepage: e.target.value })}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

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
