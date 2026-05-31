//이 페이지는 비밀 일기장을 작성할 수 있는 페이지입니다.
//Secret_note_list.jsx에서 일기 작성하기 버튼을 누르면 Secret_note_write.jsx 페이지로 이동합니다.
//'나만의 마음 일기 기록 // 날짜를 클릭하여 그날의 감정 아카이브를 확인하세요.'라는 문구가 header.jsx 바로 아래에 위치합니다.
//'나만의 마음 일기 기록'은 파란색의 크고 굵은 글씨로, '날짜를 클릭하여 그날의 감정 아카이브를 확인하세요.'는 회색의 작은 글씨로 디자인되어 있습니다.
//글 작성 폼은 흰색의 둥근 모서리를 가진 박스 안에 위치하며, 내용 입력란과 '마음 일기 기록 저장' 버튼으로 구성되어있습니다.
//내용 입력란에는 일기 내용을 입력할 수 있습니다. 내용 입력란의 placeholder는 '이곳에 기록하는 나의 마음 기록은 오직 이 글의 작성자만 볼 수 있습니다.'입니다.
//'마음 일기 기록 저장' 버튼은 '#3D46AA' 배경에 흰색 글씨로 '마음 일기 기록 저장'이라고 쓰여있으며, 둥근 모서리를 가지고 있습니다.
//글을 작성하고 '마음 일기 기록 저장' 버튼을 누르면 글이 저장되고 Secret_note_list 페이지로 이동합니다.
//글은 브라우저의 localStorage에 'secretNotes'라는 이름으로 저장되어 Secret_note_list 페이지에서 볼 수 있도록 구현됩니다. (글 목록 페이지는 Secret_note_list.jsx 파일로 만들어주세요.)
//글 작성 폼과 '마음 일기 기록 저장' 버튼은 화면의 중앙에 위치하며, 반응형으로 디자인되어 있습니다.
//뒤로 가기 버튼을 누르면 Secret_note_list 페이지로 이동합니다.
//모든 디자인은 tailwindcss를 사용하여 구현됩니다.
import React, { useState } from 'react';
// 🌟 쿼리 파라미터(?date=...)를 읽기 위해 useSearchParams를 추가로 불러옵니다.
import { useNavigate, useSearchParams } from 'react-router-dom';

const SecretNoteWrite = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    // 이전 페이지에서 넘어온 날짜를 가져옵니다. 없으면 오늘 날짜를 기본값으로 사용합니다.
    const dateParam = searchParams.get('date') || new Date().toISOString().split('T')[0];
    
    const [content, setContent] = useState('');

    // 날짜 텍스트를 "5월 24일" 형태로 변환합니다.
    const dateObj = new Date(dateParam);
    const displayDate = `${dateObj.getMonth() + 1}월 ${dateObj.getDate()}일`;

    const handleSubmit = () => {
        if (!content.trim()) {
            alert('내용을 입력해 주세요.');
            return;
        }

        const existingNotes = JSON.parse(localStorage.getItem('secretNotes')) || [];
        const newNote = {
            id: Date.now(),
            content: content,
            date: dateParam, 
            tags: '' // 호환성을 위해 빈 태그를 기본으로 넣어줍니다.
        };
        
        const updatedNotes = [...existingNotes, newNote];
        localStorage.setItem('secretNotes', JSON.stringify(updatedNotes));
        
        // 작성 완료 후 일기장 리스트로 이동
        navigate('/secret_note');
    };

    return (
        // 🌟 폭을 max-w-3xl에서 max-w-6xl로 넓혀서 두 번째 사진처럼 시원하게 배치했습니다.
        <div className="w-full max-w-6xl mx-auto pt-10 pb-12 px-4">
            
            {/* 뒤로 가기 버튼 */}
            <button 
                onClick={() => navigate('/secret_note')}
                className="flex items-center gap-2 bg-gray-200 text-gray-700 px-5 py-2.5 rounded-lg font-bold text-lg mb-8 hover:bg-gray-300 transition-colors w-fit"
            >
                &larr; 뒤로 가기
            </button>

            {/* 상단 문구 영역 (좌측 정렬) */}
            <div className="text-left mb-8">
                <h1 className="text-4xl md:text-5xl font-bold text-[#1D2EE5] mb-3">나만의 마음 일기 기록</h1>
                <p className="text-gray-500 text-lg md:text-xl">날짜를 클릭하여 그날의 감정 아카이브를 확인하세요.</p>
            </div>
            
            {/* 글 작성 폼 영역 (크고 넓은 흰색 박스) */}
            <div className="bg-white rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 w-full flex flex-col">
                
                {/* 🌟 선택된 날짜 제목 */}
                <h2 className="text-xl md:text-2xl font-bold text-black mb-4">
                    {displayDate} 속마음 온전히 채우기
                </h2>

                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="이곳에 기록하는 나의 마음 기록은 오직 이 글의 작성자만 볼 수 있습니다."
                    className="w-full h-80 bg-white border border-gray-300 rounded-lg px-6 py-5 text-lg md:text-xl focus:outline-none focus:border-[#3D46AA] focus:ring-1 focus:ring-[#3D46AA] resize-none mb-6"
                />
                
                <button
                    onClick={handleSubmit}
                    className="w-full py-4 rounded-xl shadow-sm text-xl font-bold text-white bg-[#3D46AA] hover:bg-opacity-90 focus:outline-none transition-all"
                >
                    마음 일기 기록 저장
                </button>

            </div>
        </div>
    );
};

export default SecretNoteWrite;