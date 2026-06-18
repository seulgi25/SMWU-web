/**
 * SecretNoteList.jsx
 *
 * 나만의 비밀 일기 기록을 달력 형태로 확인하는 페이지임.
 * 사용자는 날짜를 선택하여 해당 날짜의 일기를 확인하고,
 * 작성된 일기의 내용과 태그를 수정하거나 삭제할 수 있음.
 *
 * - Firebase Auth: 로그인 사용자 확인함.
 * - Firestore: 로그인 사용자의 secret_notes 문서 조회, 수정, 삭제함.
 * - URL query: /secret_note?date=YYYY-MM-DD 형태로 특정 날짜 일기 바로 열기 처리함.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { auth, db } from '../firebase';

// 비밀 일기 데이터를 저장하는 Firestore 컬렉션 이름 생성.
const NOTE_COLLECTION = 'secret_notes';

// 달력 상단에 표시할 요일 목록 생성.
const WEEK_DAYS = ['일', '월', '화', '수', '목', '금', '토'];

// Firestore 실시간 구독 오류 발생 시 표시할 안내 메시지 생성.
const LISTENING_ERROR_MESSAGE = '일기 데이터를 불러오는 중 오류가 발생했습니다.';

// Firestore Timestamp 값을 밀리초 단위로 변환함.
const getTimestampMillis = (timestamp) => {
  if (!timestamp) return 0;
  if (typeof timestamp.toMillis === 'function') return timestamp.toMillis();
  if (typeof timestamp.toDate === 'function') return timestamp.toDate().getTime();

  return 0;
};

// 연, 월, 일을 YYYY-MM-DD 형식의 문자열로 변환함.
const formatDate = (year, month, day) => {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

// date query 값이 올바른 YYYY-MM-DD 날짜 형식인지 확인함.
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

// YYYY-MM-DD 문자열을 Date 객체로 변환함.
const getDateFromString = (dateString) => {
  if (!isValidDateString(dateString)) return null;

  const [year, month, day] = dateString.split('-').map(Number);

  return new Date(year, month - 1, day);
};

// 선택한 날짜를 화면에 표시할 한글 날짜 형식으로 변환함.
const getDisplayDateString = (dateString) => {
  if (!isValidDateString(dateString)) return '';

  const [year, month, day] = dateString.split('-').map(Number);

  return `${year}년 ${month}월 ${day}일`;
};

// 태그 데이터가 배열이면 문자열로 합치고, 문자열이면 그대로 반환함.
const formatTags = (tags) => {
  if (Array.isArray(tags)) return tags.join(' ');
  return tags || '';
};

// 일기 목록을 날짜 또는 작성일 기준 최신순으로 정렬함.
const sortNotesByLatest = (notes) => {
  return [...notes].sort((a, b) => {
    const dateA = a.date ? new Date(a.date).getTime() : getTimestampMillis(a.createdAt);
    const dateB = b.date ? new Date(b.date).getTime() : getTimestampMillis(b.createdAt);

    return dateB - dateA;
  });
};

// 비밀 일기 목록 및 달력 페이지 컴포넌트 생성.
const SecretNoteList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL query에서 선택된 날짜값을 가져옴.
  const queryDate = searchParams.get('date');

  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [notes, setNotes] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [editContent, setEditContent] = useState('');
  const [editTags, setEditTags] = useState('');

  // 현재 달력에서 표시할 연도, 월, 날짜 수, 시작 요일을 계산함.
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  // 일기가 작성된 날짜만 빠르게 확인하기 위해 Set으로 변환함.
  const noteDateSet = useMemo(() => {
    return new Set(notes.map((note) => note.date).filter(Boolean));
  }, [notes]);

  // 선택한 날짜에 해당하는 일기 데이터를 찾음.
  const selectedNote = useMemo(() => {
    if (!selectedDate) return null;
    return notes.find((note) => note.date === selectedDate) || null;
  }, [notes, selectedDate]);

  // 선택한 날짜를 화면 제목에 표시할 문자열로 변환함.
  const displayDateString = useMemo(() => {
    return selectedDate ? getDisplayDateString(selectedDate) : '';
  }, [selectedDate]);

  // 로그인 상태를 확인하고, 로그인된 사용자만 일기 목록을 볼 수 있게 처리함.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setCurrentUserId(null);
        setNotes([]);
        setIsLoading(false);
        alert('로그인이 필요한 서비스입니다.');
        navigate('/login', { replace: true });
        return;
      }

      setCurrentUserId(user.uid);
    });

    return unsubscribe;
  }, [navigate]);

  // URL의 date query가 있으면 해당 날짜를 선택하고 달력도 해당 달로 이동함.
  useEffect(() => {
    if (!queryDate || !isValidDateString(queryDate)) return;

    const parsedDate = getDateFromString(queryDate);

    setSelectedDate(queryDate);
    setCurrentDate(parsedDate);
    setIsEditing(false);
  }, [queryDate]);

  // Firestore에서 로그인한 사용자의 비밀 일기만 실시간으로 구독함.
  useEffect(() => {
    if (!currentUserId) return undefined;

    setIsLoading(true);

    const notesQuery = query(
      collection(db, NOTE_COLLECTION),
      where('uid', '==', currentUserId)
    );

    const unsubscribe = onSnapshot(
      notesQuery,
      (querySnapshot) => {
        const fetchedNotes = querySnapshot.docs.map((noteDoc) => ({
          id: noteDoc.id,
          ...noteDoc.data(),
        }));

        setNotes(sortNotesByLatest(fetchedNotes));
        setIsLoading(false);
      },
      (error) => {
        console.error('일기 불러오기 실패:', error);
        alert(LISTENING_ERROR_MESSAGE);
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, [currentUserId]);

  // 이전 달 버튼 클릭 시 달력을 이전 달로 이동함.
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  // 다음 달 버튼 클릭 시 달력을 다음 달로 이동함.
  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // 날짜를 선택하고 URL query에도 선택 날짜를 반영함.
  const handleDateSelect = (dateString) => {
    setSelectedDate(dateString);
    setIsEditing(false);
    setSearchParams({ date: dateString });
  };

  // 선택된 일기 상세 영역을 닫고 URL query를 초기화함.
  const handleCloseSelectedNote = () => {
    setSelectedDate(null);
    setIsEditing(false);
    setSearchParams({});
  };

  // 선택한 일기를 수정 모드로 전환하고 기존 내용을 수정 입력값에 반영함.
  const handleEditStart = (note) => {
    setEditContent(note.content || '');
    setEditTags(formatTags(note.tags));
    setIsEditing(true);
  };

  // 일기 수정 모드를 취소하고 수정 입력값을 초기화함.
  const handleEditCancel = () => {
    setIsEditing(false);
    setEditContent('');
    setEditTags('');
  };

  // 수정한 일기 내용을 검증한 뒤 Firestore에 저장함.
  const handleEditSave = async (noteId) => {
    const trimmedContent = editContent.trim();
    const trimmedTags = editTags.trim();

    if (!trimmedContent) {
      alert('일기 내용을 입력해 주세요.');
      return;
    }

    try {
      setIsSavingEdit(true);

      await updateDoc(doc(db, NOTE_COLLECTION, noteId), {
        content: trimmedContent,
        tags: trimmedTags,
        updatedAt: serverTimestamp(),
      });

      setIsEditing(false);
      setEditContent('');
      setEditTags('');
    } catch (error) {
      console.error('수정 실패:', error);
      alert('수정 중 오류가 발생했습니다.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // 선택한 일기를 삭제하고 수정 상태를 초기화함.
  const handleDelete = async (noteId) => {
    const confirmDelete = window.confirm('정말 이 기록을 삭제하시겠습니까? 복구할 수 없습니다.');

    if (!confirmDelete || isDeleting) return;

    try {
      setIsDeleting(true);

      await deleteDoc(doc(db, NOTE_COLLECTION, noteId));

      setIsEditing(false);
      setEditContent('');
      setEditTags('');
    } catch (error) {
      console.error('삭제 실패:', error);
      alert('삭제 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  // 현재 월의 달력 날짜 셀을 생성함.
  const renderCalendarDays = () => {
    // 해당 월의 1일 전까지 비어 있는 칸을 생성함.
    const emptyCells = Array.from({ length: firstDayOfMonth }).map((_, index) => (
      <div
        key={`empty-${index}`}
        className="h-16 md:h-20 border border-gray-50 bg-gray-50 rounded-sm"
      />
    ));

    // 현재 월의 실제 날짜 칸을 생성함.
    const dateCells = Array.from({ length: daysInMonth }).map((_, index) => {
      const day = index + 1;
      const dateString = formatDate(year, month, day);
      const hasNote = noteDateSet.has(dateString);
      const isSelected = selectedDate === dateString;
      const isSunday = new Date(year, month, day).getDay() === 0;
      const isSaturday = new Date(year, month, day).getDay() === 6;

      return (
        <button
          key={dateString}
          type="button"
          onClick={() => handleDateSelect(dateString)}
          className={`h-16 md:h-20 border relative cursor-pointer p-1.5 md:p-2 rounded-sm transition-all text-left ${
            isSelected
              ? 'border-[#3D46AA] bg-blue-50 border-2'
              : 'border-gray-100 hover:bg-gray-50'
          }`}
        >
          <span
            className={`text-xs md:text-sm font-bold ${
              isSunday ? 'text-red-500' : isSaturday ? 'text-blue-500' : 'text-black'
            }`}
          >
            {day}
          </span>

          {hasNote && (
            <span className="absolute bottom-1 right-1 md:bottom-2 md:right-2 text-yellow-400 text-xs md:text-sm">
              ⭐
            </span>
          )}
        </button>
      );
    });

    return [...emptyCells, ...dateCells];
  };

  // 선택 날짜와 일기 존재 여부에 따라 일기 상세 영역을 렌더링함.
  const renderNoteViewer = () => {
    if (!selectedDate) {
      return (
        <div className="bg-gray-50 rounded-2xl h-full min-h-72 flex items-center justify-center border border-gray-200 p-6">
          <p className="text-gray-500 font-bold text-sm md:text-base text-center">
            왼쪽 달력에서 날짜를 선택해주세요.
          </p>
        </div>
      );
    }

    if (!selectedNote) {
      return (
        <div className="bg-white rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 h-full min-h-72 flex flex-col items-center justify-center text-center gap-4">
          <p className="text-base md:text-lg font-bold text-black">{displayDateString}</p>
          <p className="text-gray-500 text-xs md:text-sm">이 날 작성된 비밀 일기가 없습니다.</p>
          <button
            type="button"
            onClick={() => navigate(`/secret_note_write?date=${selectedDate}`)}
            className="mt-4 px-4 py-2 md:px-5 md:py-2.5 bg-[#3D46AA] text-white rounded-lg font-bold text-sm md:text-base hover:bg-[#3D46AA]/90 transition-all"
          >
            일기 작성하기
          </button>
        </div>
      );
    }

    return (
      <div className="bg-[#9299E5] rounded-xl p-4 md:p-5 shadow-sm h-full flex flex-col relative">
        <button
          type="button"
          onClick={handleCloseSelectedNote}
          className="absolute top-3 right-3 md:top-4 md:right-4 bg-white w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded-sm font-bold text-base md:text-lg text-black hover:bg-gray-100 z-10 shadow-sm"
          aria-label="선택한 일기 닫기"
        >
          X
        </button>

        <h2 className="text-base md:text-lg font-bold text-white mb-3 md:mb-4 mt-1 pr-8 md:pr-10 wrap-break-word leading-snug">
          {displayDateString} 나의 속마음
        </h2>

        <div className="bg-white rounded-xl p-5 md:p-6 flex-1 flex flex-col border-4 md:border-[6px] border-white/20 outline-2 md:outline-4 outline-[#9299E5] -outline-offset-4 md:-outline-offset-8">
          {isEditing ? (
            <div className="flex flex-col h-full gap-3">
              <textarea
                value={editContent}
                onChange={(event) => setEditContent(event.target.value)}
                className="w-full flex-1 bg-gray-50 border border-gray-200 rounded-lg p-3 md:p-4 text-sm md:text-base font-medium text-black resize-none focus:outline-none focus:ring-2 focus:ring-[#9299E5]"
              />
              <input
                type="text"
                value={editTags}
                onChange={(event) => setEditTags(event.target.value)}
                placeholder="태그 입력 (예: #과제 #피곤해)"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 md:p-3 text-xs md:text-sm font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#9299E5]"
              />

              <div className="flex gap-2 mt-auto">
                <button
                  type="button"
                  onClick={handleEditCancel}
                  className="flex-1 py-2 md:py-2.5 bg-gray-200 text-gray-700 font-bold rounded-lg text-xs md:text-sm hover:bg-gray-300"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={() => handleEditSave(selectedNote.id)}
                  disabled={isSavingEdit}
                  className="flex-1 py-2 md:py-2.5 bg-[#3D46AA] text-white font-bold rounded-lg text-xs md:text-sm hover:bg-[#3D46AA]/90 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSavingEdit ? '수정 중...' : '수정 완료'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <p className="text-sm md:text-base font-bold text-black mb-4 md:mb-6 whitespace-pre-wrap leading-relaxed wrap-break-word">
                {selectedNote.content}
              </p>

              <p className="text-xs md:text-sm font-bold text-gray-500 mb-auto wrap-break-word">
                {formatTags(selectedNote.tags)}
              </p>

              <div className="flex gap-2 md:gap-3 mt-5 md:mt-6">
                <button
                  type="button"
                  onClick={() => handleDelete(selectedNote.id)}
                  disabled={isDeleting}
                  className="w-1/3 py-2 md:py-2.5 bg-[#E71616] text-white font-bold rounded-md text-xs md:text-sm hover:bg-[#E71616]/90 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isDeleting ? '삭제 중' : '삭제하기'}
                </button>
                <button
                  type="button"
                  onClick={() => handleEditStart(selectedNote)}
                  className="w-2/3 py-2 md:py-2.5 bg-[#3D46AA] text-white font-bold rounded-md text-xs md:text-sm hover:bg-[#3D46AA]/90 transition-all"
                >
                  수정하기
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // 비밀 일기 달력과 선택한 일기 상세 영역을 렌더링함.
  return (
    <main className="w-full max-w-6xl mx-auto pt-10 md:pt-16 pb-12 px-4">
      <section className="text-left mb-8 md:mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-[#1D2EE5] mb-2">
          나만의 마음 일기 기록
        </h1>
        <p className="text-gray-500 text-base md:text-lg">
          날짜를 클릭하여 그날의 감정 아카이브를 확인하세요.
        </p>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-start">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6">
          <div className="flex justify-between items-center mb-6 px-2 md:px-4">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="text-gray-400 hover:text-black font-bold text-xl"
              aria-label="이전 달 보기"
            >
              &lt;
            </button>

            <h2 className="text-lg md:text-xl font-bold text-black">
              {year}. {String(month + 1).padStart(2, '0')}
            </h2>

            <button
              type="button"
              onClick={handleNextMonth}
              className="text-gray-400 hover:text-black font-bold text-xl"
              aria-label="다음 달 보기"
            >
              &gt;
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs md:text-sm mb-2 text-gray-500">
            {WEEK_DAYS.map((day, index) => (
              <div
                key={day}
                className={index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : ''}
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 md:gap-1.5">
            {renderCalendarDays()}
          </div>
        </div>

        <div className="h-full min-h-72 md:min-h-124">
          {isLoading ? (
            <div className="bg-gray-50 rounded-2xl h-full min-h-72 flex items-center justify-center border border-gray-200 p-6">
              <p className="text-gray-500 font-bold text-sm md:text-base text-center">
                비밀 일기 기록을 불러오는 중입니다...
              </p>
            </div>
          ) : (
            renderNoteViewer()
          )}
        </div>
      </section>
    </main>
  );
};

export default SecretNoteList;