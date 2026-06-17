/**
 * SecretForestWrite.jsx
 *
 * 익명 대나무숲에 새 글을 작성하는 페이지입니다.
 * 사용자는 제목, 내용, 해시태그를 입력한 뒤 Firestore에 게시글을 등록할 수 있습니다.
 *
 * - Firebase Auth: 로그인 여부 확인
 * - Firestore: secret_forest_list 컬렉션에 게시글 저장
 * - 금지어 필터링: 부적절한 표현이 포함된 글 등록 제한
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

const TAG_OPTIONS = ['#인간관계', '#학업', '#면접', '#취업', '#기타'];

const BANNED_WORDS = [
  '자살', '죽고 싶다', '죽고싶다', '죽을래', '죽을래요', '죽을 것 같다', '죽을 것 같아', '죽을 것 같아요', '씨발', '시발', '개새끼', '미친놈', '병신',];

const normalizeTextForFilter = (text) =>
  String(text ?? '')
    .replace(/\s+/g, '')
    .toLowerCase();

const hasBannedWord = (...texts) => {
  const normalizedTexts = texts.map(normalizeTextForFilter);

  return BANNED_WORDS.some((word) => {
    const normalizedWord = normalizeTextForFilter(word);

    return normalizedTexts.some((text) => text.includes(normalizedWord));
  });
};

const SecretForestWrite = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 로그인하지 않은 사용자는 글 작성 페이지에 접근하지 못하도록 처리한다.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        alert(
          '로그인이 필요한 서비스입니다. 따뜻한 이야기를 나누기 위해 로그인을 해주세요!'
        );
        navigate('/login', { replace: true });
      }
    });

    return unsubscribe;
  }, [navigate]);

  const handleTagClick = (tag) => {
    setSelectedTags((prevTags) => {
      if (prevTags.includes(tag)) {
        return prevTags.filter((selectedTag) => selectedTag !== tag);
      }

      return [...prevTags, tag];
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) return;

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();
    const tagsToSave = selectedTags.length > 0 ? selectedTags : ['#기타'];
    const user = auth.currentUser;

    if (!trimmedTitle || !trimmedContent) {
      alert('제목과 내용을 모두 입력해 주세요.');
      return;
    }

    if (hasBannedWord(trimmedTitle, trimmedContent)) {
      alert('따뜻한 공간을 위해 정돈된 언어를 사용해 주세요.');
      return;
    }

    if (!user) {
      alert('로그인이 필요한 서비스입니다.');
      navigate('/login', { replace: true });
      return;
    }

    try {
      setIsSubmitting(true);

      await addDoc(collection(db, 'secret_forest_list'), {
        uid: user.uid,
        author: '익명',
        title: trimmedTitle,
        content: trimmedContent,
        tag: tagsToSave[0],
        tags: tagsToSave,
        createdAt: serverTimestamp(),
        reportCount: 0,
      });

      alert('글이 성공적으로 등록되었습니다.');
      navigate('/secret_forest');
    } catch (error) {
      console.error('글쓰기 실패:', error);
      alert('글을 등록하는 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="w-full max-w-4xl mx-auto px-4 pt-6 pb-8 sm:px-6 sm:pt-10 sm:pb-12">
      <section className="w-full">
        <div className="text-left mb-5 sm:mb-8 px-1">
          <h1 className="text-2xl sm:text-4xl font-bold text-[#1D2EE5] mb-1 sm:mb-2">
            마음 털어놓기
          </h1>
          <p className="text-sm sm:text-lg text-gray-500 break-keep">
            하고 싶은 말을 마음껏 대나무숲에서 펼쳐주세요.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl p-4 sm:p-8 md:p-10 shadow-sm border border-gray-200 flex flex-col gap-3 sm:gap-5 w-full">
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="이야기의 제목을 입력하세요"
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-base sm:text-lg placeholder:text-gray-400 focus:outline-none focus:border-[#3D46AA] focus:ring-1 focus:ring-[#3D46AA]"
            />

            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="위로받고 싶은 내용 혹은 아무에게도 말하지 못했던 이야기도 괜찮습니다. 편안하게 남겨보세요."
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3.5 text-base sm:text-lg leading-7 sm:leading-8 placeholder:text-gray-400 focus:outline-none focus:border-[#3D46AA] focus:ring-1 focus:ring-[#3D46AA] h-44 sm:h-64 resize-none"
            />

            <div className="w-full bg-white border border-gray-300 rounded-xl px-4 py-4 flex flex-col gap-3">
              <span className="text-gray-600 font-medium text-sm sm:text-base">
                태그 선택하기
              </span>

              <div className="flex flex-wrap gap-2">
                {TAG_OPTIONS.map((tag) => {
                  const isSelected = selectedTags.includes(tag);

                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagClick(tag)}
                      className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-bold text-sm sm:text-base transition-colors ${
                        isSelected
                          ? 'bg-[#3D46AA] text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-5 sm:mt-6">
            <button
              type="button"
              onClick={() => navigate('/secret_forest')}
              className="w-full sm:w-1/3 py-3 sm:py-4 px-4 rounded-xl shadow-sm text-base sm:text-lg font-bold text-gray-600 bg-gray-200 hover:bg-gray-300 focus:outline-none transition-all"
            >
              뒤로 가기
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-2/3 py-3 sm:py-4 px-4 rounded-xl shadow-sm text-base sm:text-lg font-bold text-white bg-[#3D46AA] hover:bg-[#3D46AA]/90 focus:outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '등록 중...' : '등록 완료하기'}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
};

export default SecretForestWrite;