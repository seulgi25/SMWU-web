/**
 * Login.jsx
 *
 * 쉼표 웹서비스의 로그인 페이지입니다.
 * 이메일/비밀번호 로그인과 Google 로그인을 지원합니다.
 *
 * - Firebase Auth: 이메일 로그인, Google 로그인
 * - Firestore: Google 로그인 사용자의 기본 정보 자동 저장
 * - 이메일 인증 확인: 인증되지 않은 이메일 계정은 로그인 제한
 * - React Router: 로그인 성공 시 홈으로 이동
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';

// Firebase Auth 오류 코드별 사용자 안내 메시지
const LOGIN_ERROR_MESSAGES = {
  'auth/invalid-email': '올바른 이메일 형식이 아닙니다.',
  'auth/user-not-found': '가입되지 않은 이메일입니다.',
  'auth/wrong-password': '비밀번호가 일치하지 않습니다.',
  'auth/invalid-credential': '아이디(이메일) 또는 비밀번호가 일치하지 않습니다.',
};

// Firebase 오류 코드를 화면에 보여줄 문장으로 변환
const getLoginErrorMessage = (errorCode) => {
  return LOGIN_ERROR_MESSAGES[errorCode] || '로그인 중 문제가 발생했습니다.';
};

// 닉네임 비교용 값입니다.
// 앞뒤 공백을 제거하고, 중간의 여러 공백을 하나로 줄인 뒤 소문자로 통일합니다.
const normalizeNickname = (value) => {
  return String(value ?? '').trim().replace(/\s+/g, ' ').toLowerCase();
};

// Google 로그인 사용자의 username 기본값 생성
const getEmailUsername = (email, uid) => {
  if (email?.includes('@')) {
    return email.split('@')[0];
  }

  return `user_${uid.slice(0, 6)}`;
};

// Firestore users 컬렉션에서 닉네임 중복 여부 확인
const checkNicknameAvailable = async (nickname) => {
  const trimmedNickname = nickname.trim();
  const nicknameKey = normalizeNickname(trimmedNickname);
  const usersRef = collection(db, 'users');

  const nicknameQuery = query(
    usersRef,
    where('nickname', '==', trimmedNickname)
  );

  const nicknameKeyQuery = query(
    usersRef,
    where('nicknameKey', '==', nicknameKey)
  );

  const [nicknameSnapshot, nicknameKeySnapshot] = await Promise.all([
    getDocs(nicknameQuery),
    getDocs(nicknameKeyQuery),
  ]);

  return nicknameSnapshot.empty && nicknameKeySnapshot.empty;
};

// Google 로그인 사용자를 위한 사용 가능한 기본 닉네임 생성
const createAvailableNickname = async (baseNickname, uid) => {
  const safeBaseNickname = String(baseNickname ?? '').trim() || '쉼표사용자';
  const nicknameCandidates = [
    safeBaseNickname,
    `${safeBaseNickname}_${uid.slice(0, 6)}`,
    `쉼표사용자_${uid.slice(0, 6)}`,
  ];

  for (const candidate of nicknameCandidates) {
    const isAvailable = await checkNicknameAvailable(candidate);

    if (isAvailable) {
      return candidate;
    }
  }

  return `쉼표사용자_${uid.slice(0, 8)}`;
};

// Google 로그인 또는 기존 Auth 계정에 대해 Firestore users 문서가 없으면 생성합니다.
// 문서 ID는 Firebase Authentication의 uid와 동일하게 맞춥니다.
const createUserDocumentIfNeeded = async (user) => {
  const userDocRef = doc(db, 'users', user.uid);
  const userDocSnap = await getDoc(userDocRef);

  if (userDocSnap.exists()) {
    return;
  }

  const email = user.email || '';
  const username = getEmailUsername(email, user.uid);
  const baseNickname = `쉼표사용자_${user.uid.slice(0, 6)}`;
  const nickname = await createAvailableNickname(baseNickname, user.uid);

  await setDoc(userDocRef, {
    email,
    username,
    nickname,
    nicknameKey: normalizeNickname(nickname),
    profileImage: user.photoURL || null,
    createdAt: serverTimestamp(),
  });
};

const Login = () => {
  const navigate = useNavigate();

  // 이메일 로그인 입력값 및 오류 메시지 상태 관리
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // 이메일 로그인과 Google 로그인 로딩 상태 분리 관리
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // 이메일 인증이 완료된 사용자만 로그인할 수 있도록 확인합니다.
  const handleEmailLogin = async (event) => {
    event.preventDefault();

    if (isEmailLoading) return;

    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setErrorMsg('이메일과 비밀번호를 모두 입력해 주세요.');
      return;
    }

    try {
      setErrorMsg('');
      setIsEmailLoading(true);

      const userCredential = await signInWithEmailAndPassword(
        auth,
        trimmedEmail,
        password
      );

      if (!userCredential.user.emailVerified) {
        await signOut(auth);
        setErrorMsg('이메일 인증이 완료되지 않았습니다. 메일함의 인증 링크를 클릭해주세요!');
        return;
      }

      // 기존 Auth 계정에 users 문서가 없는 경우를 대비해 확인합니다.
      await createUserDocumentIfNeeded(userCredential.user);

      navigate('/');
    } catch (error) {
      console.error('로그인 실패:', error);
      setErrorMsg(getLoginErrorMessage(error.code));
    } finally {
      setIsEmailLoading(false);
    }
  };

  // Firebase Google Provider를 이용해 소셜 로그인을 처리합니다.
  const handleGoogleLogin = async () => {
    if (isGoogleLoading) return;

    try {
      setErrorMsg('');
      setIsGoogleLoading(true);

      const userCredential = await signInWithPopup(auth, googleProvider);

      // Google 로그인 사용자는 별도 회원가입 폼을 거치지 않으므로,
      // Firestore users 문서가 없으면 여기서 자동으로 생성합니다.
      await createUserDocumentIfNeeded(userCredential.user);

      navigate('/');
    } catch (error) {
      console.error('구글 로그인 실패:', error);
      setErrorMsg('구글 로그인 중 문제가 발생했습니다.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <main className="w-full max-w-5xl mx-auto pt-10 md:pt-16 pb-12 px-4 md:px-6">
      {/* 페이지 제목 영역 */}
      <section className="text-left mb-8 md:mb-12 pl-1 md:pl-2">
        <h1 className="text-3xl md:text-4xl font-bold text-[#1D2EE5] mb-1 md:mb-2">
          로그인
        </h1>
        <p className="text-gray-500 text-sm md:text-lg">
          다시 마음에 편안한 쉼표를 찍어보세요.
        </p>
      </section>

      <section className="flex justify-center w-full">
        <div className="bg-white rounded-2xl p-6 md:p-10 shadow-sm w-full max-w-md border border-gray-100">
          {/* 이메일/비밀번호 로그인 폼 */}
          <form onSubmit={handleEmailLogin} className="space-y-4 md:space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-bold text-gray-900 mb-2"
              >
                아이디
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                placeholder="아이디 (이메일)"
                autoComplete="email"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 md:py-3.5 text-sm md:text-base focus:outline-none focus:border-[#3D46AA] focus:ring-1 focus:ring-[#3D46AA]"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-bold text-gray-900 mb-2"
              >
                비밀번호
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                placeholder="비밀번호"
                autoComplete="current-password"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 md:py-3.5 text-sm md:text-base focus:outline-none focus:border-[#3D46AA] focus:ring-1 focus:ring-[#3D46AA]"
              />
            </div>

            {/* 로그인 오류 메시지 */}
            {errorMsg && (
              <p className="text-red-500 text-xs md:text-sm font-bold text-center mt-2">
                {errorMsg}
              </p>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isEmailLoading}
                className="w-full flex justify-center py-3 md:py-3.5 px-4 rounded-lg shadow-sm text-base font-bold text-white bg-[#3D46AA] hover:bg-[#3D46AA]/90 focus:outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isEmailLoading ? '로그인 중...' : '로그인하기'}
              </button>
            </div>
          </form>

          {/* Google 로그인 버튼 */}
          <div className="mt-4">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              className="w-full flex items-center justify-center gap-2 md:gap-3 py-3 md:py-3.5 px-4 border border-gray-300 rounded-lg shadow-sm text-sm md:text-base font-bold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <svg
                className="w-4 h-4 md:w-5 md:h-5"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              {isGoogleLoading ? '로그인 중...' : 'Google로 계속하기'}
            </button>
          </div>

          {/* 회원가입 페이지 이동 링크 */}
          <div className="mt-6 md:mt-8 text-center">
            <p className="text-xs md:text-sm text-gray-500 font-medium">
              처음 오셨나요?{' '}
              <Link
                to="/signup"
                className="font-bold text-[#1D2EE5] hover:underline ml-1"
              >
                회원가입
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Login;
