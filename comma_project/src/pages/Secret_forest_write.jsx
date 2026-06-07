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
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const SecretForestWrite = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);

  const tags = ['#인간관계', '#학업스트레스', '#면접', '#취업', '#기타'];
  const bannedWords = [
    '자살',
    '죽고 싶다',
    '죽고싶다',
    '죽을래',
    '죽을래요',
    '죽을 것 같다',
    '죽을 것 같아',
    '죽을 것 같아요',
    '씨발',
    '시발',
    '개새끼',
    '미친놈',
    '병신',
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        alert('로그인이 필요한 서비스입니다. 따뜻한 이야기를 나누기 위해 로그인을 해주세요!');
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleTagClick = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 모두 입력해 주세요.');
      return;
    }

    const hasBannedWord = bannedWords.some(
      (word) => title.includes(word) || content.includes(word)
    );

    if (hasBannedWord) {
      alert('따뜻한 공간을 위해 정돈된 언어를 사용해 주세요.');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      alert('로그인이 필요한 서비스입니다.');
      navigate('/login');
      return;
    }

    try {
      await addDoc(collection(db, 'secret_forest_list'), {
        uid: user.uid,
        author: user.displayName || '익명',
        title: title,
        content: content,
        tag: selectedTags.length > 0 ? selectedTags[0] : '#기타',
        tags: selectedTags.length > 0 ? selectedTags : ['#기타'],
        createdAt: serverTimestamp(),
        reportCount: 0,
      });

      alert('글이 성공적으로 등록되었습니다.');
      navigate('/secret_forest');
    } catch (error) {
      console.error('글쓰기 실패:', error);
      alert('글을 등록하는 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pt-6 pb-8 sm:px-6 sm:pt-10 sm:pb-12">
      <div className="w-full">
        <div className="text-left mb-5 sm:mb-8 px-1">
          <h1 className="text-2xl sm:text-4xl font-bold text-[#1D2EE5] mb-1 sm:mb-2">
            마음 털어놓기
          </h1>
          <p className="text-sm sm:text-lg text-gray-500 break-keep">
            하고 싶은 말을 마음껏 대나무숲에서 펼쳐주세요.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-8 md:p-10 shadow-sm border border-gray-200 flex flex-col gap-3 sm:gap-5 w-full">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="이야기의 제목을 입력하세요"
            className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-base sm:text-lg placeholder:text-gray-400 focus:outline-none focus:border-[#3D46AA] focus:ring-1 focus:ring-[#3D46AA]"
          />

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="편안하게 이야기를 남겨보세요."
            className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3.5 text-base sm:text-lg leading-7 sm:leading-8 placeholder:text-gray-400 focus:outline-none focus:border-[#3D46AA] focus:ring-1 focus:ring-[#3D46AA] h-44 sm:h-64 resize-none"
          />

          <div className="w-full bg-white border border-gray-300 rounded-xl px-4 py-4 flex flex-col gap-3">
            <span className="text-gray-600 font-medium text-sm sm:text-base">
              태그 선택하기
            </span>

            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagClick(tag)}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-bold text-sm sm:text-base transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-[#3D46AA] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-5 sm:mt-6">
          <button
            onClick={() => navigate('/secret_forest')}
            className="w-full sm:w-1/3 py-3 sm:py-4 px-4 rounded-xl shadow-sm text-base sm:text-lg font-bold text-gray-600 bg-gray-200 hover:bg-gray-300 focus:outline-none transition-all"
          >
            뒤로 가기
          </button>

          <button
            onClick={handleSubmit}
            className="w-full sm:w-2/3 py-3 sm:py-4 px-4 rounded-xl shadow-sm text-base sm:text-lg font-bold text-white bg-[#3D46AA] hover:bg-opacity-90 focus:outline-none transition-all"
          >
            등록 완료하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecretForestWrite;