/**
 * Header.jsx
 *
 * 쉼표 웹서비스의 공통 상단 네비게이션 바(GNB) 컴포넌트입니다.
 * 모든 페이지 상단에서 홈, 맞춤 위로, 익명 대나무숲, 비밀 일기장,
 * 마이페이지, 알림, 로그인/로그아웃 기능으로 이동할 수 있게 합니다.
 *
 * Firebase Auth를 통해 현재 로그인한 사용자를 확인하고,
 * Firestore의 alarms 컬렉션을 실시간으로 감지하여
 * 읽지 않은 알림이 있을 경우 알림 버튼에 표시합니다.
 */

import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { auth, db } from '../firebase';

// 데스크톱 메뉴와 모바일 메뉴에서 공통으로 사용할 네비게이션 목록
const NAV_ITEMS = [
  { label: '홈', path: '/', end: true },
  { label: '맞춤 위로', path: '/consolation' },
  { label: '익명 대나무숲', path: '/secret_forest' },
  { label: '비밀 일기장', path: '/secret_note' },
  { label: '마이페이지', path: '/mypage' },
];

// 현재 접속 중인 페이지에 따라 메뉴 스타일을 다르게 적용(반응형웹)
const getMenuClass = ({ isActive }) =>
  [
    'block py-2 md:py-0 md:pb-1 md:border-b-[3px] no-underline text-lg font-bold transition-colors',
    isActive
      ? 'text-[#1D2EE5] border-[#1D2EE5]'
      : 'text-black border-transparent hover:text-[#1D2EE5]',
  ].join(' ');

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [currentUser, setCurrentUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasUnreadAlarm, setHasUnreadAlarm] = useState(false);

  const userId = currentUser?.uid;
  const displayName = currentUser?.displayName || '쉼표';

  // Firebase Auth의 로그인 상태 변화를 감지하여 Header UI를 갱신
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);

      // 로그아웃 상태에서는 읽지 않은 알림 표시를 초기화
      if (!user) {
        setHasUnreadAlarm(false);
      }
    });

    return unsubscribe;
  }, []);

  // 모바일 메뉴가 열린 상태에서 다른 페이지로 이동하면 메뉴를 자동으로 닫음
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // 로그인한 사용자의 읽지 않은 알림 여부를 Firestore에서 실시간으로 확인
  useEffect(() => {
    if (!userId) return undefined;

    const unreadAlarmQuery = query(
      collection(db, 'alarms'),
      where('uid', '==', userId),
      where('isRead', '==', false)
    );

    const unsubscribe = onSnapshot(
      unreadAlarmQuery,
      (snapshot) => {
        setHasUnreadAlarm(!snapshot.empty);
      },
      (error) => {
        console.error('읽지 않은 알림 확인 실패:', error);
      }
    );

    return unsubscribe;
  }, [userId]);

  // 로그아웃 버튼 클릭 시 사용자 확인 후 Firebase 로그아웃 처리
  const handleLogout = async () => {
    const confirmLogout = window.confirm('로그아웃 하시겠습니까?');

    if (!confirmLogout) return;

    try {
      await signOut(auth);
      alert('성공적으로 로그아웃 되었습니다.');
      navigate('/');
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error('로그아웃 에러:', error);
      alert('로그아웃 중 오류가 발생했습니다.');
    }
  };

  // 같은 메뉴 목록을 데스크톱/모바일에서 재사용하기 위한 렌더링 함수
  const renderNavItems = () =>
    NAV_ITEMS.map(({ label, path, end }) => (
      <li key={path}>
        <NavLink to={path} end={end} className={getMenuClass}>
          {label}
        </NavLink>
      </li>
    ));

  // 읽지 않은 알림이 있을 때 알림 버튼 오른쪽 위에 작은 표시 점을 보여줌
  const renderUnreadAlarmDot = () =>
    hasUnreadAlarm && (
      <>
        <span
          className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white"
          aria-hidden="true"
        />
        <span className="sr-only">읽지 않은 알림이 있습니다.</span>
      </>
    );

  return (
    <header className="sticky top-0 left-0 w-full bg-white shadow-xs z-50">
      <div className="h-20 flex items-center justify-between px-6 md:px-12 box-border">
        <Link
          to="/"
          className="text-[#1D2EE5] text-3xl font-black no-underline whitespace-nowrap"
        >
          쉼표,
        </Link>

        <nav
          className="hidden lg:flex flex-1 justify-center"
          aria-label="주요 메뉴"
        >
          <ul className="flex list-none p-0 m-0 gap-8 xl:gap-16">
            {renderNavItems()}
          </ul>
        </nav>

        <div className="hidden lg:flex items-center gap-4 xl:gap-6">
          <Link
            to="/alarm"
            className="relative bg-[#F1B5B5] text-[#E71616] px-5 xl:px-6 py-2.5 rounded-md border-none font-bold text-base cursor-pointer whitespace-nowrap hover:bg-opacity-80 transition-all no-underline"
          >
            알림 소식
            {renderUnreadAlarmDot()}
          </Link>

          {currentUser ? (
            <div className="flex items-center gap-3 xl:gap-4">
              <span className="font-bold text-gray-700 text-lg whitespace-nowrap">
                <span className="text-[#1D2EE5]">{displayName}</span>
                님
              </span>

              <button
                type="button"
                onClick={handleLogout}
                className="bg-gray-100 text-gray-600 px-4 xl:px-5 py-2 rounded-md border border-gray-300 font-bold text-sm cursor-pointer whitespace-nowrap hover:bg-gray-200 transition-all"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="bg-[#9299E5] text-white px-5 xl:px-6 py-2.5 rounded-md border-none font-bold text-base cursor-pointer whitespace-nowrap hover:bg-opacity-90 transition-all"
            >
              로그인
            </button>
          )}
        </div>

        <button
          type="button"
          className="lg:hidden text-[#1D2EE5] p-2 focus:outline-none"
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          aria-label={isMobileMenuOpen ? '모바일 메뉴 닫기' : '모바일 메뉴 열기'}
          aria-expanded={isMobileMenuOpen}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            {isMobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-md absolute w-full left-0 top-20">
          <nav
            className="flex flex-col px-6 py-4"
            aria-label="모바일 주요 메뉴"
          >
            <ul className="flex flex-col list-none p-0 m-0 gap-2 mb-6">
              {renderNavItems()}
            </ul>

            <div className="flex flex-col gap-3 pt-4 border-t border-gray-100">
              {currentUser ? (
                <div className="flex flex-col gap-3">
                  <span className="font-bold text-gray-700 text-lg">
                    <span className="text-[#1D2EE5]">{displayName}</span>
                    님 환영합니다
                  </span>

                  <div className="flex gap-2">
                    <Link
                      to="/alarm"
                      className="relative flex-1 w-full bg-[#F1B5B5] text-[#E71616] px-4 py-3 rounded-md font-bold text-base hover:bg-opacity-80 transition-all no-underline text-center"
                    >
                      알림 소식
                      {hasUnreadAlarm && (
                        <>
                          <span
                            className="absolute top-2 right-2 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white"
                            aria-hidden="true"
                          />
                          <span className="sr-only">
                            읽지 않은 알림이 있습니다.
                          </span>
                        </>
                      )}
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex-1 w-full bg-gray-100 text-gray-600 px-4 py-3 rounded-md border border-gray-300 font-bold text-base hover:bg-gray-200 transition-all"
                    >
                      로그아웃
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link
                    to="/alarm"
                    className="flex-1 w-full bg-[#F1B5B5] text-[#E71616] px-4 py-3 rounded-md font-bold text-base hover:bg-opacity-80 transition-all no-underline text-center"
                  >
                    알림 소식
                  </Link>

                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="flex-1 w-full bg-[#9299E5] text-white px-4 py-3 rounded-md font-bold text-base hover:bg-opacity-90 transition-all"
                  >
                    로그인
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;