/**
 * Alarm.jsx
 *
 * 쉼표 웹서비스의 알림 센터 페이지입니다.
 * 로그인한 사용자가 받은 댓글 알림과 안아주기 알림을 최신순으로 보여줍니다.
 *
 * - 댓글 알림 클릭: 해당 대나무숲 게시글 상세 페이지로 이동
 * - 안아주기 알림 클릭: 따뜻한 배경 효과를 3초간 표시
 * - 알림 페이지 진입 시: 읽지 않은 알림을 읽음 처리
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  writeBatch,
} from 'firebase/firestore';
import { auth, db } from '../firebase';

const WARM_EFFECT_DURATION = 3000; // 안아주기 알림 클릭 시 따뜻한 배경 효과 지속 시간

// 로딩 상태, 알림이 없는 상태에서 공통으로 사용하는 카드 스타일
const STATUS_CARD_CLASS =
  'bg-gray-50 rounded-lg p-10 flex justify-center items-center border border-gray-200';

const getTimestampMillis = (timestamp) => {
  if (!timestamp) return 0;

  if (typeof timestamp.toMillis === 'function') {
    return timestamp.toMillis();
  }

  if (typeof timestamp.toDate === 'function') {
    return timestamp.toDate().getTime();
  }

  return 0;
};

// 알림 목록을 최신순으로 정렬
const sortAlarmsByLatest = (alarmList) => {
  return [...alarmList].sort(
    (a, b) => getTimestampMillis(b.createdAt) - getTimestampMillis(a.createdAt)
  );
};

// 알림 생성 시점으로부터 경과한 시간을 사람이 읽을 수 있는 형태로 변환
const getTimeAgo = (timestamp) => {
  if (!timestamp || typeof timestamp.toDate !== 'function') {
    return '방금 전';
  }

  const now = new Date();
  const past = timestamp.toDate();
  const diffInMinutes = Math.floor((now - past) / (1000 * 60));

  if (diffInMinutes < 1) return '방금 전';
  if (diffInMinutes < 60) return `${diffInMinutes}분 전`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}시간 전`;

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}일 전`;
};

// 읽지 않은 알림을 읽음 상태로 변경
const markUnreadAlarmsAsRead = async (alarmDocs) => {
  const unreadDocs = alarmDocs.filter(
    (docSnap) => docSnap.data().isRead === false
  );

  if (unreadDocs.length === 0) return;

  const batch = writeBatch(db);

  unreadDocs.forEach((docSnap) => {
    const alarmRef = doc(db, 'alarms', docSnap.id);
    batch.update(alarmRef, { isRead: true });
  });

  await batch.commit();
};

const Alarm = () => {
  const navigate = useNavigate();
  const warmTimerRef = useRef(null);

  const [currentUserId, setCurrentUserId] = useState(null);
  const [isWarm, setIsWarm] = useState(false);
  const [alarms, setAlarms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Firebase Auth를 통해 로그인 여부를 확인하고, 비로그인 사용자는 접근 제한
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setCurrentUserId(null);
        setIsLoading(false);
        alert('로그인이 필요한 서비스입니다.');
        navigate('/login', { replace: true });
        return;
      }

      setCurrentUserId(user.uid);
    });

    return unsubscribe;
  }, [navigate]);

  // 로그인한 사용자의 알림 목록을 실시간으로 불러옴.
  useEffect(() => {
    if (!currentUserId) return undefined;

    setIsLoading(true);

    const alarmQuery = query(
      collection(db, 'alarms'),
      where('uid', '==', currentUserId)
    );

    const unsubscribe = onSnapshot(
      alarmQuery,
      (querySnapshot) => {
        const fetchedAlarms = querySnapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));

        setAlarms(sortAlarmsByLatest(fetchedAlarms));
        setIsLoading(false);

        // 알림 센터에 진입하면 읽지 않은 알림을 읽음 상태로 변경
        markUnreadAlarmsAsRead(querySnapshot.docs).catch((error) => {
          console.error('알림 읽음 처리 실패:', error);
        });
      },
      (error) => {
        console.error('알림 불러오기 실패:', error);
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, [currentUserId]);

  // 안아주기 알림 클릭 시 실행되는 3초간의 따뜻한 배경 효과
  const playWarmEffect = useCallback(() => {
    if (warmTimerRef.current) {
      clearTimeout(warmTimerRef.current);
    }

    setIsWarm(true);

    warmTimerRef.current = setTimeout(() => {
      setIsWarm(false);
    }, WARM_EFFECT_DURATION);
  }, []);

  // 컴포넌트가 사라질 때 남아 있는 타이머를 정리
  useEffect(() => {
    return () => {
      if (warmTimerRef.current) {
        clearTimeout(warmTimerRef.current);
      }
    };
  }, []);

  // 알림 클릭 시 해당 알림의 유형에 따라 다른 동작 수행
  const handleAlarmClick = (alarm) => {
    if (alarm.type === 'hug') {
      playWarmEffect();
      return;
    }

    if (alarm.type === 'comment' && alarm.postId) {
      navigate(`/secret_forest/${alarm.postId}`);
    }
  };

  // 알림 목록을 렌더링 (로딩 상태, 알림 없음 상태, 알림 존재 상태 구분하여 렌더링)
  const renderAlarmContent = () => {
    if (isLoading) {
      return (
        <div className={STATUS_CARD_CLASS}>
          <p className="text-gray-500 font-bold text-lg">
            소식을 불러오는 중입니다...
          </p>
        </div>
      );
    }

    if (alarms.length === 0) {
      return (
        <div className={STATUS_CARD_CLASS}>
          <p className="text-gray-500 font-bold text-lg">
            새로운 알림이 없습니다.
          </p>
        </div>
      );
    }

    return alarms.map((alarm) => (
      <button
        key={alarm.id}
        type="button"
        onClick={() => handleAlarmClick(alarm)}
        className="text-left w-full px-6 py-5 bg-white border border-gray-300 rounded-sm hover:bg-gray-50 transition-all shadow-sm"
      >
        <p className="text-base font-bold text-gray-800 mb-2">
          {alarm.message}
        </p>
        <p className="text-sm text-gray-400 font-medium">
          {getTimeAgo(alarm.createdAt)}
        </p>
      </button>
    ));
  };

  return (
    <div
      className={`min-h-screen transition-all duration-1000 ${
        isWarm
          ? 'bg-linear-to-br from-[#FADCD9] via-[#FFF1EF] to-transparent'
          : 'bg-transparent'
      }`}
    >
      <main className="w-full max-w-5xl mx-auto pt-16 pb-12 px-4">
        <section className="text-left mb-10 px-2">
          <h1 className="text-4xl font-bold text-[#1D2EE5] mb-2">
            마음 소식 알림 센터
          </h1>
          <p className="text-gray-500 text-lg">
            나의 흔적에 다른 사용자들이 전해온 따스한 정서 교감 내역
          </p>
        </section>

        <section className="flex flex-col gap-4" aria-label="알림 목록">
          {renderAlarmContent()}
        </section>
      </main>
    </div>
  );
};

export default Alarm;