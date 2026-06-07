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
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from 'firebase/auth';
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
} from 'firebase/firestore';

const Signup = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [username, setUsername] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isNicknameChecked, setIsNicknameChecked] = useState(false);

  const handleNicknameCheck = async () => {
    if (!nickname.trim()) {
      alert('닉네임을 먼저 입력해주세요.');
      return;
    }

    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('nickname', '==', nickname.trim()));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        alert('이미 사용 중인 닉네임입니다. 다른 닉네임을 입력해주세요.');
        setIsNicknameChecked(false);
      } else {
        alert('사용 가능한 닉네임입니다!');
        setIsNicknameChecked(true);
      }
    } catch (error) {
      console.error('중복 확인 에러:', error);
      alert('중복 확인 중 오류가 발생했습니다.');
    }
  };

  const handleNicknameChange = (e) => {
    setNickname(e.target.value);
    setIsNicknameChecked(false);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!isNicknameChecked) {
      alert('닉네임 중복 확인을 완료해주세요.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await updateProfile(userCredential.user, {
        displayName: nickname,
      });

      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email,
        username,
        nickname,
        createdAt: new Date(),
      });

      await sendEmailVerification(userCredential.user);

      alert(
        '회원가입이 완료되었습니다! 가입하신 이메일의 메일함에서 [인증 링크]를 클릭한 후 로그인해주세요.'
      );
      navigate('/login');
    } catch (error) {
      console.error('회원가입 실패:', error);
      if (error.code === 'auth/email-already-in-use') {
        setErrorMsg('이미 가입된 이메일입니다.');
      } else if (error.code === 'auth/weak-password') {
        setErrorMsg('비밀번호는 6자리 이상이어야 합니다.');
      } else {
        setErrorMsg('회원가입 중 오류가 발생했습니다.');
      }
    }
  };

  const handleEmailVerify = () => {
    alert("아래 '가입하기' 버튼을 누르시면 인증 메일이 자동으로 발송됩니다!");
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 pt-8 pb-10 sm:px-6 sm:pt-12 sm:pb-14">
      <div className="text-left mb-8 sm:mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#1D2EE5] leading-tight mb-2">
          회원가입
        </h1>
        <p className="text-sm sm:text-lg text-gray-500">
          마음에 편안한 쉼표를 찍어보세요.
        </p>
      </div>

      <div className="flex justify-center w-full">
        <div className="w-full max-w-md sm:max-w-lg bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-7">
          <form onSubmit={handleSignup} className="space-y-4 sm:space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                이메일 인증
              </label>
              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="이메일 입력"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm sm:text-base focus:outline-none focus:border-[#3D46AA] focus:ring-1 focus:ring-[#3D46AA]"
                />
                <button
                  type="button"
                  onClick={handleEmailVerify}
                  className="w-full sm:w-auto sm:min-w-[110px] bg-gray-100 text-black font-bold px-4 py-3 text-sm sm:text-base rounded-lg hover:bg-gray-200 focus:outline-none whitespace-nowrap transition-colors"
                >
                  인증안내
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                사용할 아이디
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="영문, 숫자 조합"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm sm:text-base focus:outline-none focus:border-[#3D46AA] focus:ring-1 focus:ring-[#3D46AA]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                비밀번호
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="안전한 비밀번호를 입력해주세요"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm sm:text-base focus:outline-none focus:border-[#3D46AA] focus:ring-1 focus:ring-[#3D46AA]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
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
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm sm:text-base focus:outline-none focus:border-[#3D46AA] focus:ring-1 focus:ring-[#3D46AA]"
                />
                <button
                  type="button"
                  onClick={handleNicknameCheck}
                  className={`w-full sm:w-auto sm:min-w-[110px] px-4 py-3 text-sm sm:text-base rounded-lg font-bold whitespace-nowrap transition-all ${
                    isNicknameChecked
                      ? 'bg-[#1D2EE5] text-white'
                      : 'bg-gray-100 text-black hover:bg-gray-200'
                  }`}
                >
                  {isNicknameChecked ? '확인완료' : '중복확인'}
                </button>
              </div>
            </div>

            {errorMsg && (
              <p className="text-red-500 text-sm font-medium text-center pt-1">
                {errorMsg}
              </p>
            )}

            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex justify-center items-center rounded-lg bg-[#3D46AA] text-white font-bold text-base sm:text-lg py-3.5 sm:py-4 hover:bg-opacity-90 focus:outline-none transition-all"
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
