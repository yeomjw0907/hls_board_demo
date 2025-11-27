import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getCommentsByPostId, getUserById, createComment, calculateRemainingQuantity, calculateReservedQuantity, getPostById } from '../data/store';
import { Post, Comment, PostTag } from '../types';
import CommentItem from './CommentItem';

interface CommentModalProps {
  post: Post;
  onClose: () => void;
  onSuccess: () => void;
}

const CommentModal: React.FC<CommentModalProps> = ({ post: initialPost, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [declaredQuantity, setDeclaredQuantity] = useState('');
  const [offeredPrice, setOfferedPrice] = useState('');
  const [text, setText] = useState('');
  const [post, setPost] = useState<Post>(initialPost as Post);

  useEffect(() => {
    loadComments();
    loadPost();
  }, [initialPost.id]);

  const loadComments = () => {
    const postComments = getCommentsByPostId(post.id);
    setComments(postComments);
  };

  const loadPost = () => {
    const updatedPost = getPostById(post.id);
    if (updatedPost) {
      setPost(updatedPost as Post);
    }
  };

  const handleCommentUpdate = () => {
    loadComments();
    loadPost();
    onSuccess();
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 쉼표를 제거한 숫자만 추출
    const value = e.target.value.replace(/,/g, '');
    // 숫자만 허용
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setDeclaredQuantity(value);
    }
  };

  const formatQuantity = (value: string): string => {
    if (!value) return '';
    // 쉼표 제거 후 숫자로 변환
    const numValue = value.replace(/,/g, '');
    if (numValue === '') return '';
    const num = parseFloat(numValue);
    if (isNaN(num)) return value;
    // 천 단위 구분 쉼표 추가
    return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 쉼표를 제거한 숫자만 추출
    const value = e.target.value.replace(/,/g, '');
    // 숫자만 허용
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setOfferedPrice(value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    // 쉼표 제거 후 숫자로 변환
    const qty = parseFloat(declaredQuantity.replace(/,/g, ''));
    if (isNaN(qty) || qty <= 0) {
      alert('수량은 0보다 큰 숫자여야 합니다.');
      return;
    }

    // SELL 게시글: 수량 체크
    if (post.type === 'sell') {
      const remainingQty = calculateRemainingQuantity(post.id);
      // 잔여 수량보다 크면 안됨 (잔여 수량과 같을 때는 허용)
      if (qty > remainingQty) {
        alert(`선언 수량이 잔여 수량(${remainingQty.toLocaleString()})보다 클 수 없습니다.`);
        return;
      }
    }

    // BUY 게시글: 가격 체크
    let price: number | undefined = undefined;
    if (post.type === 'buy') {
      const priceValue = parseFloat(offeredPrice.replace(/,/g, ''));
      if (isNaN(priceValue) || priceValue <= 0) {
        alert('제안 가격은 0보다 큰 숫자여야 합니다.');
        return;
      }
      price = priceValue;
    }

    createComment(post.id, user.id, qty, text, price);
    setDeclaredQuantity('');
    setOfferedPrice('');
    setText('');
    loadComments();
    onSuccess();
  };

  const postWriter = getUserById(post.carrier_id);
  const isPostWriter = user?.id === post.carrier_id;
  const reservedQuantity = calculateReservedQuantity(post.id);
  const remainingQuantity = calculateRemainingQuantity(post.id);

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

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        overflow: 'auto'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '8px',
          minWidth: '500px',
          maxWidth: '90%',
          maxHeight: '90vh',
          overflow: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ marginBottom: '20px' }}>
          <h2>게시글</h2>
          <div style={{ marginTop: '10px', padding: '10px', backgroundColor: (post.status_tag as PostTag) === 'end_trade' ? '#e9ecef' : '#f5f5f5' }}>
            <div>작성자: {postWriter?.company_name} ({postWriter?.first_name} {postWriter?.last_name})</div>
            <div>수량 / 예약 중 수량 / 잔여 수량: {post.quantity.toLocaleString()} / {reservedQuantity.toLocaleString()} / {remainingQuantity.toLocaleString()}</div>
            <div>단가: {(post.status_tag as PostTag) === 'end_trade' ? '***' : `$${post.price_per_unit.toLocaleString()}`}</div>
            <div>등록 날짜: {formatDate(post.created_at)}</div>
            <div>상태: {post.status_tag || '대기'}</div>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3>댓글 ({comments.length})</h3>
          {comments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              post={post}
              isPostWriter={isPostWriter}
              onUpdate={handleCommentUpdate}
            />
          ))}
        </div>

        {user && (post.status_tag as PostTag) !== 'end_trade' && (
          <form onSubmit={handleSubmit} style={{ borderTop: '1px solid #ccc', paddingTop: '20px' }}>
            <h3>거래 의도 선언</h3>
            
            {post.type === 'buy' && (
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>제안 가격</label>
                <input
                  type="text"
                  value={formatQuantity(offeredPrice)}
                  onChange={handlePriceChange}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }}
                  placeholder="제안 가격을 입력하세요"
                />
                {offeredPrice && !isNaN(parseFloat(offeredPrice.replace(/,/g, ''))) && parseFloat(offeredPrice.replace(/,/g, '')) > 0 && (post.status_tag as PostTag) !== 'end_trade' && (
                  <div style={{ marginTop: '5px', color: '#666', fontSize: '14px' }}>
                    게시글 가격: ${post.price_per_unit.toLocaleString()}
                  </div>
                )}
              </div>
            )}
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                {post.type === 'sell' ? '선언 수량' : '수량'}
              </label>
              <input
                type="text"
                value={formatQuantity(declaredQuantity)}
                onChange={handleQuantityChange}
                required
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }}
                placeholder="수량을 입력하세요"
              />
              {post.type === 'sell' && declaredQuantity && !isNaN(parseFloat(declaredQuantity.replace(/,/g, ''))) && parseFloat(declaredQuantity.replace(/,/g, '')) > 0 && (
                <div style={{ marginTop: '5px', color: '#666', fontSize: '14px' }}>
                  총 단가: ${(parseFloat(declaredQuantity.replace(/,/g, '')) * post.price_per_unit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              )}
              {post.type === 'buy' && offeredPrice && declaredQuantity && !isNaN(parseFloat(offeredPrice.replace(/,/g, ''))) && !isNaN(parseFloat(declaredQuantity.replace(/,/g, ''))) && parseFloat(offeredPrice.replace(/,/g, '')) > 0 && parseFloat(declaredQuantity.replace(/,/g, '')) > 0 && (
                <div style={{ marginTop: '5px', color: '#666', fontSize: '14px' }}>
                  총 단가: ${(parseFloat(declaredQuantity.replace(/,/g, '')) * parseFloat(offeredPrice.replace(/,/g, ''))).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              )}
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>내용</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
                rows={3}
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={onClose}
                style={{ padding: '8px 16px', border: '1px solid #ccc', cursor: 'pointer' }}
              >
                닫기
              </button>
              <button
                type="submit"
                style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}
              >
                등록
              </button>
            </div>
          </form>
        )}

        {user && (post.status_tag as PostTag) === 'end_trade' && (
          <div style={{ borderTop: '1px solid #ccc', paddingTop: '20px', textAlign: 'right' }}>
            <div style={{ marginBottom: '15px', color: '#666' }}>
              거래가 종료되어 댓글을 작성할 수 없습니다.
            </div>
            <button
              onClick={onClose}
              style={{ padding: '8px 16px', border: '1px solid #ccc', cursor: 'pointer' }}
            >
              닫기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentModal;


