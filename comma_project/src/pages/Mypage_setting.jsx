//Mypage_setting은 계정 및 보안 설정을 할 수 있는 페이지입니다.
//'계정 및 보안 설정 // 비밀번호 변경 및 활동 닉네임 변경' 문구가 Header.jsx 아래에 위치합니다.
//'계정 및 보안 설정'은 파란색의 크고 굵은 글씨로, '비밀번호 변경 및 활동 닉네임 변경'은 회색의 작은 글씨로 작성합니다.
//흰색의 둥근 네모 박스에는 이미지, 닉네임, 비밀번호 변경을 할 수 있습니다.
//작고 검정 글씨로 이미지 설정이 있고, 그 아래에 이미지 버튼을 누르면 이미지를 설정할 수 있습니다. 그리고 그 사진은 Mypage 이미지 칸에서 볼 수 있습니다.
//그 아래에는 작고 검정 글씨로 닉네임 변경 설정이 쓰여있고 placeholder가 '변경할 닉네임을 입력해주세요.'인 폼이 있습니다.
//그 아래에는 작고 검정 글씨로 '현재 비밀번호 입력'이 쓰여있고 placeholder가 '현재 비밀번호를 입력해주세요.'인 폼이 있습니다.
//그 아래에는 작고 검정 글씨로 '보안 비밀번호 변경'이 쓰여있고 placeholder가 '새로운 비밀번호를 입력해주세요.'인 폼이 있습니다.
//이 데이터들은 API를 통해 저장되고 만약 현재 비밀번호가 틀리다면 '현재 비밀번호가 틀립니다. 다시 입력해주세요.'라는 alert창이 뜹니다.
//API를 통해 저장되어야하지만 일단은 임시로 localStorage에 저장되도록 합니다.
//그 아래에는 '변경 내용 저장하기' 버튼이 존재합니다. 버튼은 파란색 배경에 흰색 굵은 글씨로 되어있습니다.
//여기에서 수정한 데이터들은 바로 반영되어 확인할 수 있도록합니다.
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Mypage = () => {
    const navigate = useNavigate();

    const [forestPosts, setForestPosts] = useState([]);
    const [secretNotes, setSecretNotes] = useState([]);
    
    // 🌟 1. 프로필 정보를 담을 상태 추가 (기본값 세팅)
    const [userInfo, setUserInfo] = useState({ 
        nickname: '컴공눈송이님', 
        profileImage: null 
    });

    useEffect(() => {
        // 대나무숲 글 가져오기
        const savedForest = JSON.parse(localStorage.getItem('forestPosts')) || [];
        setForestPosts(savedForest);

        // 비밀 일기장 글 가져오기
        const savedNotes = JSON.parse(localStorage.getItem('secretNotes')) || [];
        setSecretNotes(savedNotes);

        // 🌟 2. 화면이 켜질 때 로컬 스토리지에서 수정한 닉네임/사진 불러오기
        const savedUserInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (savedUserInfo) {
            setUserInfo(savedUserInfo);
        }
    }, []);

    const formatNoteTitle = (dateString) => {
        if (!dateString) return '날짜 없음';
        const [year, month, day] = dateString.split('-');
        return `${year}년 ${parseInt(month)}월 ${parseInt(day)}일 나의 속마음`;
    };

    return (
        <div className="w-full max-w-5xl mx-auto pt-16 pb-20 px-4">
            
            <div className="text-left mb-10 px-2">
                <h1 className="text-4xl font-bold text-[#1D2EE5] mb-2">마이페이지</h1>
                <p className="text-gray-500 text-lg">나의 계정 관리</p>
            </div>

            {/* 계정 정보 (프로필) 영역 */}
            <div className="bg-white rounded-2xl p-8 mb-8 shadow-sm border border-gray-200 flex flex-col items-center justify-center">
                
                {/* 🌟 3. 설정한 이미지가 있으면 띄우고, 없으면 img 글씨 띄우기 */}
                <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center mb-4 text-gray-600 font-medium overflow-hidden border border-gray-200 shrink-0">
                    {userInfo.profileImage ? (
                        <img src={userInfo.profileImage} alt="프로필" className="w-full h-full object-cover" />
                    ) : (
                        <span>img</span>
                    )}
                </div>
                
                {/* 🌟 4. 설정한 닉네임 띄우기 */}
                <h2 className="text-xl font-bold text-black mb-4">{userInfo.nickname}</h2>
                
                <button 
                    onClick={() => navigate('/mypage_setting')}
                    className="bg-[#3D46AA] text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-opacity-90 transition-colors"
                >
                    계정 설정 및 패스워드 관리
                </button>
            </div>

            {/* 내가 쓴 글 목록 영역 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* [왼쪽] 내가 쓴 대나무숲 */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex flex-col h-100">
                    <div className="flex justify-between items-center mb-6 px-1">
                        <h3 className="text-xl font-bold text-[#1D2EE5]">내가 쓴 대나무숲</h3>
                        <span className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center font-bold text-gray-600 text-sm">
                            {forestPosts.length}
                        </span>
                    </div>

                    <div className="flex flex-col gap-3 overflow-y-auto pr-2 pb-2 h-full custom-scrollbar">
                        {forestPosts.length === 0 ? (
                            <p className="text-center text-gray-400 mt-10">작성한 글이 없습니다.</p>
                        ) : (
                            forestPosts.map((post) => (
                                <button 
                                    key={post.id}
                                    onClick={() => navigate(`/secret_forest/${post.id}`)}
                                    className="text-left w-full bg-white border border-gray-300 rounded-lg px-5 py-4 text-base font-bold text-gray-800 hover:bg-gray-50 transition-colors shrink-0"
                                >
                                    {post.title}
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* [오른쪽] 내가 쓴 비밀 일기 */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex flex-col h-100">
                    <div className="flex justify-between items-center mb-6 px-1">
                        <h3 className="text-xl font-bold text-[#1D2EE5]">내가 쓴 비밀 일기</h3>
                        <span className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center font-bold text-gray-600 text-sm">
                            {secretNotes.length}
                        </span>
                    </div>

                    <div className="flex flex-col gap-3 overflow-y-auto pr-2 pb-2 h-full custom-scrollbar">
                        {secretNotes.length === 0 ? (
                            <p className="text-center text-gray-400 mt-10">작성한 일기가 없습니다.</p>
                        ) : (
                            secretNotes.map((note) => (
                                <button 
                                    key={note.id}
                                    onClick={() => navigate(`/secret_note?date=${note.date}`)}
                                    className="text-left w-full bg-white border border-gray-300 rounded-lg px-5 py-4 text-base font-bold text-gray-800 hover:bg-gray-50 transition-colors shrink-0"
                                >
                                    {formatNoteTitle(note.date)}
                                </button>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Mypage;