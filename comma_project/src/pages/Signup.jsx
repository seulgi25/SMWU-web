/**
 * Signup.jsx
 *
 * 쉼표 웹서비스의 회원가입 페이지임.
 * 사용자는 이메일, 아이디, 비밀번호, 익명 닉네임을 입력하여 가입할 수 있음.
 *
 * - Firebase Auth: 이메일/비밀번호 기반 회원가입 및 이메일 인증 메일 발송함.
 * - Firestore: 사용자 기본 정보 저장함.
 * - 닉네임 중복 확인: users 컬렉션에서 동일 닉네임 존재 여부 확인함.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import { auth, db } from '../firebase';

// 아이디 입력값이 영문과 숫자로만 구성되어 있는지 확인하기 위한 정규식 생성.
const USERNAME_REGEX = /^[A-Za-z0-9]+$/;

// Firebase 회원가입 오류 코드별 사용자 안내 메시지 생성.
const SIGNUP_ERROR_MESSAGES = {
  'auth/email-already-in-use': '이미 가입된 이메일입니다.',
  'auth/invalid-email': '올바른 이메일 형식이 아닙니다.',
  'auth/weak-password': '비밀번호는 6자리 이상이어야 합니다.',
};

// Firebase 오류 코드에 맞는 회원가입 오류 메시지를 반환함.
const getSignupErrorMessage = (errorCode) => {
  return SIGNUP_ERROR_MESSAGES[errorCode] || '회원가입 중 오류가 발생했습니다.';
};

// 닉네임 중복 비교를 위해 공백과 대소문자를 정리한 값으로 변환함.
const normalizeNickname = (value) => {
  return String(value ?? '').trim().replace(/\s+/g, ' ').toLowerCase();
};

// Firestore users 컬렉션에서 입력한 닉네임이 사용 가능한지 확인함.
const checkNicknameAvailable = async (nickname) => {
  const trimmedNickname = nickname.trim();
  const nicknameKey = normalizeNickname(trimmedNickname);
  const usersRef = collection(db, 'users');

  // 기존 문서에 nicknameKey가 없는 경우도 고려하기 위해 nickname과 nicknameKey를 모두 조회함.
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

// 회원가입 페이지 컴포넌트 생성.
const Signup = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [nicknameMessage, setNicknameMessage] = useState('');
  const [isNicknameChecked, setIsNicknameChecked] = useState(false);
  const [isCheckingNickname, setIsCheckingNickname] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 닉네임 입력값이 변경되면 기존 중복 확인 상태를 초기화함.
  const handleNicknameChange = (event) => {
    setNickname(event.target.value);
    setIsNicknameChecked(false);
    setNicknameMessage('');
  };

  // 사용자가 입력한 닉네임이 이미 사용 중인지 Firestore users 컬렉션에서 확인함.
  const handleNicknameCheck = async () => {
    const trimmedNickname = nickname.trim();

    if (!trimmedNickname) {
      alert('닉네임을 먼저 입력해주세요.');
      return;
    }

    try {
      setIsCheckingNickname(true);
      setErrorMsg('');

      const isAvailable = await checkNicknameAvailable(trimmedNickname);

      if (isAvailable) {
        setNickname(trimmedNickname);
        setIsNicknameChecked(true);
        setNicknameMessage('사용 가능한 닉네임입니다.');
      } else {
        setIsNicknameChecked(false);
        setNicknameMessage('이미 사용 중인 닉네임입니다.');
      }
    } catch (error) {
      console.error('닉네임 중복 확인 실패:', error);
      alert('중복 확인 중 오류가 발생했습니다.');
    } finally {
      setIsCheckingNickname(false);
    }
  };

  // Firebase 이메일 인증 메일은 계정 생성 후 발송되므로 가입 절차를 안내함.
  const handleEmailVerifyGuide = () => {
    if (!email.trim()) {
      alert('이메일을 먼저 입력해주세요.');
      return;
    }

    alert("아래 '가입하기' 버튼을 누르면 입력한 이메일로 인증 메일이 발송됩니다.");
  };

  // 회원가입 입력값을 검증하고 Firebase Auth와 Firestore에 사용자 정보를 저장함.
  const handleSignup = async (event) => {
    event.preventDefault();

    if (isSubmitting) return;

    const trimmedEmail = email.trim();
    const trimmedUsername = username.trim();
    const trimmedNickname = nickname.trim();

    setErrorMsg('');

    // 필수 입력값이 모두 입력되었는지 확인함.
    if (!trimmedEmail || !trimmedUsername || !password || !trimmedNickname) {
      setErrorMsg('모든 항목을 입력해 주세요.');
      return;
    }

    // 아이디가 영문과 숫자로만 구성되어 있는지 확인함.
    if (!USERNAME_REGEX.test(trimmedUsername)) {
      setErrorMsg('아이디는 영문과 숫자만 사용할 수 있습니다.');
      return;
    }

    // 닉네임 중복 확인을 완료했는지 확인함.
    if (!isNicknameChecked) {
      setErrorMsg('닉네임 중복 확인을 완료해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);

      // 중복 확인 이후 다른 사용자가 같은 닉네임을 등록했을 가능성을 한 번 더 확인함.
      const isAvailable = await checkNicknameAvailable(trimmedNickname);

      if (!isAvailable) {
        setIsNicknameChecked(false);
        setNicknameMessage('이미 사용 중인 닉네임입니다.');
        setErrorMsg('이미 사용 중인 닉네임입니다. 다른 닉네임을 입력해주세요.');
        return;
      }

      // Firebase Auth에 이메일과 비밀번호 기반 계정을 생성함.
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        trimmedEmail,
        password
      );

      // Firebase Auth 사용자 프로필에 익명 닉네임을 displayName으로 저장함.
      await updateProfile(userCredential.user, {
        displayName: trimmedNickname,
      });

      // Authentication에서 생성된 uid를 Firestore users 문서 ID로 사용함.
      // 이렇게 해야 Auth 계정과 Firestore 사용자 정보가 1:1로 연결됨.
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: trimmedEmail,
        username: trimmedUsername,
        nickname: trimmedNickname,
        nicknameKey: normalizeNickname(trimmedNickname),
        createdAt: serverTimestamp(),
      });

      // 가입한 이메일 주소로 Firebase 이메일 인증 메일을 발송함.
      await sendEmailVerification(userCredential.user);

      alert(
        '회원가입이 완료되었습니다! 가입하신 이메일의 메일함에서 인증 링크를 클릭한 후 로그인해주세요.'
      );
      navigate('/login');
    } catch (error) {
      console.error('회원가입 실패:', error);
      setErrorMsg(getSignupErrorMessage(error.code));
    } finally {
      setIsSubmitting(false);
    }
  };

  // 회원가입 페이지 전체 UI를 렌더링함.
  return (
    <main className="w-full max-w-6xl mx-auto px-4 pt-8 pb-10 sm:px-6 sm:pt-12 sm:pb-14">
      <section className="text-left mb-8 sm:mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#1D2EE5] leading-tight mb-2">
          회원가입
        </h1>
        <p className="text-sm sm:text-lg text-gray-500">
          마음에 편안한 쉼표를 찍어보세요.
        </p>
      </section>

      <section className="flex justify-center w-full">
        <div className="w-full max-w-md sm:max-w-lg bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-7">
          <form onSubmit={handleSignup} className="space-y-4 sm:space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-bold text-gray-900 mb-2"
              >
                이메일 인증
              </label>
              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  placeholder="이메일 입력"
                  autoComplete="email"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm sm:text-base focus:outline-none focus:border-[#3D46AA] focus:ring-1 focus:ring-[#3D46AA]"
                />
                <button
                  type="button"
                  onClick={handleEmailVerifyGuide}
                  className="w-full sm:w-auto sm:min-w-27.5 bg-gray-100 text-black font-bold px-4 py-3 text-sm sm:text-base rounded-lg hover:bg-gray-200 focus:outline-none whitespace-nowrap transition-colors"
                >
                  인증안내
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="username"
                className="block text-sm font-bold text-gray-900 mb-2"
              >
                사용할 아이디
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
                placeholder="영문, 숫자 조합"
                autoComplete="username"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm sm:text-base focus:outline-none focus:border-[#3D46AA] focus:ring-1 focus:ring-[#3D46AA]"
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
                placeholder="안전한 비밀번호를 입력해주세요"
                autoComplete="new-password"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm sm:text-base focus:outline-none focus:border-[#3D46AA] focus:ring-1 focus:ring-[#3D46AA]"
              />
            </div>

            <div>
              <label
                htmlFor="nickname"
                className="block text-sm font-bold text-gray-900 mb-2"
              >
                익명 닉네임
              </label>
              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
                <input
                  type="text"
                  id="nickname"
                  value={nickname}
                  onChange={handleNicknameChange}
                  required
                  placeholder="ex. 눈송이"
                  autoComplete="off"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm sm:text-base focus:outline-none focus:border-[#3D46AA] focus:ring-1 focus:ring-[#3D46AA]"
                />
                <button
                  type="button"
                  onClick={handleNicknameCheck}
                  disabled={isCheckingNickname}
                  className={`w-full sm:w-auto sm:min-w-27.5 px-4 py-3 text-sm sm:text-base rounded-lg font-bold whitespace-nowrap transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                    isNicknameChecked
                      ? 'bg-[#1D2EE5] text-white'
                      : 'bg-gray-100 text-black hover:bg-gray-200'
                  }`}
                >
                  {isCheckingNickname
                    ? '확인 중'
                    : isNicknameChecked
                      ? '확인완료'
                      : '중복확인'}
                </button>
              </div>

              {nicknameMessage && (
                <p
                  className={`mt-2 text-sm font-medium ${
                    isNicknameChecked ? 'text-[#1D2EE5]' : 'text-red-500'
                  }`}
                >
                  {nicknameMessage}
                </p>
              )}
            </div>

            {errorMsg && (
              <p className="text-red-500 text-sm font-medium text-center pt-1">
                {errorMsg}
              </p>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center rounded-lg bg-[#3D46AA] text-white font-bold text-base sm:text-lg py-3.5 sm:py-4 hover:bg-[#3D46AA]/90 focus:outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '가입 중...' : '가입하기'}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
};

export default Signup;