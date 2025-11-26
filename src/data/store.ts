import { Carrier, Post, Comment } from '../types';
import productPlan from '../../product-plan.json';

const DUMMY_USERS: Carrier[] = productPlan.product.dummy_users.map(user => ({
  id: user.id,
  first_name: user.first_name,
  last_name: user.last_name,
  email: user.email,
  country_code: user.country_code,
  phone_number: user.phone_number,
  company_name: user.company_name,
  password: user.password,
  role: user.role as Carrier['role'],
}));

let posts: Post[] = [];
let comments: Comment[] = [];
let postNumberCounter = 1;

export const getUsers = (): Carrier[] => DUMMY_USERS;

export const getUserByEmail = (email: string): Carrier | undefined => {
  return DUMMY_USERS.find(user => user.email === email);
};

export const getUserById = (id: string): Carrier | undefined => {
  return DUMMY_USERS.find(user => user.id === id);
};

export const getPosts = (): Post[] => {
  return [...posts].sort((a, b) => b.created_at - a.created_at);
};

export const getPostById = (id: string): Post | undefined => {
  return posts.find(post => post.id === id);
};

export const createPost = (carrierId: string, quantity: number, pricePerUnit: number): Post => {
  const newPost: Post = {
    id: `post_${Date.now()}`,
    post_number: postNumberCounter++,
    carrier_id: carrierId,
    quantity,
    price_per_unit: pricePerUnit,
    status_tag: '',
    created_at: Date.now(),
  };
  posts.push(newPost);
  return newPost;
};

export const updatePost = (postId: string, updates: Partial<Post>): Post | undefined => {
  const postIndex = posts.findIndex(p => p.id === postId);
  if (postIndex === -1) return undefined;
  posts[postIndex] = { ...posts[postIndex], ...updates };
  return posts[postIndex];
};

export const deletePost = (postId: string): boolean => {
  const postIndex = posts.findIndex(p => p.id === postId);
  if (postIndex === -1) return false;
  posts.splice(postIndex, 1);
  comments = comments.filter(c => c.post_id !== postId);
  return true;
};

export const getCommentsByPostId = (postId: string): Comment[] => {
  return comments.filter(c => c.post_id === postId).sort((a, b) => a.created_at - b.created_at);
};

export const createComment = (
  postId: string,
  carrierId: string,
  declaredQuantity: number,
  text: string
): Comment => {
  const newComment: Comment = {
    id: `comment_${Date.now()}`,
    post_id: postId,
    carrier_id: carrierId,
    declared_quantity: declaredQuantity,
    text,
    comment_tag: '',
    created_at: Date.now(),
  };
  comments.push(newComment);
  
  // 댓글 작성 시 게시글 상태를 'reserved'로 변경
  const post = posts.find(p => p.id === postId);
  if (post && post.status_tag === '') {
    post.status_tag = 'reserved';
  }
  
  return newComment;
};

export const updateComment = (commentId: string, updates: Partial<Comment>): Comment | undefined => {
  const commentIndex = comments.findIndex(c => c.id === commentId);
  if (commentIndex === -1) return undefined;
  comments[commentIndex] = { ...comments[commentIndex], ...updates };
  return comments[commentIndex];
};

export const deleteComment = (commentId: string): boolean => {
  const comment = comments.find(c => c.id === commentId);
  if (!comment) return false;
  
  const postId = comment.post_id;
  const commentIndex = comments.findIndex(c => c.id === commentId);
  if (commentIndex === -1) return false;
  
  comments.splice(commentIndex, 1);
  
  // 댓글 삭제 후 reserved 상태 확인
  const post = posts.find(p => p.id === postId);
  if (post) {
    // 해당 게시글의 reserved 상태인 댓글이 있는지 확인
    const hasReservedComment = comments.some(
      c => c.post_id === postId && c.comment_tag === ''
    );
    
    // reserved 상태인 댓글이 없으면 post 상태를 ''로 변경
    if (!hasReservedComment && post.status_tag === 'reserved') {
      post.status_tag = '';
    }
  }
  
  return true;
};

export const calculateReservedQuantity = (postId: string): number => {
  const postComments = comments.filter(c => c.post_id === postId);
  
  // 예약 중 수량: comment_tag가 ''인 댓글들의 합계 (거래가 되거나 거래 거절이 되지 않은 것)
  const reservedQuantity = postComments
    .filter(c => c.comment_tag === '')
    .reduce((sum, c) => sum + c.declared_quantity, 0);
  
  return reservedQuantity;
};

export const calculateRemainingQuantity = (postId: string): number => {
  const post = posts.find(p => p.id === postId);
  if (!post) return 0;
  
  const postComments = comments.filter(c => c.post_id === postId);
  
  // 거래 완료 수량 (comment_tag가 'in_trade'인 댓글들의 합계)
  const inTradeQuantity = postComments
    .filter(c => c.comment_tag === 'in_trade')
    .reduce((sum, c) => sum + c.declared_quantity, 0);
  
  // 잔여 수량 = 최초 수량 - 거래 완료 수량
  const remaining = post.quantity - inTradeQuantity;
  
  return Math.max(0, remaining);
};

export const checkAndUpdatePostStatus = (postId: string): void => {
  const post = posts.find(p => p.id === postId);
  if (!post) return;
  
  const remaining = calculateRemainingQuantity(postId);
  
  // 잔여 수량이 0이면 거래 종료 상태로 변경
  if (remaining === 0 && post.status_tag !== 'end_trade') {
    post.status_tag = 'end_trade';
  }
};


