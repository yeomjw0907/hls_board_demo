import React from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserById, deletePost, updatePost, calculateRemainingQuantity, calculateReservedQuantity } from '../data/store';
import { Post } from '../types';

interface PostItemProps {
  post: Post;
  onClick: () => void;
  onUpdate: () => void;
}

const PostItem: React.FC<PostItemProps> = ({ post, onClick, onUpdate }) => {
  const { user } = useAuth();
  const postWriter = getUserById(post.carrier_id);
  const isPostWriter = user?.id === post.carrier_id;
  const isSuperAdmin = user?.role === 'super_admin';

  const handleDelete = () => {
    if (window.confirm('게시글을 삭제하시겠습니까?')) {
      deletePost(post.id);
      onUpdate();
    }
  };

  const handleEdit = () => {
    const newQuantity = prompt('수량을 입력하세요:', post.quantity.toString());
    if (newQuantity) {
      const qty = parseFloat(newQuantity);
      if (!isNaN(qty) && qty > 0) {
        updatePost(post.id, { quantity: qty });
        onUpdate();
      }
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const reservedQuantity = calculateReservedQuantity(post.id);
  const remainingQuantity = calculateRemainingQuantity(post.id);

  return (
    <div
      style={{
        border: '1px solid #ddd',
        padding: '15px',
        marginBottom: '10px',
        cursor: 'pointer',
        backgroundColor: post.status_tag === 'end_trade' ? '#e9ecef' : post.status_tag === 'in_trade' ? '#fff3cd' : post.status_tag === 'reserved' ? '#d1ecf1' : 'white'
      }}
      onClick={onClick}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
            {post.status_tag && `[${post.status_tag}]`}
          </div>
          <div>작성자: {postWriter?.company_name} ({postWriter?.first_name} {postWriter?.last_name})</div>
          <div>수량 / 예약 중 수량 / 잔여 수량: {post.quantity.toLocaleString()} / {reservedQuantity.toLocaleString()} / {remainingQuantity.toLocaleString()}</div>
          <div>단가: ${post.price_per_unit.toLocaleString()}</div>
          <div>등록 날짜: {formatDate(post.created_at)}</div>
        </div>
        {(isPostWriter || isSuperAdmin) && (
          <div style={{ display: 'flex', gap: '5px' }} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEdit();
              }}
              style={{ padding: '5px 10px', fontSize: '12px', backgroundColor: '#ffc107', border: 'none', cursor: 'pointer' }}
            >
              수정
            </button>
            {isSuperAdmin && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                style={{ padding: '5px 10px', fontSize: '12px', backgroundColor: '#dc3545', color: 'white', border: 'none', cursor: 'pointer' }}
              >
                삭제
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostItem;


