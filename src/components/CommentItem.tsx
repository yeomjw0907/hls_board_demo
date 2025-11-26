import React from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserById, updateComment, updatePost, deleteComment, checkAndUpdatePostStatus, calculateRemainingQuantity } from '../data/store';
import { Comment, Post } from '../types';

interface CommentItemProps {
  comment: Comment;
  post: Post;
  isPostWriter: boolean;
  onUpdate: () => void;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, post, isPostWriter, onUpdate }) => {
  const { user } = useAuth();
  const commentWriter = getUserById(comment.carrier_id);
  const isCommentWriter = user?.id === comment.carrier_id;
  const isSuperAdmin = user?.role === 'super_admin';
  const canViewContent = isPostWriter || isSuperAdmin;
  const remainingQuantity = calculateRemainingQuantity(post.id);
  const canAccept = comment.declared_quantity <= remainingQuantity;

  const handleAccept = () => {
    // 잔여 수량 체크
    if (comment.declared_quantity > remainingQuantity) {
      alert(`잔여 수량(${remainingQuantity.toLocaleString()})보다 큰 수량(${comment.declared_quantity.toLocaleString()})은 수락할 수 없습니다.\n남은 수량만큼만 수락하거나, 거래를 거절하고 새로운 게시글을 작성하세요.`);
      return;
    }

    if (window.confirm('거래를 수락하시겠습니까?')) {
      updateComment(comment.id, { comment_tag: 'in_trade' });
      updatePost(post.id, { status_tag: 'in_trade' });
      // 잔여 수량 체크 및 상태 업데이트
      checkAndUpdatePostStatus(post.id);
      alert('이메일로 전송되었습니다 (데모)');
      onUpdate();
    }
  };

  const handleReject = () => {
    if (window.confirm('거래를 거절하시겠습니까?')) {
      updateComment(comment.id, { comment_tag: 'rejected' });
      updatePost(post.id, { status_tag: '' });
      onUpdate();
    }
  };

  const handleDelete = () => {
    if (window.confirm('댓글을 삭제하시겠습니까?')) {
      deleteComment(comment.id);
      onUpdate();
    }
  };

  return (
    <div
      style={{
        border: '1px solid #ddd',
        padding: '15px',
        marginBottom: '10px',
        backgroundColor: comment.comment_tag === 'in_trade' ? '#d4edda' : comment.comment_tag === 'rejected' ? '#f8d7da' : 'white'
      }}
    >
      <div style={{ marginBottom: '10px' }}>
        <div style={{ fontWeight: 'bold' }}>
          {commentWriter?.company_name} ({commentWriter?.first_name} {commentWriter?.last_name})
          {comment.comment_tag && ` [${comment.comment_tag}]`}
        </div>
        <div>선언 수량: {comment.declared_quantity.toLocaleString()}</div>
        {canViewContent && <div>{comment.text}</div>}
      </div>
      
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
        {isPostWriter && comment.comment_tag === '' && (
          <>
            {!canAccept && (
              <div style={{ color: '#dc3545', fontSize: '12px', marginRight: '10px' }}>
                잔여 수량({remainingQuantity.toLocaleString()})보다 큼
              </div>
            )}
            <button
              onClick={handleAccept}
              disabled={!canAccept}
              style={{ 
                padding: '5px 15px', 
                backgroundColor: canAccept ? '#28a745' : '#6c757d', 
                color: 'white', 
                border: 'none', 
                cursor: canAccept ? 'pointer' : 'not-allowed',
                opacity: canAccept ? 1 : 0.6
              }}
            >
              수락
            </button>
            <button
              onClick={handleReject}
              style={{ padding: '5px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', cursor: 'pointer' }}
            >
              거절
            </button>
          </>
        )}
        {isCommentWriter && (
          <button
            onClick={handleDelete}
            style={{ padding: '5px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', cursor: 'pointer' }}
          >
            삭제
          </button>
        )}
      </div>
    </div>
  );
};

export default CommentItem;


