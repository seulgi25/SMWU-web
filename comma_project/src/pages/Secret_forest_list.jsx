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

const SecretForestList = () => {
    // 화면에 보여줄 게시글 목록을 관리하는 State
    const [posts, setPosts] = useState([]);

    // 화면이 처음 켜질 때 한 번만 실행되는 기능
    useEffect(() => {
        // 1. 브라우저의 임시 기억 장치(localStorage)에서 'forestPosts'라는 이름의 데이터를 가져옵니다.
        const savedPosts = JSON.parse(localStorage.getItem('forestPosts'));

        if (savedPosts && savedPosts.length > 0) {
            // 2. 만약 누군가 작성해서 저장해둔 글이 있다면, 그걸 화면에 띄웁니다.
            setPosts(savedPosts);
        } else {
            // 3. 아무것도 없다면(처음 접속했다면), 기본 샘플 글 5개를 띄우고 기억 장치에 저장합니다.
            // (최신 글이 위로 와야 하므로 id가 큰 것을 위로 배치했습니다.)
            const defaultPosts = [
                { id: 5, title: '그냥 힘들어요 저에게 용기를 주세여', tag: '#기타' },
                { id: 4, title: '15년지기 절친과 거리가 멀어졌어요...', tag: '#인간관계' },
                { id: 3, title: '면접 이게 맞아..?', tag: '#면접' },
                { id: 2, title: '과제 나만 힘들어?', tag: '#학업스트레스' },
                { id: 1, title: '팀플 발표 당일 잠수 조원 대처법', tag: '#학업스트레스' },
            ];
            setPosts(defaultPosts);
            localStorage.setItem('forestPosts', JSON.stringify(defaultPosts));
        }
    }, []);

    return (
        <div className="w-full max-w-7xl mx-auto pt-16 pb-12 px-4">
            
            {/* 상단 문구 영역 */}
            <div className="text-left mb-10">
                <h1 className="text-4xl font-bold text-[#1D2EE5] mb-2">익명 대나무숲</h1>
                <p className="text-gray-500 text-lg">서로 위로받고 서로의 온기를 나누는 대나무숲입니다.</p>
            </div>

            {/* 글 목록 영역 */}
            <div className="flex flex-col gap-3">
                {/* posts 배열에 있는 글들을 최신순(위에서부터)으로 화면에 그려줍니다. */}
                {posts.map((post) => (
                    <Link 
                        key={post.id} 
                        to={`/secret_forest/${post.id}`} 
                        className="flex items-center justify-between p-5 bg-white border border-gray-300 rounded-xl shadow-sm hover:bg-gray-50 hover:border-[#3D46AA] transition-all cursor-pointer"
                    >
                        <span className="text-lg md:text-xl font-bold text-gray-900">
                            {post.title}
                        </span>
                        <span className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded-full text-sm font-bold whitespace-nowrap">
                            {post.tag}
                        </span>
                    </Link>
                ))}
            </div>

            {/* 글 작성 버튼 */}
            <div className="mt-8 flex justify-start">
                {/* [수정됨] Secret_forest_write 페이지로 이동하도록 경로를 맞췄습니다. */}
                <Link 
                    to="/secret_forest_write" 
                    className="bg-[#3D46AA] text-white px-8 py-3.5 rounded-xl font-bold text-lg hover:bg-opacity-90 transition-all shadow-sm"
                >
                    글 작성하기
                </Link>
            </div>

            {/* 페이지네이션 */}
            <div className="mt-10 flex justify-center items-center gap-2">
                <button className="w-10 h-10 rounded-full font-bold bg-[#1D2EE5] text-white">1</button>
                <button className="w-10 h-10 rounded-full font-bold text-gray-500 hover:bg-gray-100">2</button>
                <button className="w-10 h-10 rounded-full font-bold text-gray-500 hover:bg-gray-100">3</button>
            </div>

        </div>
    );
};

export default SecretForestList;