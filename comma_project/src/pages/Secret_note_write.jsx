/**
 * SecretNoteWrite.jsx
 *
 * 나만의 비밀 일기를 작성하는 페이지입니다.
 * 사용자는 선택한 날짜에 자신의 마음 기록을 작성하고 Firestore에 저장할 수 있습니다.
 *
 * - Firebase Auth: 로그인 사용자 확인
 * - Firestore: secret_notes 컬렉션에 비밀 일기 저장
 * - URL query: /secret_note_write?date=YYYY-MM-DD 형태로 작성 날짜 지정
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { auth, db } from '../firebase';

const NOTE_COLLECTION = 'secret_notes';

const formatDateString = (year, month, day) => {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

const getTodayDateString = () => {
  const today = new Date();
  return formatDateString(today.getFullYear(), today.getMonth() + 1, today.getDate());
};

const isValidDateString = (dateString) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString || '')) return false;

  const [year, month, day] = dateString.split('-').map(Number);
  const parsedDate = new Date(year, month - 1, day);

  return (
    parsedDate.getFullYear() === year &&
    parsedDate.getMonth() === month - 1 &&
    parsedDate.getDate() === day
  );
};

const getValidDateParam = (dateParam) => {
  return isValidDateString(dateParam) ? dateParam : getTodayDateString();
};

const getDisplayDate = (dateString) => {
  const [, month, day] = dateString.split('-').map(Number);
  return `${month}월 ${day}일`;
};

const checkExistingNote = async (uid, date) => {
  const notesQuery = query(
    collection(db, NOTE_COLLECTION),
    where('uid', '==', uid),
    where('date', '==', date)
  );

  const querySnapshot = await getDocs(notesQuery);

  return !querySnapshot.empty;
};

const SecretNoteWrite = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const dateParam = useMemo(
    () => getValidDateParam(searchParams.get('date')),
    [searchParams]
  );

  const displayDate = useMemo(() => getDisplayDate(dateParam), [dateParam]);

  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [content, setContent] = useState('');

  // 로그인한 사용자만 비밀 일기를 작성할 수 있도록 확인한다.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthChecking(false);

      if (!user) {
        alert('로그인이 필요한 서비스입니다.');
        navigate('/login', { replace: true });
        return;
      }

      setCurrentUser(user);
    });

    return unsubscribe;
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) return;

    const trimmedContent = content.trim();

    if (!trimmedContent) {
      alert('내용을 입력해 주세요.');
      return;
    }

    if (!currentUser) {
      alert('로그인이 필요한 서비스입니다.');
      navigate('/login', { replace: true });
      return;
    }

    try {
      setIsSubmitting(true);

      const alreadyHasNote = await checkExistingNote(currentUser.uid, dateParam);

      if (alreadyHasNote) {
        alert('이미 이 날짜에 작성한 비밀 일기가 있습니다. 기존 일기에서 수정해 주세요.');
        navigate(`/secret_note?date=${dateParam}`);
        return;
      }

      await addDoc(collection(db, NOTE_COLLECTION), {
        uid: currentUser.uid,
        content: trimmedContent,
        date: dateParam,
        tags: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      alert('마음 일기 기록이 저장되었습니다.');
      navigate(`/secret_note?date=${dateParam}`);
    } catch (error) {
      console.error('일기 저장 실패:', error);
      alert('일기 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center font-bold text-[#1D2EE5]">
        비밀 일기장을 준비하는 중입니다...
      </div>
    );
  }

  return (
    <main className="w-full max-w-5xl mx-auto px-4 pt-6 pb-8 sm:px-6 sm:pt-10 sm:pb-12">
      <button
        type="button"
        onClick={() => navigate('/secret_note')}
        className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg font-bold text-sm sm:text-lg mb-6 sm:mb-8 hover:bg-gray-300 transition-colors w-fit"
      >
        &larr; 뒤로 가기
      </button>

      <section className="text-left mb-5 sm:mb-8">
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-[#1D2EE5] mb-2 sm:mb-3 leading-tight break-keep">
          나만의 마음 일기 기록
        </h1>
        <p className="text-sm sm:text-lg md:text-xl text-gray-500 break-keep">
          날짜를 클릭해 그날의 감정 아카이브를 확인하세요.
        </p>
      </section>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl p-5 sm:p-8 md:p-10 shadow-sm border border-gray-100 w-full flex flex-col"
      >
        <h2 className="text-xl sm:text-2xl font-bold text-black mb-4 sm:mb-5 break-keep">
          {displayDate} 속마음 온전히 채우기
        </h2>

        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="이곳에 기록하는 나의 마음 기록은 오직 이 글의 작성자만 볼 수 있습니다."
          className="w-full h-56 sm:h-72 md:h-80 bg-white border border-gray-300 rounded-xl px-4 sm:px-6 py-4 sm:py-5 text-base sm:text-lg md:text-xl leading-7 sm:leading-8 placeholder:text-gray-400 focus:outline-none focus:border-[#3D46AA] focus:ring-1 focus:ring-[#3D46AA] resize-none mb-5 sm:mb-6"
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 sm:py-4 rounded-xl shadow-sm text-base sm:text-lg md:text-xl font-bold text-white bg-[#3D46AA] hover:bg-[#3D46AA]/90 focus:outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? '저장 중...' : '마음 일기 기록 저장'}
        </button>
      </form>
    </main>
  );
};

export default SecretNoteWrite;