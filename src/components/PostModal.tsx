import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { createPost } from '../data/store';

interface PostModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const PostModal: React.FC<PostModalProps> = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const [postType, setPostType] = useState<'buy' | 'sell'>('sell');
  const [quantity, setQuantity] = useState('');
  const [pricePerUnit, setPricePerUnit] = useState('');

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 쉼표를 제거한 숫자만 추출
    const value = e.target.value.replace(/,/g, '');
    // 숫자만 허용
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setQuantity(value);
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 쉼표를 제거한 숫자만 추출
    const value = e.target.value.replace(/,/g, '');
    // 숫자만 허용
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setPricePerUnit(value);
    }
  };

  const formatNumber = (value: string): string => {
    if (!value) return '';
    // 쉼표 제거 후 숫자로 변환
    const numValue = value.replace(/,/g, '');
    if (numValue === '') return '';
    const num = parseFloat(numValue);
    if (isNaN(num)) return value;
    // 천 단위 구분 쉼표 추가
    return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    // 쉼표 제거 후 숫자로 변환
    const qty = parseFloat(quantity.replace(/,/g, ''));
    const price = parseFloat(pricePerUnit.replace(/,/g, ''));

    if (isNaN(qty) || isNaN(price) || qty <= 0 || price <= 0) {
      alert('수량과 가격은 0보다 큰 숫자여야 합니다.');
      return;
    }

    createPost(user.id, postType, qty, price);
    onSuccess();
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
        zIndex: 1000
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '8px',
          minWidth: '400px',
          maxWidth: '90%'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginBottom: '20px' }}>게시글 작성</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>거래 유형</label>
            <div style={{ display: 'flex', gap: '15px' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="radio"
                  value="sell"
                  checked={postType === 'sell'}
                  onChange={(e) => setPostType(e.target.value as 'buy' | 'sell')}
                  style={{ marginRight: '5px' }}
                />
                판매 (Sell)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="radio"
                  value="buy"
                  checked={postType === 'buy'}
                  onChange={(e) => setPostType(e.target.value as 'buy' | 'sell')}
                  style={{ marginRight: '5px' }}
                />
                구매 (Buy)
              </label>
            </div>
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>수량</label>
            <input
              type="text"
              value={formatNumber(quantity)}
              onChange={handleQuantityChange}
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }}
              placeholder="수량을 입력하세요"
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>단가</label>
            <input
              type="text"
              value={formatNumber(pricePerUnit)}
              onChange={handlePriceChange}
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }}
              placeholder="단가를 입력하세요"
            />
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '8px 16px', border: '1px solid #ccc', cursor: 'pointer' }}
            >
              취소
            </button>
            <button
              type="submit"
              style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}
            >
              등록
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostModal;


