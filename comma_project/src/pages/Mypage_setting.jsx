/**
 * MypageSetting.jsx
 *
 * 쉼표 웹서비스의 계정 및 보안 설정 페이지입니다.
 * 사용자는 프로필 이미지, 활동 닉네임, 비밀번호를 변경할 수 있습니다.
 *
 * - Firebase Auth: 닉네임, 프로필 이미지, 비밀번호 변경
 * - Firestore: users 컬렉션의 사용자 정보 동기화
 * - 비밀번호 변경: 현재 비밀번호로 재인증 후 변경
 */

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  updatePassword,
  updateProfile,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { auth, db } from '../firebase';

const MAX_PROFILE_IMAGE_SIZE = 500 * 1024;

const checkNicknameAvailable = async (nickname, currentUserId) => {
  const usersRef = collection(db, 'users');
  const nicknameQuery = query(usersRef, where('nickname', '==', nickname));
  const querySnapshot = await getDocs(nicknameQuery);

  return querySnapshot.docs.every((userDoc) => userDoc.id === currentUserId);
};

const MypageSetting = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [newNickname, setNewNickname] = useState('');
  const [profileImage, setProfileImage] = useState(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [isSaving, setIsSaving] = useState(false);

  // 로그인 상태를 확인하고, 기존 프로필 정보를 입력 폼에 반영한다.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        alert('로그인이 필요합니다.');
        navigate('/login', { replace: true });
        return;
      }

      setUser(currentUser);
      setNewNickname(currentUser.displayName || '');
      setProfileImage(currentUser.photoURL || null);
    });

    return unsubscribe;
  }, [navigate]);

  // 선택한 이미지 파일을 Base64 미리보기 데이터로 변환한다.
  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (file.size > MAX_PROFILE_IMAGE_SIZE) {
      alert('이미지 용량이 너무 큽니다. 500KB 이하의 이미지를 선택해주세요.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setProfileImage(reader.result);
    };

    reader.onerror = () => {
      alert('이미지를 불러오는 중 오류가 발생했습니다.');
    };

    reader.readAsDataURL(file);
  };

  const resetPasswordInputs = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
  };

  // 비밀번호 변경 시 현재 비밀번호로 재인증한 뒤 새 비밀번호를 저장한다.
  const reauthenticateAndUpdatePassword = async () => {
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (!user || isSaving) return;

    const trimmedNickname = newNickname.trim();
    const isPasswordChangeRequested =
      currentPassword.trim() || newPassword.trim() || confirmPassword.trim();

    setPasswordError('');

    if (!trimmedNickname) {
      alert('닉네임을 입력해 주세요.');
      return;
    }

    if (isPasswordChangeRequested) {
      if (!currentPassword.trim()) {
        setPasswordError('현재 비밀번호를 입력해 주세요.');
        return;
      }

      if (!newPassword.trim() || !confirmPassword.trim()) {
        setPasswordError('새 비밀번호와 확인 비밀번호를 모두 입력해 주세요.');
        return;
      }

      if (newPassword !== confirmPassword) {
        setPasswordError('비밀번호가 일치하지 않습니다.');
        return;
      }

      if (newPassword.length < 6) {
        setPasswordError('비밀번호는 최소 6자리 이상이어야 합니다.');
        return;
      }
    }

    try {
      setIsSaving(true);

      const profileUpdates = {};
      const firestoreUpdates = { updatedAt: serverTimestamp() };

      if (trimmedNickname !== user.displayName) {
        const isNicknameAvailable = await checkNicknameAvailable(trimmedNickname, user.uid);

        if (!isNicknameAvailable) {
          alert('이미 사용 중인 닉네임입니다. 다른 닉네임을 입력해주세요.');
          return;
        }

        profileUpdates.displayName = trimmedNickname;
        firestoreUpdates.nickname = trimmedNickname;
      }

      if (profileImage !== user.photoURL) {
        profileUpdates.photoURL = profileImage;
        firestoreUpdates.profileImage = profileImage;
      }

      if (isPasswordChangeRequested) {
        await reauthenticateAndUpdatePassword();
      }

      if (Object.keys(profileUpdates).length > 0) {
        await updateProfile(user, profileUpdates);
      }

      if (Object.keys(firestoreUpdates).length > 1) {
        await updateDoc(doc(db, 'users', user.uid), firestoreUpdates);
      }

      if (!isPasswordChangeRequested && Object.keys(profileUpdates).length === 0) {
        alert('변경된 내용이 없습니다.');
        return;
      }

      alert('계정 정보가 성공적으로 변경되었습니다.');
      resetPasswordInputs();
      navigate('/mypage');
    } catch (error) {
      console.error('계정 업데이트 실패:', error);

      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        alert('현재 비밀번호가 틀립니다. 다시 입력해주세요.');
      } else if (error.code === 'auth/requires-recent-login') {
        alert('보안을 위해 다시 로그인한 후 비밀번호를 변경해 주세요.');
        navigate('/login', { replace: true });
      } else {
        alert('정보 변경 중 오류가 발생했습니다.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="w-full max-w-3xl mx-auto pt-10 md:pt-16 pb-20 px-4">
      <button
        type="button"
        onClick={() => navigate('/mypage')}
        className="flex items-center gap-2 text-gray-500 hover:text-black font-bold mb-8 transition-colors"
      >
        &larr; 마이페이지로 돌아가기
      </button>

      <section className="text-left mb-10 px-2">
        <h1 className="text-3xl md:text-4xl font-bold text-[#1D2EE5] mb-2">
          계정 및 보안 설정
        </h1>
        <p className="text-gray-500 text-base md:text-lg">
          비밀번호 변경 및 활동 닉네임 변경
        </p>
      </section>

      <form
        onSubmit={handleSave}
        className="bg-white rounded-2xl p-6 md:p-10 shadow-sm border border-gray-200 flex flex-col gap-8"
      >
        <section className="flex flex-col items-center gap-4 border-b border-gray-100 pb-8">
          <p className="w-full text-black font-bold text-base md:text-lg">
            이미지 설정
          </p>

          <div className="w-28 h-28 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold text-3xl overflow-hidden border border-gray-300">
            {profileImage ? (
              <img src={profileImage} alt="프로필" className="w-full h-full object-cover" />
            ) : (
              <span>{newNickname ? newNickname.charAt(0) : 'img'}</span>
            )}
          </div>

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageChange}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors"
          >
            프로필 이미지 변경
          </button>
        </section>

        <section className="flex flex-col gap-3">
          <label htmlFor="nickname" className="text-black font-bold text-base md:text-lg">
            닉네임 변경 설정
          </label>
          <input
            type="text"
            id="nickname"
            value={newNickname}
            onChange={(event) => setNewNickname(event.target.value)}
            placeholder="변경할 닉네임을 입력해주세요."
            className="w-full bg-gray-50 border border-gray-300 rounded-lg px-5 py-4 text-base focus:outline-none focus:ring-1 focus:ring-[#3D46AA]"
          />
        </section>

        <section className="flex flex-col gap-3">
          <label htmlFor="current-password" className="text-black font-bold text-base md:text-lg">
            현재 비밀번호 입력
          </label>
          <input
            type="password"
            id="current-password"
            value={currentPassword}
            onChange={(event) => {
              setCurrentPassword(event.target.value);
              if (!event.target.value) setPasswordError('');
            }}
            placeholder="현재 비밀번호를 입력해주세요."
            autoComplete="current-password"
            className="w-full bg-gray-50 border border-gray-300 rounded-lg px-5 py-4 text-base focus:outline-none focus:ring-1 focus:ring-[#3D46AA]"
          />
        </section>

        <section className="flex flex-col gap-3">
          <label htmlFor="new-password" className="text-black font-bold text-base md:text-lg">
            보안 비밀번호 변경
          </label>
          <input
            type="password"
            id="new-password"
            value={newPassword}
            onChange={(event) => {
              setNewPassword(event.target.value);
              if (!event.target.value) setPasswordError('');
            }}
            placeholder="새로운 비밀번호를 입력해주세요."
            autoComplete="new-password"
            className="w-full bg-gray-50 border border-gray-300 rounded-lg px-5 py-4 text-base focus:outline-none focus:ring-1 focus:ring-[#3D46AA]"
          />
        </section>

        <section className="flex flex-col gap-1">
          <label htmlFor="confirm-password" className="text-black font-bold text-base md:text-lg mb-2">
            새 비밀번호 확인
          </label>
          <input
            type="password"
            id="confirm-password"
            value={confirmPassword}
            onChange={(event) => {
              setConfirmPassword(event.target.value);
              if (!event.target.value) setPasswordError('');
            }}
            placeholder="새로운 비밀번호를 한 번 더 입력해주세요."
            autoComplete="new-password"
            className={`w-full bg-gray-50 border rounded-lg px-5 py-4 text-base focus:outline-none focus:ring-1 ${
              passwordError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#3D46AA]'
            }`}
          />
          {passwordError && (
            <p className="text-red-500 text-sm font-bold mt-1 ml-1">
              {passwordError}
            </p>
          )}
        </section>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full bg-[#3D46AA] text-white px-6 py-4 rounded-xl font-bold text-lg hover:bg-[#3D46AA]/90 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSaving ? '저장 중...' : '변경 내용 저장하기'}
        </button>
      </form>
    </main>
  );
};

export default MypageSetting;