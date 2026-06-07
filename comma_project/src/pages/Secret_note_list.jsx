//Secret_note_list 페이지는 내가 쓴 비밀 일기장을 볼 수 있는 페이지입니다.
//'나만의 마음 일기 기록 // 날짜를 클릭하여 그날의 감정 아카이브를 확인하세요.' 라는 문구가 Header.jsx 아래에 위치해 있습니다. 이 문구는 '나만의 마음 일기 기록'은 크고 굵은 파란색으로, '날짜를 클릭하여 그날의 감정 아카이브를 확인하세요.'는 회색 글씨로('나만의 마음 일기 기록' 단어보다 작게) 디자인되어 있습니다.
//화면의 왼쪽에는 현재 달의 달력이 위치해 있습니다. 달력에서 날짜를 클릭하면 그날의 일기 기록이 오른쪽에 뜨도록 구현되어 있습니다.
//달력은 현재 달이 보이도록 되어 있으며, 이전 달과 다음 달로 이동할 수 있는 버튼이 존재합니다.
//일기 기록에는 연, 달, 월, 쓴 글, 태그명, 삭제하기, 수정하기 버튼이 있습니다.
//태그는 자유롭게 입력할 수 있으며 글의 내용 아래에 저장됩니다.
//삭제하기 버튼을 누르면 해당 일기 기록이 삭제되고, 수정하기 버튼을 누르면 글과 태그를 수정할 수 있는 폼이 뜹니다.
//일기 기록은 브라우저의 localStorage에 'secretNotes'라는 이름으로 저장되어 Secret_note_list 페이지에서 볼 수 있도록 구현됩니다. (글 작성 페이지는 Secret_note_write.jsx 파일로 만들어주세요.)
//기록을 입력하면 해당 날짜의 달력에 별 표시의 아이콘이 뜨도록 구현되어 있습니다.
//일기 기록은 연한 파란색의 박스 안에 연, 월, 일이 입력되어있고 그 박스 안에 흰색 둥근 모서리를 가진 박스에 글과 태그, 삭제하기, 수정하기 버튼이 위치합니다.
//예를 들어 '2026년 5월 19일 나의 속마음'은 흰색 글씨로 연한 파란색 박스에 작성되어있고 그 글의 내용과 태그는 흰색 둥근 모서리를 가진 박스 안에 작성되어 있습니다.
//삭제하기 버튼은 '#E71616' 배경에 흰색 글씨로 '삭제하기'라고 쓰여있으며, 수정하기 버튼은 '#3D46AA' 배경에 흰색 글씨로 '수정하기'라고 쓰여있습니다. 두 버튼 모두 둥근 모서리를 가지고 있습니다.
//비밀 일기장 글 작성은 Secret_note_write 페이지에서 작성할 수 있도록 구현되어 있습니다. Secret_note_write 페이지에서 작성한 글은 브라우저의 localStorage에 'secretNotes'라는 이름으로 저장되어 Secret_note_list 페이지에서 볼 수 있도록 구현됩니다.
//모든 디자인은 tailwindcss를 사용하여 구현됩니다.
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 🌟 Firebase 도구 불러오기
import { auth, db } from '../firebase';
import { collection, query, where, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const SecretNoteList = () => {
    const navigate = useNavigate();

    // 시작 달력을 현재 실제 달로 맞춤 (new Date())
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [notes, setNotes] = useState([]);

    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState('');
    const [editTags, setEditTags] = useState('');
    
    // 로그인한 유저 정보 담기
    const [currentUser, setCurrentUser] = useState(null);

    // 🌟 1. 로그인 상태 감지 및 내 일기 불러오기
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setCurrentUser(user);
                fetchMyNotes(user.uid);
            } else {
                setCurrentUser(null);
                setNotes([]); // 로그아웃 상태면 일기장 비우기
                alert("로그인이 필요한 서비스입니다.");
                navigate('/login');
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    // 🌟 2. 서버에서 "내 일기(uid)"만 필터링해서 가져오기
    const fetchMyNotes = async (uid) => {
        try {
            // secret_notes 컬렉션에서 uid가 내 uid와 똑같은 문서만 줘!
            const q = query(collection(db, "secret_notes"), where("uid", "==", uid));
            const querySnapshot = await getDocs(q);
            
            const fetchedNotes = querySnapshot.docs.map(doc => ({
                id: doc.id, // Firestore의 진짜 고유 문자열 ID
                ...doc.data()
            }));
            setNotes(fetchedNotes);
        } catch (error) {
            console.error("일기 불러오기 실패:", error);
        }
    };

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    const formatDate = (y, m, d) => {
        return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    };

    // 🌟 3. 서버 데이터 삭제
    const handleDelete = async (id) => {
        if (window.confirm('정말 이 기록을 삭제하시겠습니까? 복구할 수 없습니다.')) {
            try {
                await deleteDoc(doc(db, "secret_notes", id)); // Firestore에서 삭제
                setNotes(notes.filter(note => note.id !== id)); // 화면에서 지우기
                setSelectedDate(null);
            } catch (error) {
                console.error("삭제 실패:", error);
                alert("삭제 중 오류가 발생했습니다.");
            }
        }
    };

    const handleEditStart = (note) => {
        setEditContent(note.content);
        setEditTags(note.tags || '');
        setIsEditing(true);
    };

    // 🌟 4. 서버 데이터 수정 (내용, 태그)
    const handleEditSave = async (id) => {
        try {
            const docRef = doc(db, "secret_notes", id);
            await updateDoc(docRef, {
                content: editContent,
                tags: editTags
            }); // Firestore 업데이트

            // 화면 상태 업데이트
            setNotes(notes.map(note => 
                note.id === id ? { ...note, content: editContent, tags: editTags } : note
            ));
            setIsEditing(false);
        } catch (error) {
            console.error("수정 실패:", error);
            alert("수정 중 오류가 발생했습니다.");
        }
    };

    const selectedNote = selectedDate ? notes.find(note => note.date === selectedDate) : null;
    const displayDateString = selectedDate ? 
        `${selectedDate.split('-')[0]}년 ${parseInt(selectedDate.split('-')[1])}월 ${parseInt(selectedDate.split('-')[2])}일` : '';

    return (
        <div className="w-full max-w-6xl mx-auto pt-10 md:pt-16 pb-12 px-4">
            
            <div className="text-left mb-8 md:mb-10">
                <h1 className="text-3xl md:text-4xl font-bold text-[#1D2EE5] mb-2">나만의 마음 일기 기록</h1>
                <p className="text-gray-500 text-base md:text-lg">날짜를 클릭하여 그날의 감정 아카이브를 확인하세요.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-start">
                
                {/* 🌟 왼쪽 영역: 달력 */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6">
                    <div className="flex justify-between items-center mb-6 px-2 md:px-4">
                        <button onClick={prevMonth} className="text-gray-400 hover:text-black font-bold text-xl">&lt;</button>
                        <h2 className="text-lg md:text-xl font-bold text-black">{year}. {String(month + 1).padStart(2, '0')}</h2>
                        <button onClick={nextMonth} className="text-gray-400 hover:text-black font-bold text-xl">&gt;</button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs md:text-sm mb-2 text-gray-500">
                        <div className="text-red-500">일</div>
                        <div>월</div>
                        <div>화</div>
                        <div>수</div>
                        <div>목</div>
                        <div>금</div>
                        <div className="text-blue-500">토</div>
                    </div>

                    <div className="grid grid-cols-7 gap-1 md:gap-1.5">
                        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                            <div key={`empty-${i}`} className="h-16 md:h-20 border border-gray-50 bg-gray-50 rounded-sm"></div>
                        ))}
                        
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const dateString = formatDate(year, month, day);
                            const hasNote = notes.some(note => note.date === dateString);
                            const isSelected = selectedDate === dateString;
                            const isSunday = new Date(year, month, day).getDay() === 0;

                            return (
                                <div 
                                    key={day} 
                                    onClick={() => {
                                        setSelectedDate(dateString);
                                        setIsEditing(false);
                                    }}
                                    className={`h-16 md:h-20 border relative cursor-pointer p-1.5 md:p-2 rounded-sm transition-all ${
                                        isSelected ? 'border-[#3D46AA] bg-blue-50 border-2' : 'border-gray-100 hover:bg-gray-50'
                                    }`}
                                >
                                    <span className={`text-xs md:text-sm font-bold ${isSunday ? 'text-red-500' : 'text-black'}`}>
                                        {day}
                                    </span>
                                    {hasNote && (
                                        <div className="absolute bottom-1 right-1 md:bottom-2 md:right-2 text-yellow-400 text-xs md:text-sm">
                                            ⭐
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 🌟 오른쪽 영역: 일기 기록 뷰어 */}
                <div className="h-full min-h-75 md:min-h-125">
                    {!selectedDate ? (
                        <div className="bg-gray-50 rounded-2xl h-full min-h-75 flex items-center justify-center border border-gray-200 p-6">
                            <p className="text-gray-500 font-bold text-sm md:text-base text-center">왼쪽 달력에서 날짜를 선택해주세요.</p>
                        </div>
                    ) : !selectedNote ? (
                        <div className="bg-white rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 h-full min-h-75 flex flex-col items-center justify-center text-center gap-4">
                            <p className="text-base md:text-lg font-bold text-black">{displayDateString}</p>
                            <p className="text-gray-500 text-xs md:text-sm">이 날 작성된 비밀 일기가 없습니다.</p>
                            <button 
                                onClick={() => navigate(`/secret_note_write?date=${selectedDate}`)}
                                className="mt-4 px-4 py-2 md:px-5 md:py-2.5 bg-[#3D46AA] text-white rounded-lg font-bold text-sm md:text-base hover:bg-opacity-90 transition-all"
                            >
                                일기 작성하기
                            </button>
                        </div>
                    ) : (
                        <div className="bg-[#9299E5] rounded-xl p-4 md:p-5 shadow-sm h-full flex flex-col relative">
                            {/* X 닫기 버튼 크기 최적화 */}
                            <button 
                                onClick={() => setSelectedDate(null)}
                                className="absolute top-3 right-3 md:top-4 md:right-4 bg-white w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded-sm font-bold text-base md:text-lg text-black hover:bg-gray-100 z-10 shadow-sm"
                            >
                                X
                            </button>

                            {/* 🌟 수정: X 버튼과 겹치지 않게 pr-8(오른쪽 여백) 추가 및 반응형 폰트 적용 */}
                            <h2 className="text-base md:text-lg font-bold text-white mb-3 md:mb-4 mt-1 pr-8 md:pr-10 wrap-break-word leading-snug">
                                {displayDateString} 나의 속마음
                            </h2>

                            <div className="bg-white rounded-xl p-5 md:p-6 flex-1 flex flex-col border-4 md:border-[6px] border-white/20 outline-2 md:outline-4 outline-[#9299E5] -outline-offset-4 md:-outline-offset-8">
                                
                                {isEditing ? (
                                    <div className="flex flex-col h-full gap-3">
                                        <textarea
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                            className="w-full flex-1 bg-gray-50 border border-gray-200 rounded-lg p-3 md:p-4 text-sm md:text-base font-medium text-black resize-none focus:outline-none focus:ring-2 focus:ring-[#9299E5]"
                                        />
                                        <input
                                            type="text"
                                            value={editTags}
                                            onChange={(e) => setEditTags(e.target.value)}
                                            placeholder="태그 입력 (예: #과제 #피곤해)"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 md:p-3 text-xs md:text-sm font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#9299E5]"
                                        />
                                        <div className="flex gap-2 mt-auto">
                                            <button onClick={() => setIsEditing(false)} className="flex-1 py-2 md:py-2.5 bg-gray-200 text-gray-700 font-bold rounded-lg text-xs md:text-sm hover:bg-gray-300">취소</button>
                                            <button onClick={() => handleEditSave(selectedNote.id)} className="flex-1 py-2 md:py-2.5 bg-[#3D46AA] text-white font-bold rounded-lg text-xs md:text-sm hover:bg-opacity-90">수정 완료</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col h-full">
                                        {/* 🌟 본문 내용 폰트 크기 축소 및 줄간격 조절 */}
                                        <p className="text-sm md:text-base font-bold text-black mb-4 md:mb-6 whitespace-pre-wrap leading-relaxed wrap-break-word">{selectedNote.content}</p>
                                        
                                        <p className="text-xs md:text-sm font-bold text-gray-500 mb-auto">{selectedNote.tags}</p>

                                        {/* 하단 버튼 크기 최적화 */}
                                        <div className="flex gap-2 md:gap-3 mt-5 md:mt-6">
                                            <button 
                                                onClick={() => handleDelete(selectedNote.id)}
                                                className="w-1/3 py-2 md:py-2.5 bg-[#E71616] text-white font-bold rounded-md text-xs md:text-sm hover:bg-opacity-90 transition-all"
                                            >
                                                삭제하기
                                            </button>
                                            <button 
                                                onClick={() => handleEditStart(selectedNote)}
                                                className="w-2/3 py-2 md:py-2.5 bg-[#3D46AA] text-white font-bold rounded-md text-xs md:text-sm hover:bg-opacity-90 transition-all"
                                            >
                                                수정하기
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default SecretNoteList;