//로그인을 할 수 있는 홈페이지입니다.
//배경 색상은 '#F8F7EC'로 설정되어 있습니다.
//'로그인 // 다시 마음에 편안한 쉼표를 찍어보세요. '라는 문구가 Header.jsx 아래에 위치해 있습니다. 이 문구는 '로그인'은 크고 굵은 파란색으로, '다시 마음에 편안한 쉼표를 찍어보세요.'는 회색 글씨로('로그인' 단어보다 작게) 디자인되어 있습니다.
//화면 중앙에는 로그인 폼이 위치해 있습니다. 로그인 폼은 흰색 배경에 둥근 모서리를 가지고 있으며, 그림자 효과가 적용되어 있습니다.
//로그인 폼 안에는 '아이디'와 '비밀번호' 입력 필드가 있으며, 각각의 필드는 라벨과 함께 배치되어 있습니다.
//로그인 버튼은 '로그인하기'이라는 텍스트가 포함되어 있습니다.
//로그인 버튼 아래에는 '처음 오셨나요? 회원가입'라는 문구가 있으며, '회원가입'는 클릭할 수 있는 링크로 설정되어 있습니다.
//'회원가입'을 누르면 signup.jsx로 이동할 수 있도록 설정되어 있습니다.
//모든 디자인은 tailwindcss를 사용하여 구현됩니다.
import React from 'react';
import { Link } from 'react-router-dom';

const Login = () => {
  return (
    // Home.jsx와 동일한 전체 폭(max-w-7xl)을 설정하여 헤더와 왼쪽 여백을 맞추기.
    <div className="w-full max-w-7xl mx-auto pt-16 pb-12 px-4">
        
        {/* 상단 문구 영역: 전체 폭 안에서 왼쪽 정렬 유지 */}
        <div className="text-left mb-12">
            <h1 className="text-4xl font-bold text-[#1D2EE5] mb-2">로그인</h1>
            <p className="text-gray-500 text-lg">다시 마음에 편안한 쉼표를 찍어보세요.</p>
        </div>

        {/* 로그인 폼 영역: 이 부분만 화면 정중앙으로 배치 (flex justify-center) */}
        <div className="flex justify-center w-full">
            <div className="bg-white rounded-2xl p-10 shadow-sm w-full max-w-120">
                <form className="space-y-5">
                    
                    {/* 아이디 입력 */}
                    <div>
                        <input
                            type="text"
                            id="username"
                            placeholder="아이디"
                            className="w-full border border-gray-400 rounded-lg px-4 py-4 text-base focus:outline-none focus:border-[#3D46AA] focus:ring-1 focus:ring-[#3D46AA]"
                        />
                    </div>
                    
                    {/* 비밀번호 입력 */}
                    <div>
                        <input
                            type="password"
                            id="password"
                            placeholder="비밀번호"
                            className="w-full border border-gray-400 rounded-lg px-4 py-4 text-base focus:outline-none focus:border-[#3D46AA] focus:ring-1 focus:ring-[#3D46AA]"
                        />
                    </div>

                    {/* 로그인 버튼 */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            className="w-full flex justify-center py-4 px-4 rounded-lg shadow-sm text-lg font-bold text-white bg-[#3D46AA] hover:bg-opacity-90 focus:outline-none transition-all"
                        >
                            로그인하기
                        </button>
                    </div>
                </form>

                {/* 회원가입 링크 */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600 font-medium">
                        처음 오셨나요?{' '}
                        <Link to="/signup" className="font-bold text-[#1D2EE5] hover:underline">
                            회원가입
                        </Link>
                    </p>
                </div>
            </div>
        </div>
        
    </div>
  );
};

export default Login;