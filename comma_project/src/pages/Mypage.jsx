/**
 * Mypage.jsx
 *
 * 쉼표 웹서비스의 마이페이지입니다.
 * 로그인한 사용자의 프로필 정보, 내가 작성한 대나무숲 글,
 * 내가 작성한 비밀 일기 목록을 확인할 수 있습니다.
 *
 * - Firebase Auth: 현재 로그인 사용자 확인 및 회원 탈퇴
 * - Firestore: 사용자 정보, 대나무숲 글, 비밀 일기 목록 조회
 * - React Router: 계정 설정, 게시글 상세, 비밀 일기 페이지로 이동
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteUser, onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import { auth, db } from '../firebase';

const DEFAULT_USER_INFO = {
  nickname: '쉼표 사용자',
  profileImage: null,
};

const LIST_STATUS_CLASS =
  'text-center text-sm md:text-base text-gray-400 mt-10';

const getTimestampMillis = (timestamp) => {
  if (!timestamp) return 0;

  if (typeof timestamp.toMillis === 'function') {
    return timestamp.toMillis();
  }

  if (typeof timestamp.toDate === 'function') {
    return timestamp.toDate().getTime();
  }

  return 0;
};

const sortPostsByLatest = (posts) => {
  return [...posts].sort(
    (a, b) => getTimestampMillis(b.createdAt) - getTimestampMillis(a.createdAt)
  );
};

const sortNotesByLatest = (notes) => {
  return [...notes].sort((a, b) => {
    const dateA = a.date ? new Date(a.date).getTime() : getTimestampMillis(a.createdAt);
    const dateB = b.date ? new Date(b.date).getTime() : getTimestampMillis(b.createdAt);

    return dateB - dateA;
  });
};

const formatNoteTitle = (dateString) => {
  if (!dateString) return '날짜 없음';

  const [year, month, day] = dateString.split('-');

  return `${year}년 ${Number(month)}월 ${Number(day)}일 나의 속마음`;
};

const getProfileInitial = (nickname) => {
  return nickname?.trim()?.charAt(0) || '쉼';
};

const Mypage = () => {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [userInfo, setUserInfo] = useState(DEFAULT_USER_INFO);
  const [forestPosts, setForestPosts] = useState([]);
  const [secretNotes, setSecretNotes] = useState([]);

  const [isForestLoading, setIsForestLoading] = useState(true);
  const [isNotesLoading, setIsNotesLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const currentUserId = currentUser?.uid;
  const isLoading = isForestLoading || isNotesLoading;

  // 로그인 상태를 확인하고, 비로그인 사용자는 로그인 페이지로 이동시킨다.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        alert('로그인이 필요한 서비스입니다.');
        navigate('/login', { replace: true });
        return;
      }

      setCurrentUser(user);
      setUserInfo({
        nickname: user.displayName || DEFAULT_USER_INFO.nickname,
        profileImage: user.photoURL || null,
      });
    });

    return unsubscribe;
  }, [navigate]);

  // Firestore users 문서의 닉네임/프로필 이미지 변경 사항을 실시간 반영한다.
  useEffect(() => {
    if (!currentUserId) return undefined;

    const userRef = doc(db, 'users', currentUserId);

    const unsubscribe = onSnapshot(
      userRef,
      (docSnap) => {
        const data = docSnap.data();

        setUserInfo({
          nickname: data?.nickname || currentUser.displayName || DEFAULT_USER_INFO.nickname,
          profileImage: data?.profileImage || currentUser.photoURL || null,
        });
      },
      (error) => {
        console.error('사용자 정보 불러오기 실패:', error);
      }
    );

    return unsubscribe;
  }, [currentUser, currentUserId]);

  // 내가 작성한 익명 대나무숲 글 목록을 불러온다.
  useEffect(() => {
    if (!currentUserId) return undefined;

    setIsForestLoading(true);

    const forestQuery = query(
      collection(db, 'secret_forest_list'),
      where('uid', '==', currentUserId)
    );

    const unsubscribe = onSnapshot(
      forestQuery,
      (querySnapshot) => {
        const fetchedPosts = querySnapshot.docs.map((postDoc) => ({
          id: postDoc.id,
          ...postDoc.data(),
        }));

        setForestPosts(sortPostsByLatest(fetchedPosts));
        setIsForestLoading(false);
      },
      (error) => {
        console.error('내가 쓴 대나무숲 글 불러오기 실패:', error);
        setIsForestLoading(false);
      }
    );

    return unsubscribe;
  }, [currentUserId]);

  // 내가 작성한 비밀 일기 목록을 불러온다.
  useEffect(() => {
    if (!currentUserId) return undefined;

    setIsNotesLoading(true);

    const notesQuery = query(
      collection(db, 'secret_notes'),
      where('uid', '==', currentUserId)
    );

    const unsubscribe = onSnapshot(
      notesQuery,
      (querySnapshot) => {
        const fetchedNotes = querySnapshot.docs.map((noteDoc) => ({
          id: noteDoc.id,
          ...noteDoc.data(),
        }));

        setSecretNotes(sortNotesByLatest(fetchedNotes));
        setIsNotesLoading(false);
      },
      (error) => {
        console.error('내가 쓴 비밀 일기 불러오기 실패:', error);
        setIsNotesLoading(false);
      }
    );

    return unsubscribe;
  }, [currentUserId]);

  const handleDeleteAccount = async () => {
    const user = auth.currentUser;

    if (!user || isDeleting) {
      alert('로그인 정보가 없습니다.');
      return;
    }

    const confirmDelete = window.confirm(
      '정말 쉼표를 떠나시겠습니까? 계정 삭제 후에는 복구할 수 없습니다.'
    );

    if (!confirmDelete) return;

    try {
      setIsDeleting(true);

      await deleteDoc(doc(db, 'users', user.uid));
      await deleteUser(user);

      alert('회원 탈퇴가 정상적으로 처리되었습니다. 그동안 쉼표를 이용해 주셔서 감사합니다.');
      navigate('/', { replace: true });
    } catch (error) {
      console.error('회원 탈퇴 실패:', error);

      if (error.code === 'auth/requires-recent-login') {
        alert('보안을 위해 다시 로그인한 후 회원탈퇴를 진행해 주세요.');
      } else {
        alert('회원 탈퇴 중 오류가 발생했습니다.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const renderForestPosts = () => {
    if (isForestLoading) {
      return <p className={LIST_STATUS_CLASS}>데이터를 불러오는 중입니다...</p>;
    }

    if (forestPosts.length === 0) {
      return <p className={LIST_STATUS_CLASS}>작성한 대나무숲 글이 없습니다.</p>;
    }

    return forestPosts.map((post) => (
      <button
        key={post.id}
        type="button"
        onClick={() => navigate(`/secret_forest/${post.id}`)}
        className="text-left w-full bg-white border border-gray-300 rounded-lg px-4 md:px-5 py-3 md:py-4 text-sm md:text-base font-bold text-gray-800 hover:bg-gray-50 transition-colors shrink-0 truncate"
      >
        {post.title}
      </button>
    ));
  };

  const renderSecretNotes = () => {
    if (isNotesLoading) {
      return <p className={LIST_STATUS_CLASS}>데이터를 불러오는 중입니다...</p>;
    }

    if (secretNotes.length === 0) {
      return <p className={LIST_STATUS_CLASS}>작성한 일기가 없습니다.</p>;
    }

    return secretNotes.map((note) => (
      <button
        key={note.id}
        type="button"
        onClick={() => navigate(`/secret_note?date=${note.date}`)}
        className="text-left w-full bg-white border border-gray-300 rounded-lg px-4 md:px-5 py-3 md:py-4 text-sm md:text-base font-bold text-gray-800 hover:bg-gray-50 transition-colors shrink-0 truncate"
      >
        {formatNoteTitle(note.date)}
      </button>
    ));
  };

  return (
    <main className="w-full max-w-5xl mx-auto pt-10 md:pt-16 pb-20 px-4 md:px-6">
      <section className="text-left mb-6 md:mb-10 px-1 md:px-2">
        <h1 className="text-3xl md:text-4xl font-bold text-[#1D2EE5] mb-1 md:mb-2">
          마이페이지
        </h1>
        <p className="text-gray-500 text-base md:text-lg">나의 계정 관리</p>
      </section>

      <section className="bg-white rounded-2xl p-6 md:p-8 mb-6 md:mb-8 shadow-sm border border-gray-200 flex flex-col items-center justify-center">
        <div className="w-16 h-16 md:w-24 md:h-24 bg-gray-300 rounded-full flex items-center justify-center mb-3 md:mb-4 text-gray-600 font-medium overflow-hidden border border-gray-200 shrink-0 text-2xl md:text-3xl">
          {userInfo.profileImage ? (
            <img src={userInfo.profileImage} alt="프로필" className="w-full h-full object-cover" />
          ) : (
            <span>{getProfileInitial(userInfo.nickname)}</span>
          )}
        </div>

        <h2 className="text-lg md:text-xl font-bold text-black mb-3 md:mb-4">
          {userInfo.nickname}님
        </h2>

        <button
          type="button"
          onClick={() => navigate('/mypage_setting')}
          className="w-full sm:w-auto bg-[#3D46AA] text-white px-4 md:px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-[#3D46AA]/90 transition-colors"
        >
          계정 설정 및 패스워드 관리
        </button>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-200 flex flex-col h-80 md:h-100">
          <div className="flex justify-between items-center mb-4 md:mb-6 px-1">
            <h3 className="text-lg md:text-xl font-bold text-[#1D2EE5]">
              내가 쓴 대나무숲
            </h3>
            <span className="w-7 h-7 md:w-8 md:h-8 rounded-full border-2 border-gray-300 flex items-center justify-center font-bold text-gray-600 text-xs md:text-sm">
              {isLoading ? '-' : forestPosts.length}
            </span>
          </div>

          <div className="flex flex-col gap-2.5 md:gap-3 overflow-y-auto pr-2 pb-2 h-full custom-scrollbar">
            {renderForestPosts()}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-200 flex flex-col h-80 md:h-100">
          <div className="flex justify-between items-center mb-4 md:mb-6 px-1">
            <h3 className="text-lg md:text-xl font-bold text-[#1D2EE5]">
              내가 쓴 비밀 일기
            </h3>
            <span className="w-7 h-7 md:w-8 md:h-8 rounded-full border-2 border-gray-300 flex items-center justify-center font-bold text-gray-600 text-xs md:text-sm">
              {isLoading ? '-' : secretNotes.length}
            </span>
          </div>

          <div className="flex flex-col gap-2.5 md:gap-3 overflow-y-auto pr-2 pb-2 h-full custom-scrollbar">
            {renderSecretNotes()}
          </div>
        </div>
      </section>

      <section className="flex justify-start mt-8 md:mt-10 pl-2 md:pl-4">
        <button
          type="button"
          onClick={handleDeleteAccount}
          disabled={isDeleting}
          className="flex items-center gap-1 text-black font-bold text-base md:text-lg hover:text-red-500 transition-colors group disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isDeleting ? '탈퇴 처리 중...' : '회원탈퇴'}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 transform transition-transform group-hover:translate-x-1 text-gray-400 group-hover:text-red-500"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </section>
    </main>
  );
};

export default Mypage;