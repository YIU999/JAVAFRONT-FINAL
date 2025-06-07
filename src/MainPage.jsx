import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

const api = import.meta.env.VITE_API_URL;

/**
 * 사용자별 포인트, 보상 상점 정보를 표시하고, 공부 시작/종료, 보상 구매 기능을 제공하는 메인 페이지 컴포넌트.
 * @param {object} props 
 * @param {string} props.username
 */
function MainPage({ username }) {

  const [points, setPoints] = useState(0); // 사용자의 현재 포인트
  const [rewards, setRewards] = useState([]); // 보상 상점 목록
  const [isLoading, setIsLoading] = useState(true); // 데이터 로딩 상태
  const [error, setError] = useState(''); // 오류 메시지 (API 호출 실패 또는 비즈니스 로직 오류 등)


  /**
   * 현재 사용자의 포인트를 백엔드에서 불러옵니다.
   * @memoized
   */
  const fetchPoints = useCallback(async () => {
    if (!username) {
      setError('유저 정보가 없어 포인트를 조회할 수 없습니다.');
      return;
    }
    try {
      const res = await axios.get(`${api}/points/${username}`);
      setPoints(res.data);
      setError(''); 
    } catch (e) {
      console.error('포인트 조회 실패:', e);
      const errorMessage = e.response?.data?.message || '포인트 조회에 실패했습니다. 잠시 후 다시 시도해주세요.';
      setError(errorMessage);
    }
  }, [username]);

  /**
   * 보상 상점의 목록을 백엔드에서 불러옵니다.
   * @memoized
   */
  const fetchRewards = useCallback(async () => {
    try {
      const res = await axios.get(`${api}/store/rewards`);
      console.log("백엔드로부터 받은 보상 목록:", res.data);

      if (Array.isArray(res.data)) {
        setRewards(res.data);
      } else {
        console.warn('보상 조회 응답 형식이 배열이 아닙니다:', res.data);
        setRewards([]);
      }
      setError('');
    } catch (e) {
      console.error('보상 조회 실패:', e);

      const errorMessage = e.response?.data?.message || '보상 상점 정보를 불러오지 못했습니다. 백엔드 상태를 확인해주세요.';
      setError(errorMessage);
    }
  }, []);


  useEffect(() => {
    if (!username) {
      setError('유저 정보가 없습니다. 다시 로그인해주세요.');
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchPoints(),
        fetchRewards()
      ]);
      setIsLoading(false);
    };

    loadData();
  }, [username, fetchPoints, fetchRewards]);

  // =========================================================
  // 액션 처리 함수들 (공부 시작/종료, 보상 구매)
  // =========================================================

  /**
   * 공부 시작 버튼 클릭 시 호출됩니다.
   */
  const startStudy = async () => {
    if (!username) { setError('유저 정보가 없어 공부를 시작할 수 없습니다.'); return; }
    try {
      await axios.post(`${api}/study/start`, { username });
      setError('');
      alert('✅ 공부가 시작되었습니다!');
    } catch (e) {
      console.error('공부 시작 실패:', e);
      const errorMessage = e.response?.data?.message || '공부 시작에 실패했습니다. 이미 세션이 진행 중일 수 있습니다.';
      setError(errorMessage);
      alert(`⚠️ ${errorMessage}`);
    }
  };

  /**
   * 공부 종료 버튼 클릭 시 호출됩니다.
   */
  const endStudy = async () => {
    if (!username) { setError('유저 정보가 없어 공부를 종료할 수 없습니다.'); return; }
    try {
      await axios.post(`${api}/study/end`, { username });
      setError('');
      alert('✅ 공부가 종료되고 포인트가 적립되었습니다!');
      fetchPoints();
    } catch (e) {
      console.error('공부 종료 실패:', e);
      const errorMessage = e.response?.data?.message || '공부 종료에 실패했습니다. 시작된 세션이 없거나 서버 오류입니다.';
      setError(errorMessage);
      alert(`⚠️ ${errorMessage}`);
    }
  };

  /**
   * 보상 구매 버튼 클릭 시 호출됩니다.
   * @param {number} rewardId 
   * @param {number} rewardCost 
   */
  const purchaseReward = async (rewardId, rewardCost) => {
    if (!username) { setError('유저 정보가 없어 보상을 구매할 수 없습니다.'); return; }

    if (points < rewardCost) {
      alert('⚠️ 포인트가 부족합니다!');
      setError('포인트가 부족하여 보상을 구매할 수 없습니다.');
      return;
    }

    try {
      const res = await axios.post(`${api}/store/buy`, { username, rewardId });
      setError('');

      const purchasedRewardName = res.data.rewardName || res.data.message || '보상';
      alert(`✅ "${purchasedRewardName}" 보상이 성공적으로 구매되었습니다!`);
      fetchPoints();
    } catch (e) {
      console.error('보상 구매 실패:', e);
      const purchaseError = e.response?.data?.message || '보상 구매에 실패했습니다. 관리자에게 문의하세요.';
      setError(purchaseError);
      alert(`⚠️ ${purchaseError}`);
    }
  };

  // =========================================================
  // 렌더링 부분: 로딩, 오류, 메인 콘텐츠 표시
  // =========================================================


  if (isLoading) {
    return (
      <div className="p-6 text-center text-gray-600">
        <p>데이터를 불러오는 중입니다...</p>
      </div>
    );
  }


  if (error) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl text-red-500 font-bold">⚠️ 오류: {error}</h2>
        <button
          onClick={() => {
            setError('');
            
          }}
          className="mt-4 bg-gray-200 px-4 py-2 rounded"
        >
          다시 시도 / 로그인 페이지로 돌아가기
        </button>
      </div>
    );
  }


  return (
    <div className="p-6 space-y-4 max-w-2xl mx-auto bg-white shadow-lg rounded-lg">
      <h2 className="text-3xl font-extrabold text-gray-800 border-b pb-3 mb-4">안녕하세요, <span className="text-blue-600">{username}</span>님!</h2>
      <p className="text-lg text-gray-700">현재 보유 포인트: <span className="font-bold text-xl text-green-600">{points}</span>점</p>

      <div className="flex space-x-3 mt-5">
        <button
          onClick={startStudy}
          className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-semibold py-3 px-6 rounded-lg transition duration-300 ease-in-out shadow-md"
        >
          🚀 공부 시작
        </button>
        <button
          onClick={endStudy}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-300 ease-in-out shadow-md"
        >
          ✅ 공부 종료 (포인트 적립!)
        </button>
      </div>

      <h3 className="text-2xl font-bold text-gray-800 mt-8 border-b pb-2">🎁 보상 상점</h3>
      {rewards.length === 0 ? (

        <p className="text-gray-600">현재 이용 가능한 보상이 없습니다.</p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rewards.map((r) => (
            <li key={r.id} className="border border-gray-200 p-4 rounded-lg shadow-sm bg-gray-50 flex justify-between items-center">
              <div>
                <span className="font-semibold text-lg text-gray-900">{r.name}</span> - <span className="text-purple-600">{r.cost}</span> 포인트
              </div>
              <button
                onClick={() => purchaseReward(r.id, r.cost)}
                className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded-md transition duration-300 ease-in-out shadow"
              >
                구매하기
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* error 상태가 UI에 표시되므로, 중복되는 오류 메시지 표시는 주석 처리 */}
      {/* {error && <p className="text-red-500 mt-4">{error}</p>} */}
    </div>
  );
}

export default MainPage;