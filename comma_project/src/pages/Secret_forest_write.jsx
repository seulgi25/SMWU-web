//Secret_forest_write 페이지는 글 작성 폼이 있는 페이지입니다.
//'마음 털어놓기 // 하고 싶은 말을 마음껏 대나무숲에서 펼쳐보세요.'라는 문구가 header.jsx 바로 아래에 위치합니다.
//'마음 털어놓기'는 파란색의 크고 굵은 글씨로, '하고 싶은 말을 마음껏 대나무숲에서 펼쳐보세요.'는 회색의 작은 글씨로 디자인되어 있습니다.
//글 작성 폼은 흰색의 둥근 모서리를 가진 박스 안에 위치하며, 제목 입력란, 내용 입력란, 해시태그 선택란으로 구성되어 있습니다.
//제목 입력란에는 글 제목을 입력할 수 있습니다. 제목 입력란의 placeholder는 '이야기의 제목을 입력하세요'입니다.
//내용 입력란에는 글 내용을 입력할 수 있습니다. 내용 입력란의 placeholder는 '위로받고 싶은 내용 혹은 아무에게도 말하지 못했던 이야기도 괜찮습니다. 편안하게 남겨보세요.'입니다.
//태그 선택란에는 태그를 선택할 수 있습니다. 태그는 복수선택이 가능하며 '#인간관계', '#학업스트레스', '#면접', '#취업', '#기타' 4가지가 존재합니다.
//흰색의 둥근 모서리를 가진 박스 아래에는 같은 폭을 가진 '등록 완료하기' 버튼이 존재합니다. 이 버튼을 누르면 글이 등록되고 Secret_forest_list 페이지로 이동합니다.
//'등록 완료하기' 버튼은 '#3D46AA' 배경에 흰색 글씨로 '등록 완료하기'라고 쓰여있으며, 둥근 모서리를 가지고 있습니다.
//글을 작성하고 등록 완료하기 버튼을 누를 때 금지어 필터링 시스템이 작동합니다.
//금지어는 '자살', '죽고 싶다', '죽고싶다', '죽을래', '죽을래요', '죽을 것 같다', '죽을 것 같아', '죽을 것 같아요'와 욕설(예시로 '씨발', '시발', '개새끼', '미친놈', '병신' 등이 있습니다.)입니다.
//금지어가 포함된 글은 등록되지 않고, '등록 완료하기' 버튼을 눌렀을 때 '따뜻한 공간을 위해 정돈된 언어를 사용해 주세요.'라는 안내 팝업이 뜹니다.
//금지어가 포함되지 않은 글은 정상적으로 등록되고 Secret_forest_list 페이지로 이동합니다.
//글 작성 폼과 등록 완료하기 버튼은 화면의 중앙에 위치하며, 반응형으로 디자인되어 있습니다.
//모든 디자인은 tailwindcss를 사용하여 구현됩니다.
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SecretForestWrite = () => {
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);

    const tags = ['#인간관계', '#학업스트레스', '#면접', '#취업', '#기타'];
    const bannedWords = [
        '자살', '죽고 싶다', '죽고싶다', '죽을래', '죽을래요', 
        '죽을 것 같다', '죽을 것 같아', '죽을 것 같아요', 
        '씨발', '시발', '개새끼', '미친놈', '병신'
    ];

    const handleTagClick = (tag) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag));
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    const handleSubmit = () => {
        if (!title.trim() || !content.trim()) {
            alert('제목과 내용을 모두 입력해 주세요.');
            return;
        }

        const hasBannedWord = bannedWords.some(word => 
            title.includes(word) || content.includes(word)
        );

        if (hasBannedWord) {
            alert('따뜻한 공간을 위해 정돈된 언어를 사용해 주세요.');
            return;
        }

        const existingPosts = JSON.parse(localStorage.getItem('forestPosts')) || [];
        
        const newPost = {
            id: Date.now(), 
            title: title,
            tag: selectedTags.length > 0 ? selectedTags[0] : '#기타', 
            content: content
        };

        const updatedPosts = [newPost, ...existingPosts];
        localStorage.setItem('forestPosts', JSON.stringify(updatedPosts));

        navigate('/secret_forest');
    };

    return (
        <div className="w-full max-w-5xl mx-auto pt-16 pb-12 px-4 flex flex-col items-center">
            
            <div className="w-full">
                {/* 상단 문구 영역 */}
                <div className="text-left mb-8 px-2">
                    <h1 className="text-4xl font-bold text-[#1D2EE5] mb-2">마음 털어놓기</h1>
                    <p className="text-gray-500 text-lg">하고 싶은 말을 마음껏 대나무숲에서 펼쳐주세요.</p>
                </div>

                {/* 입력 폼 전체를 감싸는 흰색 둥근 박스 */}
                <div className="bg-white rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 flex flex-col gap-5 w-full">
                    
                    {/* 1. 제목 입력란 */}
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="이야기의 제목을 입력하세요"
                        className="w-full bg-white border border-gray-400 rounded-lg px-5 py-4 text-lg focus:outline-none focus:border-[#3D46AA] focus:ring-1 focus:ring-[#3D46AA]"
                    />

                    {/* 2. 내용 입력란 */}
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="위로받고 싶은 내용 혹은 아무에게도 말하지 못했던 이야기도 괜찮습니다. 편안하게 남겨보세요."
                        className="w-full bg-white border border-gray-400 rounded-lg px-5 py-5 text-lg focus:outline-none focus:border-[#3D46AA] focus:ring-1 focus:ring-[#3D46AA] h-64 resize-none"
                    />

                    {/* 3. 태그 선택란 */}
                    <div className="w-full bg-white border border-gray-400 rounded-lg px-5 py-4 flex flex-col md:flex-row md:items-center gap-4">
                        <span className="text-gray-500 font-medium min-w-max">태그 선택하기</span>
                        <div className="flex flex-wrap gap-3">
                            {tags.map((tag) => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => handleTagClick(tag)}
                                    className={`px-4 py-2 rounded-md font-bold text-base transition-colors ${
                                        selectedTags.includes(tag)
                                            ? 'bg-[#3D46AA] text-white' 
                                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                    }`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>

                </div>

                {/* 🌟 수정된 부분: 뒤로 가기 & 등록 완료하기 버튼 그룹 */}
                <div className="flex gap-4 mt-6">
                    {/* 뒤로 가기 버튼 (-1을 넣어 이전 페이지로 돌아가게 하거나 주소를 직접 입력합니다) */}
                    <button
                        onClick={() => navigate('/secret_forest')}
                        className="w-1/3 py-4 px-4 rounded-xl shadow-sm text-lg md:text-xl font-bold text-gray-600 bg-gray-200 hover:bg-gray-300 focus:outline-none transition-all"
                    >
                        뒤로 가기
                    </button>
                    
                    {/* 등록 완료하기 버튼 */}
                    <button
                        onClick={handleSubmit}
                        className="w-2/3 py-4 px-4 rounded-xl shadow-sm text-lg md:text-xl font-bold text-white bg-[#3D46AA] hover:bg-opacity-90 focus:outline-none transition-all"
                    >
                        등록 완료하기
                    </button>
                </div>

            </div>
            
        </div>
    );
};

export default SecretForestWrite;