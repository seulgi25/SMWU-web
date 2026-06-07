//상단 고정 네비게이션 바(GNB) 만들기->Header
//GNB는 웹페이지의 최상단에 고정되어 항상 보이는 네비게이션 바입니다.
//GNB에는 웹페이지의 이름과 주요 메뉴 목록이 포함되어 있습니다.
//GNB는 웹페이지의 모든 페이지에서 동일하게 나타납니다.
//GNB는 한 줄로 나열한다. 메뉴 목록은 웹페이지 이름 옆에 위치한다.
//GNB 가장 왼쪽에 '쉼표,'라는 웹페이지 이름이 쓰여있다.
//'쉼표,' 글씨는 찐한 '#1D2EE5' 색상을 사용한다.
//'쉼표,' 글씨는 웹페이지 이름을 나타내며, 클릭하면 웹페이지가 새로 로딩된다.
//웹페이지 이름 옆에는 '홈', '맞춤 위로', '익명 대나무숲', '비밀 일기장', '마이페이지' 목록이 있다.
//목록은 일정 간격을 두고 쉼표 제목과 함께 한 줄로 나열한다.
//이 목록은 각각 '홈'은 './pages/Home', './pages/Consolation', './pages/Secret_forest', './pages/Secret_note', './pages/Mypage'로 이동한다.
//'쉼표' 웹페이지 이름을 누르면 다시 웹페이지가 새로 로딩이 된다.
//'마이페이지' 목록 옆에는 알림 소식 버튼과 로그인 버튼이 존재한다.
//'알림 소식' 버튼을 누르면 './pages/Alarm'으로, '로그인'버튼을 누르면 './pages/Login'으로 각각 이동한다.
//'알림 소식' 버튼은 '#F1B5B5' 배경에 '#E71616' 글씨로 쓴다.
//'로그인' 버튼은 '#9299E5' 배경에 '#FFFFFF' 글씨를 쓴다.
//'알림소식' 버튼과 '로그인' 버튼은 일정 간격을 두고 나란히 위치한다.
//css는 Tailwind CSS로 작성한다.
//Header.jsx의 배경색은 흰색으로 설정한다. Header.jsx는 화면의 상단에 고정한다.
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [currentUser, setCurrentUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasUnreadAlarm, setHasUnreadAlarm] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
        setHasUnreadAlarm(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'alarms'),
      where('uid', '==', currentUser.uid),
      where('isRead', '==', false)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setHasUnreadAlarm(!snapshot.empty);
      },
      (error) => {
        console.error('읽지 않은 알림 확인 실패:', error);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  const handleLogout = async () => {
    const confirmLogout = window.confirm('로그아웃 하시겠습니까?');
    if (confirmLogout) {
      try {
        await signOut(auth);
        alert('성공적으로 로그아웃 되었습니다.');
        navigate('/');
        setIsMobileMenuOpen(false);
      } catch (error) {
        console.error('로그아웃 에러:', error);
        alert('로그아웃 중 오류가 발생했습니다.');
      }
    }
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const getMenuClass = (path) => {
    return isActive(path)
      ? 'text-[#1D2EE5] font-bold no-underline text-lg md:border-b-[3px] border-[#1D2EE5] md:pb-1 block py-2 md:py-0'
      : 'text-black font-bold no-underline text-lg hover:text-[#1D2EE5] transition-colors md:pb-1 md:border-b-[3px] border-transparent block py-2 md:py-0';
  };

  return (
    <header className="sticky top-0 left-0 w-full bg-white shadow-xs z-50">
      <div className="h-20 flex items-center justify-between px-6 md:px-12 box-border">
        <Link
          to="/"
          className="text-[#1D2EE5] text-3xl font-black no-underline whitespace-nowrap"
        >
          쉼표,
        </Link>

        <nav className="hidden lg:flex flex-1 justify-center">
          <ul className="flex list-none p-0 m-0 gap-8 xl:gap-16">
            <li><Link to="/" className={getMenuClass('/')}>홈</Link></li>
            <li><Link to="/consolation" className={getMenuClass('/consolation')}>맞춤 위로</Link></li>
            <li><Link to="/secret_forest" className={getMenuClass('/secret_forest')}>익명 대나무숲</Link></li>
            <li><Link to="/secret_note" className={getMenuClass('/secret_note')}>비밀 일기장</Link></li>
            <li><Link to="/mypage" className={getMenuClass('/mypage')}>마이페이지</Link></li>
          </ul>
        </nav>

        <div className="hidden lg:flex items-center gap-4 xl:gap-6">
          <Link to="/alarm">
            <button className="relative bg-[#F1B5B5] text-[#E71616] px-5 xl:px-6 py-2.5 rounded-md border-none font-bold text-base cursor-pointer whitespace-nowrap hover:bg-opacity-80 transition-all">
              알림 소식
              {hasUnreadAlarm && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white" />
              )}
            </button>
          </Link>

          {currentUser ? (
            <div className="flex items-center gap-3 xl:gap-4">
              <span className="font-bold text-gray-700 text-lg whitespace-nowrap">
                <span className="text-[#1D2EE5]">
                  {currentUser.displayName || '쉼표'}
                </span>
                님
              </span>
              <button
                onClick={handleLogout}
                className="bg-gray-100 text-gray-600 px-4 xl:px-5 py-2 rounded-md border border-gray-300 font-bold text-sm cursor-pointer whitespace-nowrap hover:bg-gray-200 transition-all"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="bg-[#9299E5] text-white px-5 xl:px-6 py-2.5 rounded-md border-none font-bold text-base cursor-pointer whitespace-nowrap hover:bg-opacity-90 transition-all"
            >
              로그인
            </button>
          )}
        </div>

        <button
          className="lg:hidden text-[#1D2EE5] p-2 focus:outline-none"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-md absolute w-full left-0 top-20">
          <nav className="flex flex-col px-6 py-4">
            <ul className="flex flex-col list-none p-0 m-0 gap-2 mb-6">
              <li><Link to="/" className={getMenuClass('/')}>홈</Link></li>
              <li><Link to="/consolation" className={getMenuClass('/consolation')}>맞춤 위로</Link></li>
              <li><Link to="/secret_forest" className={getMenuClass('/secret_forest')}>익명 대나무숲</Link></li>
              <li><Link to="/secret_note" className={getMenuClass('/secret_note')}>비밀 일기장</Link></li>
              <li><Link to="/mypage" className={getMenuClass('/mypage')}>마이페이지</Link></li>
            </ul>

            <div className="flex flex-col gap-3 pt-4 border-t border-gray-100">
              {currentUser ? (
                <div className="flex flex-col gap-3">
                  <span className="font-bold text-gray-700 text-lg">
                    <span className="text-[#1D2EE5]">
                      {currentUser.displayName || '쉼표'}
                    </span>
                    님 환영합니다
                  </span>

                  <div className="flex gap-2">
                    <Link to="/alarm" className="flex-1">
                      <button className="relative w-full bg-[#F1B5B5] text-[#E71616] px-4 py-3 rounded-md font-bold text-base hover:bg-opacity-80 transition-all">
                        알림 소식
                        {hasUnreadAlarm && (
                          <span className="absolute top-2 right-2 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white" />
                        )}
                      </button>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="flex-1 w-full bg-gray-100 text-gray-600 px-4 py-3 rounded-md border border-gray-300 font-bold text-base hover:bg-gray-200 transition-all"
                    >
                      로그아웃
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link to="/alarm" className="flex-1">
                    <button className="w-full bg-[#F1B5B5] text-[#E71616] px-4 py-3 rounded-md font-bold text-base hover:bg-opacity-80 transition-all">
                      알림 소식
                    </button>
                  </Link>

                  <button
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