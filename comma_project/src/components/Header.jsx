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
import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation(); // 🌟 현재 브라우저의 주소를 가져옵니다.

    // 🌟 현재 주소(pathname)와 메뉴의 경로(path)가 일치하는지 확인하는 함수
    const isActive = (path) => {
        if (path === '/') {
            return location.pathname === '/'; // 메인 홈 화면은 완벽히 일치할 때만
        }
        return location.pathname.startsWith(path); // 상세 페이지(/secret_forest/1 등)에 들어가도 밑줄이 유지되도록 처리
    };

    // 🌟 활성화 여부에 따라 CSS 클래스를 다르게 뱉어내는 함수
    const getMenuClass = (path) => {
        return isActive(path)
            ? "text-[#1D2EE5] font-bold no-underline text-lg border-b-[3px] border-[#1D2EE5] pb-1" // 활성화 됨 (파란색 글씨 + 파란색 밑줄)
            : "text-black font-bold no-underline text-lg hover:text-[#1D2EE5] transition-colors pb-1 border-b-[3px] border-transparent"; // 비활성화 (검정 글씨 + 투명 밑줄)
    };

    return (
        <header className="sticky top-0 left-0 w-full h-20 bg-white flex items-center justify-between px-12 box-border shadow-xs z-50">
            
            {/* 1. 왼쪽 끝: 웹페이지 이름 */}
            <Link 
                to="/" 
                className="text-[#1D2EE5] text-3xl font-black no-underline whitespace-nowrap"
            >
                쉼표,
            </Link>
            
            {/* 2. 중앙: 메뉴 목록 */}
            <nav className="flex-1 flex justify-center">
                <ul className="flex list-none p-0 m-0 gap-16">
                    {/* 🌟 각 링크에 getMenuClass 함수를 적용하여 동적으로 스타일 변경 */}
                    <li><Link to="/" className={getMenuClass("/")}>홈</Link></li>
                    <li><Link to="/consolation" className={getMenuClass("/consolation")}>맞춤 위로</Link></li>
                    <li><Link to="/secret_forest" className={getMenuClass("/secret_forest")}>익명 대나무숲</Link></li>
                    <li><Link to="/secret_note" className={getMenuClass("/secret_note")}>비밀 일기장</Link></li>
                    <li><Link to="/mypage" className={getMenuClass("/mypage")}>마이페이지</Link></li>
                </ul>
            </nav>

            {/* 3. 오른쪽 끝: 버튼 그룹 */}
            <div className="flex gap-6">
                {/* 알림 소식 버튼: 배경 #F1B5B5, 글씨 #E71616 */}
                <Link to="/alarm">
                    <button className="bg-[#F1B5B5] text-[#E71616] px-6 py-2.5 rounded-md border-none font-bold text-base cursor-pointer whitespace-nowrap hover:bg-opacity-80 transition-all">
                        알림 소식
                    </button>
                </Link>

                {/* 로그인 버튼: 배경 #9299E5, 글씨 #FFFFFF */}
                <button 
                    onClick={() => navigate("/login")}
                    className="bg-[#9299E5] text-white px-6 py-2.5 rounded-md border-none font-bold text-base cursor-pointer whitespace-nowrap hover:bg-opacity-90 transition-all"
                >
                    로그인
                </button>
            </div>
            
        </header>
    );
};

export default Header;