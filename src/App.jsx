
import { useState, useEffect } from 'react';
import axios from 'axios';

const api = import.meta.env.VITE_API_URL;

function App() {
  const [user, setUser] = useState({ username: '', password: '' });
  const [token, setToken] = useState(null);
  const [message, setMessage] = useState('');
  const [points, setPoints] = useState(0);
  const [studyStart, setStudyStart] = useState(null);
  const [rewards, setRewards] = useState([]);

  const signup = async () => {
    try {
      const res = await axios.post(`${api}/auth/signup`, user);
      setMessage('회원가입 성공');
    } catch (e) {
      setMessage(e.response?.data || '회원가입 실패');
    }
  };

  const login = async () => {
    try {
      const res = await axios.post(`${api}/auth/login`, user);
      setMessage(`환영합니다, ${res.data.username}님`);
      setToken(res.data.token);
      fetchPoints(res.data.username);
      fetchRewards();
    } catch (e) {
      setMessage(e.response?.data || '로그인 실패');
    }
  };

  const fetchPoints = async (username = user.username) => {
    const res = await axios.get(`${api}/points/${username}`);
    setPoints(res.data);
  };

  const fetchRewards = async () => {
    const res = await axios.get(`${api}/store/rewards`);
    setRewards(res.data);
  };

  const startStudy = () => {
    setStudyStart(new Date());
    setMessage('공부 시작!');
  };

  const stopStudy = async () => {
    if (!studyStart) return;
    const end = new Date();
    const duration = Math.floor((end - studyStart) / 1000); // 초 단위

    await axios.post(`${api}/study/stop`, {
      username: user.username,
      startTime: studyStart.toISOString(),
      endTime: end.toISOString(),
      category: 'baekjoon'
    });

    setStudyStart(null);
    setMessage(`공부 완료! 소요 시간: ${duration}초`);
    fetchPoints();
  };

  const buyReward = async (rewardId) => {
    try {
      const res = await axios.post(`${api}/store/buy`, {
        username: user.username,
        rewardId
      });
      setMessage('보상 구매 완료!');
      fetchPoints();
    } catch (e) {
      setMessage(e.response?.data?.message || '구매 실패');
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-6 rounded shadow-md w-full max-w-sm space-y-4">
          <h1 className="text-xl font-bold">Java 포인트 시스템</h1>
          <input className="border p-2 w-full" placeholder="아이디" onChange={e => setUser({ ...user, username: e.target.value })} />
          <input className="border p-2 w-full" placeholder="비밀번호" type="password" onChange={e => setUser({ ...user, password: e.target.value })} />
          <div className="flex gap-2">
            <button onClick={signup} className="bg-blue-500 text-white px-4 py-2 rounded">회원가입</button>
            <button onClick={login} className="bg-green-500 text-white px-4 py-2 rounded">로그인</button>
          </div>
          <div className="text-sm text-gray-700">{message}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">대시보드 - {user.username}</h1>
      <p>포인트: {points}</p>

      <div className="space-x-2">
        <button onClick={startStudy} className="bg-yellow-500 text-white px-4 py-2 rounded">공부 시작</button>
        <button onClick={stopStudy} className="bg-red-500 text-white px-4 py-2 rounded">공부 종료</button>
      </div>

      <div>
        <h2 className="font-semibold mt-4">보상 상점</h2>
        <ul className="space-y-2">
          {rewards.map(reward => (
            <li key={reward.id} className="flex justify-between items-center border p-2 rounded">
              <span>{reward.name} - {reward.cost} 포인트</span>
              <button onClick={() => buyReward(reward.id)} className="bg-blue-600 text-white px-2 py-1 rounded">구매</button>
            </li>
          ))}
        </ul>
      </div>

      <div className="text-sm text-gray-700">{message}</div>
    </div>
  );
}

export default App;
