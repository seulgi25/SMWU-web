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
import {useNavigate} from 'react-router-dom';
const Header = () => {
    const navigate = useNavigate();
    return (
        // [수정] fixed 대신 sticky를 사용하여 본문 여백(pt-10)이 헤더 뒤로 파고들지 않도록 합니다.
        // h-20(80px), bg-white, flex, 항목 정렬 및 그림자(shadow-sm)를 Tailwind로 처리했습니다.
        <header className="sticky top-0 left-0 w-full h-20 bg-white flex items-center justify-between px-12 box-border shadow-xs z-50">
            
            {/* 1. 왼쪽 끝: 웹페이지 이름 */}
            {/* [수정] 색상 #1D2EE5는 text-[#1D2EE5]로 지정, 두꺼운 폰트(font-black) 적용 */}
            <a 
                href="/" 
                className="text-[#1D2EE5] text-3xl font-black no-underline whitespace-nowrap"
            >
                쉼표,
            </a>
            
            {/* 2. 중앙: 메뉴 목록 */}
            {/* [수정] flex-1과 justify-center로 양끝 요소 사이의 정중앙에 배치, 간격은 gap-16(4rem) 적용 */}
            <nav className="flex-1 flex justify-center">
                <ul className="flex list-none p-0 m-0 gap-16">
                    <li><a href="/home" className="text-black font-bold no-underline text-lg">홈</a></li>
                    <li><a href="/consolation" className="text-black font-bold no-underline text-lg">맞춤 위로</a></li>
                    <li><a href="/secret_forest" className="text-black font-bold no-underline text-lg">익명 대나무숲</a></li>
                    <li><a href="/secret_note" className="text-black font-bold no-underline text-lg">비밀 일기장</a></li>
                    <li><a href="/mypage" className="text-black font-bold no-underline text-lg">마이페이지</a></li>
                </ul>
            </nav>

            {/* 3. 오른쪽 끝: 버튼 그룹 */}
            <div className="flex gap-6">
                {/* 알림 소식 버튼: 배경 #F1B5B5, 글씨 #E71616 */}
                <button 
                    onClick={() => navigate("/alarm")}
                    className="bg-[#F1B5B5] text-[#E71616] px-6 py-2.5 rounded-md border-none font-bold text-base cursor-pointer whitespace-nowrap"
                >
                    알림 소식
                </button>

                {/* 로그인 버튼: 배경 #9299E5, 글씨 #FFFFFF */}
                <button 
                    onClick={() => navigate("/login")}
                    className="bg-[#9299E5] text-white px-6 py-2.5 rounded-md border-none font-bold text-base cursor-pointer whitespace-nowrap"
                >
                    로그인
                </button>
            </div>
            
        </header>
    );
};

export default Header;