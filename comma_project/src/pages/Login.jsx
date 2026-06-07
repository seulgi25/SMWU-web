//로그인을 할 수 있는 홈페이지입니다.
//배경 색상은 '#F8F7EC'로 설정되어 있습니다.
//'로그인 // 다시 마음에 편안한 쉼표를 찍어보세요. '라는 문구가 Header.jsx 아래에 위치해 있습니다. 이 문구는 '로그인'은 크고 굵은 파란색으로, '다시 마음에 편안한 쉼표를 찍어보세요.'는 회색 글씨로('로그인' 단어보다 작게) 디자인되어 있습니다.
//화면 중앙에는 로그인 폼이 위치해 있습니다. 로그인 폼은 흰색 배경에 둥근 모서리를 가지고 있으며, 그림자 효과가 적용되어 있습니다.
//로그인 폼 안에는 '아이디'와 '비밀번호' 입력 필드가 있으며, 각각의 필드는 라벨과 함께 배치되어 있습니다.
//로그인 버튼은 '로그인하기'이라는 텍스트가 포함되어 있습니다.
//로그인 버튼 아래에는 '처음 오셨나요? 회원가입'라는 문구가 있으며, '회원가입'는 클릭할 수 있는 링크로 설정되어 있습니다.
//'회원가입'을 누르면 signup.jsx로 이동할 수 있도록 설정되어 있습니다.
//모든 디자인은 tailwindcss를 사용하여 구현됩니다.
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, googleProvider } from '../firebase'; 
import { signInWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth';

const Login = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            
            if (!userCredential.user.emailVerified) {
                await signOut(auth);
                setErrorMsg("이메일 인증이 완료되지 않았습니다. 메일함의 인증 링크를 클릭해주세요!");
                return; 
            }

            navigate('/'); 
            
        } catch (error) {
            console.error("로그인 실패:", error);
            setErrorMsg("아이디(이메일) 또는 비밀번호가 일치하지 않거나, 가입되지 않은 정보입니다.");
        }
    };

    const handleGoogleLogin = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
            navigate('/'); 
        } catch (error) {
            console.error("구글 로그인 실패:", error);
            setErrorMsg("구글 로그인 중 문제가 발생했습니다.");
        }
    };

    return (
        // 🌟 여백 최적화
        <div className="w-full max-w-5xl mx-auto pt-10 md:pt-16 pb-12 px-4 md:px-6">
            
            <div className="text-left mb-8 md:mb-12 pl-1 md:pl-2">
                <h1 className="text-3xl md:text-4xl font-bold text-[#1D2EE5] mb-1 md:mb-2">로그인</h1>
                <p className="text-gray-500 text-sm md:text-lg">다시 마음에 편안한 쉼표를 찍어보세요.</p>
            </div>

            <div className="flex justify-center w-full">
                {/* 🌟 폼 박스 폭 제한 (max-w-md: 약 448px) 및 패딩 다이어트 */}
                <div className="bg-white rounded-2xl p-6 md:p-10 shadow-sm w-full max-w-md border border-gray-100">
                    <form onSubmit={handleEmailLogin} className="space-y-4 md:space-y-5">
                        
                        <div>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="아이디 (이메일)"
                                // 🌟 입력칸 패딩 및 글자 크기 다이어트
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 md:py-3.5 text-sm md:text-base focus:outline-none focus:border-[#3D46AA] focus:ring-1 focus:ring-[#3D46AA]"
                            />
                        </div>
                        
                        <div>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="비밀번호"
                                // 🌟 입력칸 패딩 및 글자 크기 다이어트
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 md:py-3.5 text-sm md:text-base focus:outline-none focus:border-[#3D46AA] focus:ring-1 focus:ring-[#3D46AA]"
                            />
                        </div>

                        {errorMsg && <p className="text-red-500 text-xs md:text-sm font-bold text-center mt-2">{errorMsg}</p>}

                        <div className="pt-2">
                            <button
                                type="submit"
                                // 🌟 버튼 패딩 및 글자 크기 다이어트
                                className="w-full flex justify-center py-3 md:py-3.5 px-4 rounded-lg shadow-sm text-base font-bold text-white bg-[#3D46AA] hover:bg-opacity-90 focus:outline-none transition-all"
                            >
                                로그인하기
                            </button>
                        </div>
                    </form>

                    <div className="mt-4">
                        <button 
                            onClick={handleGoogleLogin}
                            type="button"
                            // 🌟 구글 버튼 패딩 및 글자 크기 다이어트
                            className="w-full flex items-center justify-center gap-2 md:gap-3 py-3 md:py-3.5 px-4 border border-gray-300 rounded-lg shadow-sm text-sm md:text-base font-bold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-all"
                        >
                            <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                            Google로 계속하기
                        </button>
                    </div>

                    <div className="mt-6 md:mt-8 text-center">
                        <p className="text-xs md:text-sm text-gray-500 font-medium">
                            처음 오셨나요?{' '}
                            <Link to="/signup" className="font-bold text-[#1D2EE5] hover:underline ml-1">
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