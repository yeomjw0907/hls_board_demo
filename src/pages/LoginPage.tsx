import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUsers } from '../data/store';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const users = getUsers();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (login(email, password)) {
      // 로그인 성공
    } else {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.');
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '400px', margin: '100px auto' }}>
      <h1 style={{ marginBottom: '30px' }}>게시판(프로토타입)</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>이메일</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }}
          />
        </div>
        {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}
        <button
          type="submit"
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          로그인
        </button>
      </form>
      
      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f5f5f5', fontSize: '12px' }}>
        <strong>테스트 계정:</strong>
        <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
          {users.map(user => (
            <li key={user.id}>
              {user.email} / {user.password}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default LoginPage;


