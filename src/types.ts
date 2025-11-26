export type UserRole = 'carrier_user' | 'buyer_user' | 'super_admin';

export type PostTag = '' | 'reserved' | 'in_trade' | 'end_trade' | 'canceled';
export type CommentTag = '' | 'in_trade' | 'rejected';

export interface Carrier {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  country_code: string;
  phone_number: string;
  company_name: string;
  password: string;
  role: UserRole;
}

export interface Post {
  id: string;
  post_number: number;
  carrier_id: string;
  quantity: number;
  price_per_unit: number;
  status_tag: PostTag;
  created_at: number;
}

export interface Comment {
  id: string;
  post_id: string;
  carrier_id: string;
  declared_quantity: number;
  text: string;
  comment_tag: CommentTag;
  created_at: number;
}


