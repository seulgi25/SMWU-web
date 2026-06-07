//Mypage는 계정 관리 페이지입니다.
//'마이페이지 // 나의 계정 관리'라는 문구가 header.jsx 바로 아래에 위치합니다.
//'마이페이지'는 파란색의 크고 굵은 글씨로, '나의 계정 관리'는 회색의 작은 글씨로 디자인되어 있습니다.
//첫번째 흰색의 둥근 모서리를 가진 박스 안에는 '계정 정보' 섹션이 존재합니다. 이 섹션에는 프로필 이미지와 닉네임, '계정 설정 및 패스워드 관리' 버튼이 존재합니다.
//'계정 설정 및 패스워드 관리' 버튼은 '#3D46AA' 배경에 흰색 글씨로 '계정 설정 및 패스워드 관리'라고 쓰여있으며, 둥근 모서리를 가지고 있습니다. 이 버튼을 누르면 Mypage_setting.jsx로 이동합니다.
//그 아래에는 두개의 흰색 둥근 모서리를 가진 박스가 나란히 존재합니다.
//왼쪽의 박스에는 파란색 굵은 글씨로 '내가 쓴 대나무숲'이라는 제목이 있으며, 그 아래에는 '내가 쓴 대나무숲 글 목록'이 존재합니다. 글 목록에는 글의 제목이 나열되어있습니다. 글 목록을 누르면 해당 글의 상세 페이지로 이동합니다.
//오른쪽의 박스에는 파란색 굵은 글씨로 '내가 쓴 비밀 일기'라는 제목이 있으며, 그 아래에는 '내가 쓴 일기 글 목록'이 존재합니다. 글 목록에는 예를 들어 2026년 5월 19일에 쓴 글이라면 '2026년 5월 19일 나의 속마음'이라 하는 제목이 나열되어있습니다. 글 목록을 누르면 해당 글의 상세 페이지로 이동합니다.(Secret_note_list에서 그 날짜의 글을 보여줍니다)
//글 목록은 브라우저의 localStorage에 'forestPosts'와 'secretNotes'라는 이름으로 저장된 글 데이터를 불러와서 보여줍니다.
//내가 쓴 대나무숲과 내가 쓴 비밀 일기의 목록은 한번에 최대 5개씩 보여주고 스크롤을 내리면 계속 볼 수 있게 해줍니다.
//모든 디자인은 tailwindcss를 사용하여 구현됩니다.
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 🌟 Firebase 관련 도구들 불러오기
import { auth, db } from '../firebase';
import { onAuthStateChanged, deleteUser } from 'firebase/auth';
import { collection, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';

const Mypage = () => {
    const navigate = useNavigate();

    const [userInfo, setUserInfo] = useState({ nickname: '로딩중...', profileImage: null });
    const [forestPosts, setForestPosts] = useState([]);
    const [secretNotes, setSecretNotes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUserInfo({
                    nickname: user.displayName || '쉼표 사용자',
                    profileImage: user.photoURL || null
                });
                await fetchMyData(user.uid);
            } else {
                alert("로그인이 필요한 서비스입니다.");
                navigate('/login');
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    const fetchMyData = async (uid) => {
        try {
            const forestQuery = query(collection(db, "secret_forest_list"), where("uid", "==", uid));
            const forestSnap = await getDocs(forestQuery);
            const fetchedForest = forestSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            fetchedForest.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
            setForestPosts(fetchedForest);

            const notesQuery = query(collection(db, "secret_notes"), where("uid", "==", uid));
            const notesSnap = await getDocs(notesQuery);
            const fetchedNotes = notesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            fetchedNotes.sort((a, b) => new Date(b.date) - new Date(a.date));
            setSecretNotes(fetchedNotes);

        } catch (error) {
            console.error("내 데이터 불러오기 실패:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatNoteTitle = (dateString) => {
        if (!dateString) return '날짜 없음';
        const [year, month, day] = dateString.split('-');
        return `${year}년 ${parseInt(month)}월 ${parseInt(day)}일 나의 속마음`;
    };

    const handleDeleteAccount = async () => {
        const user = auth.currentUser;

        if (!user) {
            alert("로그인 정보가 없습니다.");
            return;
        }

        const confirmDelete = window.confirm("정말 쉼표를 떠나시겠습니까? 모든 정보가 삭제되며 복구할 수 없습니다.");
        
        if (confirmDelete) {
            try {
                await deleteDoc(doc(db, "users", user.uid));
                await deleteUser(user);
                
                alert("회원 탈퇴가 정상적으로 처리되었습니다. 그동안 쉼표를 이용해 주셔서 감사합니다.");
                navigate('/'); 
            } catch (error) {
                console.error("탈퇴 실패:", error);
                alert("보안을 위해 로그아웃 후 다시 로그인하여 탈퇴를 진행해 주세요.");
                navigate('/'); 
            }
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto pt-10 md:pt-16 pb-20 px-4 md:px-6">
            
            {/* 상단 타이틀 영역 */}
            <div className="text-left mb-6 md:mb-10 px-1 md:px-2">
                <h1 className="text-3xl md:text-4xl font-bold text-[#1D2EE5] mb-1 md:mb-2">마이페이지</h1>
                <p className="text-gray-500 text-base md:text-lg">나의 계정 관리</p>
            </div>

            {/* 계정 정보 (프로필) 영역 */}
            <div className="bg-white rounded-2xl p-6 md:p-8 mb-6 md:mb-8 shadow-sm border border-gray-200 flex flex-col items-center justify-center">
                <div className="w-16 h-16 md:w-24 md:h-24 bg-gray-300 rounded-full flex items-center justify-center mb-3 md:mb-4 text-gray-600 font-medium overflow-hidden border border-gray-200 shrink-0 text-2xl md:text-3xl">
                    {userInfo.profileImage ? (
                        <img src={userInfo.profileImage} alt="프로필" className="w-full h-full object-cover" />
                    ) : (
                        <span>{userInfo.nickname.charAt(0)}</span>
                    )}
                </div>
                
                <h2 className="text-lg md:text-xl font-bold text-black mb-3 md:mb-4">{userInfo.nickname}님</h2>
                
                <button 
                    onClick={() => navigate('/mypage_setting')}
                    className="w-full sm:w-auto bg-[#3D46AA] text-white px-4 md:px-6 py-2.5 md:py-2.5 rounded-lg font-bold text-sm hover:bg-opacity-90 transition-colors"
                >
                    계정 설정 및 패스워드 관리
                </button>
            </div>

            {/* 내가 쓴 글 목록 영역 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                
                {/* [왼쪽] 내가 쓴 대나무숲 */}
                <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-200 flex flex-col h-80 md:h-100">
                    <div className="flex justify-between items-center mb-4 md:mb-6 px-1">
                        <h3 className="text-lg md:text-xl font-bold text-[#1D2EE5]">내가 쓴 대나무숲</h3>
                        <span className="w-7 h-7 md:w-8 md:h-8 rounded-full border-2 border-gray-300 flex items-center justify-center font-bold text-gray-600 text-xs md:text-sm">
                            {isLoading ? '-' : forestPosts.length}
                        </span>
                    </div>

                    <div className="flex flex-col gap-2.5 md:gap-3 overflow-y-auto pr-2 pb-2 h-full custom-scrollbar">
                        {isLoading ? (
                            <p className="text-center text-sm md:text-base text-gray-400 mt-10">데이터를 불러오는 중입니다...</p>
                        ) : forestPosts.length === 0 ? (
                            <p className="text-center text-sm md:text-base text-gray-400 mt-10">작성한 대나무숲 글이 없습니다.</p>
                        ) : (
                            forestPosts.map((post) => (
                                <button 
                                    key={post.id}
                                    onClick={() => navigate(`/secret_forest/${post.id}`)}
                                    className="text-left w-full bg-white border border-gray-300 rounded-lg px-4 md:px-5 py-3 md:py-4 text-sm md:text-base font-bold text-gray-800 hover:bg-gray-50 transition-colors shrink-0 truncate"
                                >
                                    {post.title}
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* [오른쪽] 내가 쓴 비밀 일기 */}
                <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-200 flex flex-col h-80 md:h-100">
                    <div className="flex justify-between items-center mb-4 md:mb-6 px-1">
                        <h3 className="text-lg md:text-xl font-bold text-[#1D2EE5]">내가 쓴 비밀 일기</h3>
                        <span className="w-7 h-7 md:w-8 md:h-8 rounded-full border-2 border-gray-300 flex items-center justify-center font-bold text-gray-600 text-xs md:text-sm">
                            {isLoading ? '-' : secretNotes.length}
                        </span>
                    </div>

                    <div className="flex flex-col gap-2.5 md:gap-3 overflow-y-auto pr-2 pb-2 h-full custom-scrollbar">
                        {isLoading ? (
                            <p className="text-center text-sm md:text-base text-gray-400 mt-10">데이터를 불러오는 중입니다...</p>
                        ) : secretNotes.length === 0 ? (
                            <p className="text-center text-sm md:text-base text-gray-400 mt-10">작성한 일기가 없습니다.</p>
                        ) : (
                            secretNotes.map((note) => (
                                <button 
                                    key={note.id}
                                    onClick={() => navigate(`/secret_note?date=${note.date}`)}
                                    className="text-left w-full bg-white border border-gray-300 rounded-lg px-4 md:px-5 py-3 md:py-4 text-sm md:text-base font-bold text-gray-800 hover:bg-gray-50 transition-colors shrink-0 truncate"
                                >
                                    {formatNoteTitle(note.date)}
                                </button>
                            ))
                        )}
                    </div>
                </div>

            </div>

            {/* 🌟 수정됨: 예시 사진처럼 왼쪽 정렬, 검정색 굵은 글씨, 꺾쇠 아이콘 추가 */}
            <div className="flex justify-start mt-8 md:mt-10 pl-2 md:pl-4">
                <button 
                    onClick={handleDeleteAccount}
                    className="flex items-center gap-1 text-black font-bold text-base md:text-lg hover:text-red-500 transition-colors group"
                >
                    회원탈퇴
                    {/* 꺾쇠 아이콘 (>) */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform transition-transform group-hover:translate-x-1 text-gray-400 group-hover:text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>

        </div>
    );
};

export default Mypage;