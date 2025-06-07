import { useState } from 'react';
import MainPage from './MainPage';
import axios from 'axios';

const api = import.meta.env.VITE_API_URL;

function App() {
  const [user, setUser] = useState({ username: '', password: '' });
  const [currentUser, setCurrentUser] = useState(null);
  const [message, setMessage] = useState('');

  const login = async () => {
    try {
      const res = await axios.post(`${api}/auth/login`, user);
      console.log('✅ 로그인 응답:', res.data);
      if (res.data && res.data.username) {
        setCurrentUser(res.data);
        setMessage('');
      } else {
        setMessage('⚠️ 로그인 응답 형식 오류');
      }
    } catch (e) {
      const errorText =
        typeof e.response?.data === 'string'
          ? e.response.data
          : '로그인 실패: 서버 오류';
      console.error('로그인 실패:', errorText);
      setMessage(errorText);
    }
  };

  const signup = async () => {
    try {
      const res = await axios.post(`${api}/auth/signup`, user);
      console.log('✅ 회원가입 응답:', res.data); // 디버깅
      const successText =
        typeof res.data === 'string' ? res.data : '회원가입 성공';
      setMessage(successText);
    } catch (e) {
      const errorText =
        typeof e.response?.data === 'string'
          ? e.response.data
          : '회원가입 실패: 서버 오류';
      console.error('회원가입 실패:', errorText);
      setMessage(errorText);
    }
  };

  if (currentUser) {
    return <MainPage username={currentUser.username} />;
  }

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto mt-20 bg-white shadow rounded">
      <h1 className="text-2xl font-bold">Java 포인트 시스템</h1>

      <input
        type="text"
        placeholder="아이디"
        className="border p-2 w-full"
        value={user.username}
        onChange={(e) => setUser({ ...user, username: e.target.value })}
      />
      <input
        type="password"
        placeholder="비밀번호"
        className="border p-2 w-full"
        value={user.password}
        onChange={(e) => setUser({ ...user, password: e.target.value })}
      />

      <div className="space-x-2">
        <button
          onClick={signup}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          회원가입
        </button>
        <button
          onClick={login}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          로그인
        </button>
      </div>

      {message && <p className="text-red-500">{message}</p>}
    </div>
  );
}

export default App;
