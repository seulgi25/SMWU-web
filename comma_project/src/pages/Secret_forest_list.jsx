/**
 * SecretForestList.jsx
 *
 * 익명 대나무숲 게시글 목록 페이지임.
 * Firestore의 secret_forest_list 컬렉션에서 게시글을 최신순으로 불러오고,
 * 한 페이지당 15개씩 나누어 보여줌.
 *
 * - 게시글 클릭: 해당 게시글 상세 페이지로 이동함.
 * - 글 작성하기: 게시글 작성 페이지로 이동함.
 * - 게시글이 없을 경우: 빈 목록 안내 문구 표시함.
 * - 페이지네이션: 전체 게시글을 15개 단위로 나누어 표시함.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';

// 한 페이지에 표시할 게시글 개수 기준값 생성.
const POSTS_PER_PAGE = 15;

// 기존 DB에 저장된 태그명을 현재 화면 표시용 태그명으로 통일하기 위한 매핑값 생성.
const TAG_NAME_MAP = {
  '#학업스트레스': '#학업',
};

// 로딩, 오류, 빈 목록 안내 문구에 공통으로 사용할 클래스 생성.
const STATUS_CARD_CLASS =
  'py-10 text-center font-bold text-gray-500 text-sm md:text-base';

// 게시글 데이터에서 태그 정보를 가져와 화면에 표시할 형식으로 변환함.
const formatTag = (post) => {
  const rawTag = post.tag || post.tags?.[0] || '#기타';
  const trimmedTag = String(rawTag).trim();

  if (!trimmedTag) return '#기타';

  const formattedTag = trimmedTag.startsWith('#')
    ? trimmedTag
    : `#${trimmedTag}`;

  // 기존 DB에 저장된 '#학업스트레스', '#학업 스트레스'를 화면에서는 '#학업'으로 통일함.
  const normalizedTag = formattedTag.replace(/\s+/g, '');

  return TAG_NAME_MAP[normalizedTag] || formattedTag;
};

// 익명 대나무숲 게시글 목록 페이지 컴포넌트 생성.
const SecretForestList = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // 전체 게시글 수를 기준으로 필요한 전체 페이지 수를 계산함.
  const totalPageCount = Math.ceil(posts.length / POSTS_PER_PAGE);

  // 현재 페이지 번호에 맞는 게시글 목록만 잘라서 계산함.
  const currentPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
    const endIndex = startIndex + POSTS_PER_PAGE;

    return posts.slice(startIndex, endIndex);
  }, [posts, currentPage]);

  // Firestore 게시글 목록을 최신순으로 실시간 구독함.
  useEffect(() => {
    const postsQuery = query(
      collection(db, 'secret_forest_list'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      postsQuery,
      (querySnapshot) => {
        const fetchedPosts = querySnapshot.docs.map((postDoc) => ({
          id: postDoc.id,
          ...postDoc.data(),
        }));

        setPosts(fetchedPosts);
        setErrorMessage('');
        setIsLoading(false);
        setCurrentPage(1);
      },
      (error) => {
        console.error('게시글 불러오기 실패:', error);
        setErrorMessage('게시글을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  // 게시글 수가 줄어 현재 페이지가 사라지는 경우 마지막 페이지로 이동함.
  useEffect(() => {
    if (totalPageCount > 0 && currentPage > totalPageCount) {
      setCurrentPage(totalPageCount);
    }
  }, [currentPage, totalPageCount]);

  // 게시글 하나를 카드 형태의 링크로 렌더링함.
  const renderPostCard = (post) => {
    const tag = formatTag(post);

    return (
      <Link
        key={post.id}
        to={`/secret_forest/${post.id}`}
        className="flex items-center justify-between p-4 md:p-5 bg-white border border-gray-300 rounded-xl shadow-sm hover:bg-gray-50 hover:border-[#3D46AA] transition-all cursor-pointer no-underline"
      >
        <div className="flex-1 min-w-0 mr-3 md:mr-4">
          <span className="block text-base md:text-xl font-bold text-gray-900 truncate">
            {post.title}
          </span>
        </div>

        <span className="shrink-0 px-3 py-1.5 md:px-4 md:py-1.5 bg-gray-200 text-gray-700 rounded-full text-xs md:text-sm font-bold whitespace-nowrap">
          {tag}
        </span>
      </Link>
    );
  };

  // 로딩, 오류, 빈 목록, 게시글 목록 상태에 따라 화면에 표시할 내용을 분기함.
  const renderPostList = () => {
    if (isLoading) {
      return (
        <div className={STATUS_CARD_CLASS}>
          대나무숲의 이야기를 불러오는 중입니다...
        </div>
      );
    }

    if (errorMessage) {
      return <div className={STATUS_CARD_CLASS}>{errorMessage}</div>;
    }

    if (posts.length === 0) {
      return (
        <div className={STATUS_CARD_CLASS}>
          아직 작성된 글이 없습니다. 첫 이야기를 남겨주세요.
        </div>
      );
    }

    return currentPosts.map((post) => renderPostCard(post));
  };

  // 익명 대나무숲 목록 페이지 전체 UI를 렌더링함.
  return (
    <main className="w-full max-w-7xl mx-auto pt-10 md:pt-16 pb-12 px-4 md:px-6">
      <section className="text-left mb-6 md:mb-10 px-1">
        <h1 className="text-3xl md:text-4xl font-bold text-[#1D2EE5] mb-2">
          익명 대나무숲
        </h1>
        <p className="text-gray-500 text-sm md:text-lg">
          서로 위로받고 서로의 온기를 나누는 대나무숲입니다.
        </p>
      </section>

      <section
        className="flex flex-col gap-2.5 md:gap-3"
        aria-label="익명 대나무숲 게시글 목록"
      >
        {renderPostList()}
      </section>

      <div className="mt-8 flex justify-start pl-1">
        <Link
          to="/secret_forest_write"
          className="bg-[#3D46AA] text-white px-5 md:px-6 py-2.5 md:py-3 rounded-lg font-bold text-sm md:text-base hover:bg-opacity-90 transition-all shadow-sm no-underline"
        >
          글 작성하기
        </Link>
      </div>

      {totalPageCount > 1 && (
        <nav
          className="mt-10 flex justify-center items-center gap-1.5 md:gap-2"
          aria-label="게시글 페이지네이션"
        >
          {Array.from({ length: totalPageCount }, (_, index) => {
            const pageNumber = index + 1;
            const isCurrentPage = currentPage === pageNumber;

            return (
              <button
                key={pageNumber}
                type="button"
                onClick={() => setCurrentPage(pageNumber)}
                aria-current={isCurrentPage ? 'page' : undefined}
                className={`w-8 h-8 md:w-10 md:h-10 rounded-full font-bold text-sm md:text-base ${
                  isCurrentPage
                    ? 'bg-[#1D2EE5] text-white'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {pageNumber}
              </button>
            );
          })}
        </nav>
      )}
    </main>
  );
};

export default SecretForestList;