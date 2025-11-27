import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getPosts, checkAndUpdatePostStatus } from '../data/store';
import { Post } from '../types';
import PostModal from '../components/PostModal';
import CommentModal from '../components/CommentModal';
import PostItem from '../components/PostItem';

const BoardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [sortBy, setSortBy] = useState<'latest' | 'quantity' | 'price'>('latest');
  const [filterType, setFilterType] = useState<'all' | 'buy' | 'sell'>('all');
  const [filterQuantity, setFilterQuantity] = useState('');
  const [filterPrice, setFilterPrice] = useState('');

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = () => {
    const allPosts = getPosts();
    // 각 게시글의 잔여 수량을 체크하고 상태 업데이트
    allPosts.forEach(post => {
      checkAndUpdatePostStatus(post.id);
    });
    setPosts(allPosts);
  };

  const handlePostCreated = () => {
    loadPosts();
    setShowPostModal(false);
  };

  const handleCommentCreated = () => {
    loadPosts();
    setShowCommentModal(false);
    setSelectedPost(null);
  };

  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
    setShowCommentModal(true);
  };

  const filteredAndSortedPosts = () => {
    let filtered = [...posts];

    // 타입 필터
    if (filterType !== 'all') {
      filtered = filtered.filter(p => p.type === filterType);
    }

    if (filterQuantity) {
      const qty = parseFloat(filterQuantity);
      filtered = filtered.filter(p => p.quantity >= qty);
    }

    if (filterPrice) {
      const price = parseFloat(filterPrice);
      filtered = filtered.filter(p => p.price_per_unit <= price);
    }

    if (sortBy === 'latest') {
      filtered.sort((a, b) => b.created_at - a.created_at);
    } else if (sortBy === 'quantity') {
      filtered.sort((a, b) => b.quantity - a.quantity);
    } else if (sortBy === 'price') {
      filtered.sort((a, b) => a.price_per_unit - b.price_per_unit);
    }

    return filtered;
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>게시판 프로토타입</h1>
        <div>
          <span style={{ marginRight: '15px' }}>
            {user?.first_name} {user?.last_name} ({user?.role})
          </span>
          <button onClick={logout} style={{ padding: '5px 15px' }}>
            로그아웃
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={() => setShowPostModal(true)}
          style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}
        >
          게시글 작성
        </button>
        
        <div style={{ display: 'flex', gap: '5px' }}>
          <button
            onClick={() => setFilterType('all')}
            style={{ 
              padding: '5px 15px', 
              backgroundColor: filterType === 'all' ? '#007bff' : '#6c757d', 
              color: 'white', 
              border: 'none', 
              cursor: 'pointer' 
            }}
          >
            전체
          </button>
          <button
            onClick={() => setFilterType('buy')}
            style={{ 
              padding: '5px 15px', 
              backgroundColor: filterType === 'buy' ? '#007bff' : '#6c757d', 
              color: 'white', 
              border: 'none', 
              cursor: 'pointer' 
            }}
          >
            구매
          </button>
          <button
            onClick={() => setFilterType('sell')}
            style={{ 
              padding: '5px 15px', 
              backgroundColor: filterType === 'sell' ? '#007bff' : '#6c757d', 
              color: 'white', 
              border: 'none', 
              cursor: 'pointer' 
            }}
          >
            판매
          </button>
        </div>
        
        <label>
          정렬:
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            style={{ marginLeft: '5px', padding: '5px' }}
          >
            <option value="latest">최신순</option>
            <option value="quantity">수량순</option>
            <option value="price">가격순</option>
          </select>
        </label>

        <label>
          수량 필터 (이상):
          <input
            type="number"
            value={filterQuantity}
            onChange={(e) => setFilterQuantity(e.target.value)}
            style={{ marginLeft: '5px', padding: '5px', width: '100px' }}
            placeholder="수량"
          />
        </label>

        <label>
          가격 필터 (이하):
          <input
            type="number"
            value={filterPrice}
            onChange={(e) => setFilterPrice(e.target.value)}
            style={{ marginLeft: '5px', padding: '5px', width: '100px' }}
            placeholder="가격"
          />
        </label>
      </div>

      <div>
        {filteredAndSortedPosts().map(post => (
          <PostItem
            key={post.id}
            post={post}
            onClick={() => handlePostClick(post)}
            onUpdate={loadPosts}
          />
        ))}
        {filteredAndSortedPosts().length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            게시글이 없습니다.
          </div>
        )}
      </div>

      {showPostModal && (
        <PostModal
          onClose={() => setShowPostModal(false)}
          onSuccess={handlePostCreated}
        />
      )}

      {showCommentModal && selectedPost && (
        <CommentModal
          post={selectedPost}
          onClose={() => {
            setShowCommentModal(false);
            setSelectedPost(null);
          }}
          onSuccess={handleCommentCreated}
        />
      )}
    </div>
  );
};

export default BoardPage;


