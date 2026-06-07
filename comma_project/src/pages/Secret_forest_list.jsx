//익명 대나무숲의 글의 목록을 볼 수 있는 페이지입니다.
//'익명 대나무숲 //  서로 위로받고 서로의 온기를 나누는 대나무숲입니다.' 라는 문구가 Header.jsx 아래에 위치해 있습니다. 이 문구는 '익명 대나무숲'은 크고 굵은 파란색으로, '서로 위로받고 서로의 온기를 나누는 대나무숲입니다.'는 회색 글씨로('익명 대나무숲' 단어보다 작게) 디자인되어 있습니다.
//글의 목록은 최신 글이 가장 위에 오도록 배치되어 있습니다. 각 글은 제목과 하나의 태그로 구성되어있습니다. 글의 제목은 크고 굵은 글씨로, 태그는 회색 박스에 검정색 글씨의 '# 태그명'로 디자인되어 있습니다.
//글의 제목을 클릭하면 해당 글의 상세 페이지로 이동할 수 있도록 설정되어 있습니다.
//작성한 글이 뜨지만 먼저 임의로 '팀플 발표 당일 잠수 조원 대처법' #학업스트레스, '과제 나만 힘들어?' #학업스트레스, '면접 이게 맞아..?' #면접, '15년지기 절친과 거리가 멀어졌어요...' #인간관계, '그냥 힘들어요 저에게 용기를 주세여' #기타 글이 적혀있습니다.
//이 글은 임의로 설정한 것이고 게시글이 생성되면 게시글이 최신 글이 가장 위에 오도록 배치됩니다.
//글 목록은 한 페이지당 15개씩 보여주고 그 이상이 되면 다음 페이지로 넘어갈 수 있도록 1,2,3... 페이지네이션이 존재합니다.
//목록 아래에는 '글작성하기' 버튼이 존재하며 이 버튼을 누르면 글 작성 페이지(Secret_forest_write)로 이동할 수 있도록 설정되어 있습니다.
//글 작성 버튼은 '#3D46AA' 배경에 흰색 글씨로 '글작성하기'라고 쓰여있으며, 둥근 모서리를 가지고 있습니다.
//모든 디자인은 tailwindcss를 사용하여 구현됩니다.
//Secret_forest_write 페이지에서 작성한 글은 브라우저의 localStorage에 'forestPosts'라는 이름으로 저장되어 Secret_forest_list 페이지에서 볼 수 있도록 구현됩니다. (글 작성 페이지는 Secret_forest_write.jsx 파일로 만들어주세요.)
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// 🌟 Firebase 도구 불러오기
import { db } from '../firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';

const SecretForestList = () => {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const q = query(collection(db, "secret_forest_list"), orderBy("createdAt", "desc"));
                const querySnapshot = await getDocs(q);
                
                const fetchedPosts = querySnapshot.docs.map(doc => ({
                    id: doc.id, 
                    ...doc.data()
                }));

                if (fetchedPosts.length === 0) {
                    setPosts([
                        { id: '1', title: '그냥 힘들어요 저에게 용기를 주세여', tag: '#기타' },
                        { id: '2', title: '15년지기 절친과 거리가 멀어졌어요...', tag: '#인간관계' },
                        { id: '3', title: '면접 이게 맞아..?', tag: '#면접' },
                        { id: '4', title: '과제 나만 힘들어?', tag: '#학업스트레스' },
                        { id: '5', title: '팀플 발표 당일 잠수 조원 대처법', tag: '#학업스트레스' },
                    ]);
                } else {
                    setPosts(fetchedPosts);
                }
            } catch (error) {
                console.error("게시글 불러오기 실패:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPosts();
    }, []);

    return (
        // 🌟 전체 상하 여백 모바일에 맞게 조절
        <div className="w-full max-w-7xl mx-auto pt-10 md:pt-16 pb-12 px-4 md:px-6">
            
            <div className="text-left mb-6 md:mb-10 px-1">
                <h1 className="text-3xl md:text-4xl font-bold text-[#1D2EE5] mb-2">익명 대나무숲</h1>
                <p className="text-gray-500 text-sm md:text-lg">서로 위로받고 서로의 온기를 나누는 대나무숲입니다.</p>
            </div>

            {/* 🌟 목록 사이의 간격 조절 */}
            <div className="flex flex-col gap-2.5 md:gap-3">
                {isLoading ? (
                    <div className="py-10 text-center font-bold text-gray-500 text-sm md:text-base">대나무숲의 이야기를 불러오는 중입니다...</div>
                ) : (
                    posts.map((post) => (
                        <Link 
                            key={post.id} 
                            to={`/secret_forest/${post.id}`} 
                            // 🌟 박스 안쪽 여백 다이어트 (p-4)
                            className="flex items-center justify-between p-4 md:p-5 bg-white border border-gray-300 rounded-xl shadow-sm hover:bg-gray-50 hover:border-[#3D46AA] transition-all cursor-pointer"
                        >
                            {/* 🌟 핵심 해결 포인트: flex-1과 min-w-0을 주어 제목이 길어져도 레이아웃을 부수지 않게 함 */}
                            <div className="flex-1 min-w-0 mr-3 md:mr-4">
                                <span className="block text-base md:text-xl font-bold text-gray-900 truncate">
                                    {post.title}
                                </span>
                            </div>

                            {/* 🌟 태그 크기 다이어트 및 shrink-0 (절대 찌그러지지 않게 고정) */}
                            <span className="shrink-0 px-3 py-1.5 md:px-4 md:py-1.5 bg-gray-200 text-gray-700 rounded-full text-xs md:text-sm font-bold whitespace-nowrap">
                                {post.tag}
                            </span>
                        </Link>
                    ))
                )}
            </div>

            {/* 하단 글 작성 버튼 다이어트 */}
            {/* 기존의 px-8 py-3.5에서 px-6 py-2.5로 줄이고, 폰트도 조금 축소 */}
            <div className="mt-8 flex justify-start pl-1">
                <Link 
                    to="/secret_forest_write" 
                    className="bg-[#3D46AA] text-white px-5 md:px-6 py-2.5 md:py-3 rounded-lg font-bold text-sm md:text-base hover:bg-opacity-90 transition-all shadow-sm"
                >
                    글 작성하기
                </Link>
            </div>

            {/* 하단 페이지네이션 다이어트 */}
            <div className="mt-10 flex justify-center items-center gap-1.5 md:gap-2">
                <button className="w-8 h-8 md:w-10 md:h-10 rounded-full font-bold bg-[#1D2EE5] text-white text-sm md:text-base">1</button>
                <button className="w-8 h-8 md:w-10 md:h-10 rounded-full font-bold text-gray-500 hover:bg-gray-100 text-sm md:text-base">2</button>
                <button className="w-8 h-8 md:w-10 md:h-10 rounded-full font-bold text-gray-500 hover:bg-gray-100 text-sm md:text-base">3</button>
            </div>

        </div>
    );
};

export default SecretForestList;