//회원가입 페이지입니다.
//로그인 페이지와 유사하지만 이메일 인증, 사용할 아이디, 비밀번호, 익명닉네임을 작성할 수 있습니다.
//회원가입 버튼을 누르면 입력한 정보가 서버로 전송되고, 회원가입이 완료되면 로그인 페이지로 이동합니다.
//이메일 인증 옆에 있는 '인증하기' 버튼을 누르면 인증번호가 이메일로 전송되고, 인증번호 입력란이 나타나도록 구현할 수 있습니다.
//이메일 인증의 placeholder는 "이메일 입력"으로 설정합니다.
//사용할 아이디의 placeholder는 "영문, 숫자 조합"으로 설정합니다.
//비밀번호의 placeholder는 "안전한 비밀번호를 입력해주세요"으로 설정합니다.
//익명 닉네임의 placeholder는 "ex.눈송이"으로 설정합니다.
//익명 닉네임 옆에는 '중복 확인' 버튼이 있어야 합니다. 이 버튼을 누르면 입력한 닉네임이 이미 사용 중인지 서버로 확인 요청을 보내고, 결과에 따라 "사용 가능한 닉네임입니다" 또는 "이미 사용 중인 닉네임입니다"라는 메시지를 표시합니다.
//회원가입 페이지의 상단에는 "회원가입"이라는 제목과 "다시 마음에 편안한 쉼표를 찍어보세요."라는 설명 문구가 있어야 합니다.
//회원가입 폼은 화면 중앙에 배치되어야 하며, 입력 필드와 버튼은 충분한 여백과 함께 깔끔하게 정렬되어야 합니다.
//가입하기 버튼은 '#3D46AA'으로 디자인 합니다.
import React from 'react';

const Signup = () => {
  return (
    <div className="w-full max-w-7xl mx-auto pt-16 pb-12 px-4">
        
        {/* 상단 문구 영역: 왼쪽 정렬 그대로 유지 */}
        <div className="text-left mb-12">
            <h1 className="text-4xl font-bold text-[#1D2EE5] mb-2">회원가입</h1>
            <p className="text-gray-500 text-lg">마음에 편안한 쉼표를 찍어보세요.</p>
        </div>

        {/* 회원가입 폼 영역: 이 부분만 화면 정중앙으로 배치 (flex justify-center 적용) */}
        <div className="flex justify-center w-full">
            <div className="bg-white rounded-2xl p-8 shadow-sm w-full max-w-120">
                <form className="space-y-5">
                    
                    {/* 이메일 인증 */}
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">이메일 인증</label>
                        <div className="flex items-center gap-3">
                            <input
                                type="email"
                                id="email"
                                placeholder="이메일 입력"
                                className="flex-1 w-full border border-gray-400 rounded-lg px-4 py-3.5 text-base focus:outline-none focus:border-[#3D46AA] focus:ring-1 focus:ring-[#3D46AA]"
                            />
                            <button
                                type="button"
                                className="bg-gray-100 text-black font-bold px-5 py-3.5 rounded-lg hover:bg-gray-200 focus:outline-none whitespace-nowrap"
                            >
                                인증하기
                            </button>
                        </div>
                    </div>

                    {/* 사용할 아이디 */}
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">사용할 아이디</label>
                        <input
                            type="text"
                            id="username"
                            placeholder="영문, 숫자 조합"
                            className="w-full border border-gray-400 rounded-lg px-4 py-3.5 text-base focus:outline-none focus:border-[#3D46AA] focus:ring-1 focus:ring-[#3D46AA]"
                        />
                    </div>

                    {/* 비밀번호 */}
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">비밀번호</label>
                        <input
                            type="password"
                            id="password"
                            placeholder="안전한 비밀번호를 입력해주세요"
                            className="w-full border border-gray-400 rounded-lg px-4 py-3.5 text-base focus:outline-none focus:border-[#3D46AA] focus:ring-1 focus:ring-[#3D46AA]"
                        />
                    </div>

                    {/* 익명 닉네임 */}
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">익명 닉네임</label>
                        <div className="flex items-center gap-3">
                            <input
                                type="text"
                                id="nickname"
                                placeholder="ex.눈송이"
                                className="flex-1 w-full border border-gray-400 rounded-lg px-4 py-3.5 text-base focus:outline-none focus:border-[#3D46AA] focus:ring-1 focus:ring-[#3D46AA]"
                            />
                            <button
                                type="button"
                                className="bg-gray-100 text-black font-bold px-5 py-3.5 rounded-lg hover:bg-gray-200 focus:outline-none whitespace-nowrap"
                            >
                                중복확인
                            </button>
                        </div>
                    </div>

                    {/* 가입하기 버튼 */}
                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full flex justify-center py-4 px-4 rounded-lg shadow-sm text-lg font-bold text-white bg-[#3D46AA] hover:bg-opacity-90 focus:outline-none transition-all"
                        >
                            가입하기
                        </button>
                    </div>

                </form>
            </div>
        </div>
        
    </div>
  );
};

export default Signup;