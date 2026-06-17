/**
 * SecretForestDetails.jsx
 *
 * 익명 대나무숲 게시글의 상세 페이지입니다.
 * 게시글 본문 조회, 수정, 삭제, 신고, 안아주기, 댓글/답글 작성,
 * 댓글 음악 추천 기능을 담당합니다.
 *
 * - 게시글/댓글 데이터: Firestore에서 실시간 구독
 * - 안아주기: 따뜻한 배경 효과 + 최초 1회 알림 생성
 * - 댓글: 일반 댓글, 답글, 수정, 삭제, 음악 첨부 지원
 * - 신고: 누적 신고 5회 이상일 경우 블라인드 처리
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { auth, db } from '../firebase';

const POST_COLLECTION = 'secret_forest_list';
const ALARM_COLLECTION = 'alarms';
const WARM_EFFECT_DURATION = 3000;

const TAG_OPTIONS = ['#인간관계', '#학업', '#면접', '#취업', '#기타'];

const TAG_NAME_MAP = {
  '#학업스트레스': '#학업',
};

const BANNED_WORDS = [
  '자살', '죽고 싶다', '죽고싶다', '죽을래', '죽을래요', '죽을 것 같다', '죽을 것 같아', '죽을 것 같아요', '씨발', '시발', '개새끼', '미친놈', '병신',
];

const getPostRef = (postId) => doc(db, POST_COLLECTION, postId);

const getCommentsRef = (postId) =>
  collection(db, POST_COLLECTION, postId, 'comments');

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

const formatTag = (tag) => {
  const trimmedTag = String(tag ?? '').trim();

  if (!trimmedTag) return '#기타';

  const formattedTag = trimmedTag.startsWith('#')
    ? trimmedTag
    : `#${trimmedTag}`;

  const normalizedTag = formattedTag.replace(/\s+/g, '');

  return TAG_NAME_MAP[normalizedTag] || formattedTag;
};

const getYoutubeSearchUrl = (title, artist) => {
  const searchKeyword = `${artist} ${title}`;

  return `https://www.youtube.com/results?search_query=${encodeURIComponent(
    searchKeyword
  )}`;
};

const SecretForestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const warmTimerRef = useRef(null);

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isPostLoading, setIsPostLoading] = useState(true);

  const [isWarm, setIsWarm] = useState(false);
  const [newComment, setNewComment] = useState('');

  const [isMusicPopupOpen, setIsMusicPopupOpen] = useState(false);
  const [musicInput, setMusicInput] = useState({ title: '', artist: '' });
  const [selectedMusic, setSelectedMusic] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editTag, setEditTag] = useState('');

  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');

  const [replyingToId, setReplyingToId] = useState(null);
  const [replyText, setReplyText] = useState('');

  const isBlinded = (post?.reportCount || 0) >= 5;
  const isPostAuthor = currentUser && post?.uid === currentUser.uid;
  const postTag = formatTag(post?.tag || post?.tags?.[0] || '#기타');

  const mainComments = useMemo(
    () => comments.filter((comment) => !comment.parentId),
    [comments]
  );

  const repliesByParentId = useMemo(() => {
    return comments.reduce((acc, comment) => {
      if (!comment.parentId) return acc;

      if (!acc[comment.parentId]) {
        acc[comment.parentId] = [];
      }

      acc[comment.parentId].push(comment);
      return acc;
    }, {});
  }, [comments]);

  // 로그인 상태를 확인하고, 비로그인 사용자는 로그인 페이지로 이동시킨다.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);

      if (!user) {
        alert(
          '로그인이 필요한 서비스입니다. 따뜻한 이야기를 보기 위해 로그인을 해주세요!'
        );
        navigate('/login', { replace: true });
      }
    });

    return unsubscribe;
  }, [navigate]);

  // 현재 게시글을 Firestore에서 실시간으로 구독한다.
  useEffect(() => {
    if (!id) return undefined;

    setIsPostLoading(true);

    const unsubscribe = onSnapshot(
      getPostRef(id),
      (docSnap) => {
        if (!docSnap.exists()) {
          alert('존재하지 않거나 삭제된 글입니다.');
          navigate('/secret_forest', { replace: true });
          return;
        }

        setPost({
          id: docSnap.id,
          ...docSnap.data(),
        });
        setIsPostLoading(false);
      },
      (error) => {
        console.error('게시글 불러오기 실패:', error);
        setIsPostLoading(false);
      }
    );

    return unsubscribe;
  }, [id, navigate]);

  // 댓글과 답글 목록을 작성 시간순으로 실시간 구독한다.
  useEffect(() => {
    if (!id) return undefined;

    const commentsQuery = query(
      getCommentsRef(id),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(
      commentsQuery,
      (querySnapshot) => {
        const fetchedComments = querySnapshot.docs.map((commentDoc) => ({
          id: commentDoc.id,
          ...commentDoc.data(),
        }));

        setComments(fetchedComments);
      },
      (error) => {
        console.error('댓글 불러오기 실패:', error);
      }
    );

    return unsubscribe;
  }, [id]);

  // 안아주기 배경 효과가 끝나기 전에 컴포넌트가 사라질 경우 타이머를 정리한다.
  useEffect(() => {
    return () => {
      if (warmTimerRef.current) {
        clearTimeout(warmTimerRef.current);
      }
    };
  }, []);

  const playWarmEffect = useCallback(() => {
    if (warmTimerRef.current) {
      clearTimeout(warmTimerRef.current);
    }

    setIsWarm(true);

    warmTimerRef.current = setTimeout(() => {
      setIsWarm(false);
    }, WARM_EFFECT_DURATION);
  }, []);

  const resetCommentEditState = () => {
    setEditingCommentId(null);
    setEditCommentText('');
  };

  const updateMusicInput = (field, value) => {
    setMusicInput((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      '정말 삭제하시겠습니까? 복구할 수 없습니다.'
    );

    if (!confirmDelete) return;

    try {
      const batch = writeBatch(db);
      const commentsSnapshot = await getDocs(getCommentsRef(id));

      commentsSnapshot.docs.forEach((commentDoc) => {
        batch.delete(commentDoc.ref);
      });

      batch.delete(getPostRef(id));

      await batch.commit();

      alert('삭제되었습니다.');
      navigate('/secret_forest');
    } catch (error) {
      console.error('글 삭제 실패:', error);
      alert('글 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleEditStart = () => {
    if (!post) return;

    setEditTitle(post.title || '');
    setEditContent(post.content || '');
    setEditTag(postTag);
    setIsEditing(true);
  };

  const handleEditSave = async () => {
    const trimmedTitle = editTitle.trim();
    const trimmedContent = editContent.trim();

    if (!trimmedTitle || !trimmedContent) {
      alert('제목과 내용을 모두 입력해 주세요.');
      return;
    }

    if (!editTag) {
      alert('태그를 선택해 주세요.');
      return;
    }

    if (hasBannedWord(trimmedTitle, trimmedContent)) {
      alert('따뜻한 공간을 위해 정돈된 언어를 사용해 주세요.');
      return;
    }

    try {
      await updateDoc(getPostRef(id), {
        title: trimmedTitle,
        content: trimmedContent,
        tag: editTag,
        tags: [editTag],
        updatedAt: serverTimestamp(),
      });

      setIsEditing(false);
      alert('수정되었습니다.');
    } catch (error) {
      console.error('글 수정 실패:', error);
      alert('글 수정 중 오류가 발생했습니다.');
    }
  };

  const createCommentAlarm = async (receiverUid) => {
    await addDoc(collection(db, ALARM_COLLECTION), {
      uid: receiverUid,
      type: 'comment',
      message: '다른 사용자의 온기가 닿았습니다! 댓글을 확인하세요.',
      postId: id,
      createdAt: serverTimestamp(),
      isRead: false,
    });
  };

  const handleAddComment = async () => {
    const commentText = newComment.trim();
    const user = auth.currentUser;

    if (!commentText) return;

    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (hasBannedWord(commentText)) {
      alert('따뜻한 공간을 위해 정돈된 언어를 사용해 주세요.');
      return;
    }

    try {
      const newCommentData = {
        uid: user.uid,
        author: '익명',
        text: commentText,
        parentId: null,
        ...(selectedMusic && { music: selectedMusic }),
        createdAt: serverTimestamp(),
      };

      await addDoc(getCommentsRef(id), newCommentData);

      setNewComment('');
      setSelectedMusic(null);

      // 글쓴이가 아닌 사용자가 댓글을 남긴 경우 글쓴이에게 알림을 보낸다.
      if (post?.uid && post.uid !== user.uid) {
        await createCommentAlarm(post.uid);
      }
    } catch (error) {
      console.error('댓글 등록 실패:', error);
      alert('댓글 등록에 실패했습니다.');
    }
  };

  const handleAddReply = async (parentId) => {
    const replyContent = replyText.trim();
    const user = auth.currentUser;

    if (!replyContent) return;

    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (hasBannedWord(replyContent)) {
      alert('따뜻한 공간을 위해 정돈된 언어를 사용해 주세요.');
      return;
    }

    try {
      await addDoc(getCommentsRef(id), {
        uid: user.uid,
        author: '익명',
        text: replyContent,
        parentId,
        createdAt: serverTimestamp(),
      });

      setReplyingToId(null);
      setReplyText('');
    } catch (error) {
      console.error('답글 등록 실패:', error);
      alert('답글 등록에 실패했습니다.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    const confirmDelete = window.confirm('정말 삭제하시겠습니까?');

    if (!confirmDelete) return;

    try {
      const batch = writeBatch(db);
      const commentsRef = getCommentsRef(id);

      const repliesQuery = query(
        commentsRef,
        where('parentId', '==', commentId)
      );
      const repliesSnapshot = await getDocs(repliesQuery);

      repliesSnapshot.docs.forEach((replyDoc) => {
        batch.delete(replyDoc.ref);
      });

      batch.delete(doc(db, POST_COLLECTION, id, 'comments', commentId));

      await batch.commit();

      if (replyingToId === commentId) {
        setReplyingToId(null);
        setReplyText('');
      }

      resetCommentEditState();
    } catch (error) {
      console.error('댓글 삭제 실패:', error);
      alert('댓글 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleEditCommentStart = (comment) => {
    setEditingCommentId(comment.id);
    setEditCommentText(comment.text || '');
  };

  const handleEditCommentSave = async (commentId) => {
    const trimmedText = editCommentText.trim();

    if (!trimmedText) {
      alert('내용을 입력해 주세요.');
      return;
    }

    if (hasBannedWord(trimmedText)) {
      alert('따뜻한 공간을 위해 정돈된 언어를 사용해 주세요.');
      return;
    }

    try {
      await updateDoc(doc(db, POST_COLLECTION, id, 'comments', commentId), {
        text: trimmedText,
        updatedAt: serverTimestamp(),
      });

      resetCommentEditState();
    } catch (error) {
      console.error('댓글 수정 실패:', error);
      alert('댓글 수정 중 오류가 발생했습니다.');
    }
  };

  const handleReport = async () => {
    if (!post || isPostAuthor) return;

    const confirmReport = window.confirm('정말 신고하겠습니까?');

    if (!confirmReport) return;

    try {
      const newReportCount = (post.reportCount || 0) + 1;

      await updateDoc(getPostRef(id), {
        reportCount: newReportCount,
      });

      if (newReportCount >= 5) {
        alert('누적 신고 5회가 되어 해당 게시글이 블라인드 처리되었습니다.');
      } else {
        alert(`신고가 접수되었습니다. (현재 누적 신고: ${newReportCount}회)`);
      }
    } catch (error) {
      console.error('신고 처리 실패:', error);
      alert('신고 처리 중 오류가 발생했습니다.');
    }
  };

  const createFirstHugAlarm = async (receiverUid) => {
    const alarmsRef = collection(db, ALARM_COLLECTION);
    const existingHugAlarmQuery = query(
      alarmsRef,
      where('uid', '==', receiverUid),
      where('postId', '==', id),
      where('type', '==', 'hug')
    );

    const querySnapshot = await getDocs(existingHugAlarmQuery);

    if (!querySnapshot.empty) return;

    await addDoc(alarmsRef, {
      uid: receiverUid,
      type: 'hug',
      message:
        '다른 사용자의 온기가 닿았습니다! 누군가 당신의 글에 [안아주기]를 선물했습니다.',
      postId: id,
      createdAt: serverTimestamp(),
      isRead: false,
    });
  };

  const handleWarmHug = async () => {
    const user = auth.currentUser;

    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (!post) return;

    playWarmEffect();

    // 본인이 아닌 사용자가 누른 경우에만 글쓴이에게 최초 1회 안아주기 알림을 보낸다.
    if (post.uid && post.uid !== user.uid) {
      try {
        await createFirstHugAlarm(post.uid);
      } catch (error) {
        console.error('안아주기 알림 전송 실패:', error);
      }
    }
  };

  const handleMusicSubmit = () => {
    const trimmedTitle = musicInput.title.trim();
    const trimmedArtist = musicInput.artist.trim();

    if (!trimmedTitle || !trimmedArtist) {
      alert('노래 제목과 가수를 모두 입력해주세요.');
      return;
    }

    setSelectedMusic({
      title: trimmedTitle,
      artist: trimmedArtist,
    });
    setIsMusicPopupOpen(false);
    setMusicInput({ title: '', artist: '' });
  };

  const handlePlayMusic = (title, artist) => {
    window.open(
      getYoutubeSearchUrl(title, artist),
      '_blank',
      'noopener,noreferrer'
    );
  };

  if (isPostLoading || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg font-bold">
        글을 불러오는 중입니다...
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-1000 ${
        isWarm ? 'bg-[#FADCD9]' : 'bg-[#F8F7EC]'
      }`}
    >
      <main className="w-full max-w-5xl mx-auto pt-6 md:pt-10 pb-20 px-4 sm:px-6 relative">
        <button
          type="button"
          onClick={() => navigate('/secret_forest')}
          className="flex items-center gap-2 bg-[#3D46AA] text-white px-4 md:px-5 py-2 md:py-2.5 rounded-lg font-bold text-base md:text-lg mb-4 md:mb-6 hover:bg-[#3D46AA]/90"
        >
          &larr; 목록으로
        </button>

        <section className="bg-white rounded-2xl p-5 md:p-8 shadow-sm mb-6 border border-gray-100 relative">
          {!isBlinded && !isPostAuthor && (
            <button
              type="button"
              onClick={handleReport}
              className="absolute top-4 right-4 md:top-6 md:right-8 text-gray-400 hover:text-red-500 text-xs md:text-sm font-bold transition-colors"
            >
              🚨 신고하기
            </button>
          )}

          {isBlinded ? (
            <div className="py-16 flex flex-col items-center justify-center text-center">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
                블라인드 처리된 게시물입니다
              </h2>
              <p className="text-sm md:text-base text-gray-500">
                누적 신고 5회 이상이 접수되어 숨김 처리되었습니다
              </p>
            </div>
          ) : isEditing ? (
            <div className="flex flex-col gap-4 mt-4">
              <input
                type="text"
                value={editTitle}
                onChange={(event) => setEditTitle(event.target.value)}
                className="w-full border border-gray-400 rounded-lg px-4 py-3 text-base md:text-lg font-bold focus:outline-none focus:border-[#3D46AA]"
              />

              <textarea
                value={editContent}
                onChange={(event) => setEditContent(event.target.value)}
                className="w-full border border-gray-400 rounded-lg px-4 py-3 text-sm md:text-base focus:outline-none focus:border-[#3D46AA] h-48 resize-none"
              />

              <div className="flex flex-wrap gap-2">
                {TAG_OPTIONS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setEditTag(tag)}
                    className={`px-3 py-1.5 rounded-md font-bold text-xs md:text-sm ${
                      editTag === tag
                        ? 'bg-[#3D46AA] text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 mt-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2 bg-gray-200 text-gray-700 font-bold text-sm rounded-lg hover:bg-gray-300"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleEditSave}
                  className="px-5 py-2 bg-[#3D46AA] text-white font-bold text-sm rounded-lg hover:bg-[#3D46AA]/90"
                >
                  수정 완료
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4 mb-3 mt-4 md:mt-0">
                <h1 className="text-2xl md:text-4xl font-bold text-black wrap-break-word w-full sm:w-auto">
                  {post.title}
                </h1>

                {isPostAuthor && (
                  <div className="flex gap-2 shrink-0 mt-1">
                    <button
                      type="button"
                      onClick={handleEditStart}
                      className="bg-gray-200 text-gray-700 px-3 py-1.5 md:px-4 md:py-1.5 rounded-md font-bold text-xs md:text-sm hover:bg-gray-300 transition-colors"
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="bg-[#F1B5B5] text-[#E71616] px-3 py-1.5 md:px-4 md:py-1.5 rounded-md font-bold text-xs md:text-sm hover:bg-[#F1B5B5]/80 transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                )}
              </div>

              <p className="text-xs md:text-sm text-gray-400 font-medium mb-5 md:mb-6">
                익명의 사용자
              </p>

              <p className="text-base md:text-lg text-black mb-8 md:mb-10 leading-relaxed whitespace-pre-wrap">
                {post.content}
              </p>

              <div className="mb-6 md:mb-8">
                <span className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full font-bold text-xs md:text-sm">
                  {postTag}
                </span>
              </div>

              {!isPostAuthor && (
                <button
                  type="button"
                  onClick={handleWarmHug}
                  className="w-full bg-[#EEDC5A] text-black py-3.5 md:py-4 rounded-xl font-bold text-lg md:text-xl hover:bg-[#e0cf55] transition-colors shadow-sm"
                >
                  이 글 따뜻하게 안아주기
                </button>
              )}
            </>
          )}
        </section>

        {!isBlinded && (
          <>
            <section>
              <h2 className="text-base md:text-lg font-bold text-black mb-2 ml-1">
                댓글
              </h2>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                {mainComments.length === 0 ? (
                  <p className="text-center text-sm md:text-base text-gray-400 py-8">
                    아직 댓글이 없습니다. 첫 번째 온기를 나눠주세요.
                  </p>
                ) : (
                  mainComments.map((comment, index) => {
                    const isOwner = post.uid === comment.uid;
                    const isMyComment = currentUser?.uid === comment.uid;
                    const replies = repliesByParentId[comment.id] || [];

                    return (
                      <article
                        key={comment.id}
                        className={`p-4 md:p-6 ${
                          index !== mainComments.length - 1
                            ? 'border-b border-gray-200'
                            : ''
                        }`}
                      >
                        {editingCommentId === comment.id ? (
                          <div className="flex flex-col gap-2">
                            <textarea
                              value={editCommentText}
                              onChange={(event) =>
                                setEditCommentText(event.target.value)
                              }
                              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 md:px-4 md:py-3 text-sm md:text-base focus:outline-none focus:border-[#3D46AA] resize-none"
                              rows={2}
                            />

                            <div className="flex justify-end gap-2 mt-1">
                              <button
                                type="button"
                                onClick={resetCommentEditState}
                                className="px-3 py-1.5 bg-gray-200 text-gray-700 font-bold text-xs md:text-sm rounded-md"
                              >
                                취소
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleEditCommentSave(comment.id)
                                }
                                className="px-3 py-1.5 bg-[#3D46AA] text-white font-bold text-xs md:text-sm rounded-md"
                              >
                                수정 완료
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex justify-between items-center mb-2">
                              <p
                                className={`font-bold text-sm ${
                                  isOwner ? 'text-[#3D46AA]' : 'text-gray-800'
                                }`}
                              >
                                {isOwner ? '글쓴이' : '익명'}
                              </p>

                              <div className="flex gap-2 md:gap-3">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setReplyingToId(
                                      replyingToId === comment.id
                                        ? null
                                        : comment.id
                                    )
                                  }
                                  className="text-xs font-bold text-[#1D2EE5] hover:opacity-80 transition-colors"
                                >
                                  {replyingToId === comment.id
                                    ? '취소'
                                    : '답글 달기'}
                                </button>

                                {isMyComment && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleEditCommentStart(comment)
                                      }
                                      className="text-xs font-bold text-gray-400 hover:text-gray-700 transition-colors"
                                    >
                                      수정
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleDeleteComment(comment.id)
                                      }
                                      className="text-xs font-bold text-[#E71616] hover:opacity-70 transition-colors"
                                    >
                                      삭제
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>

                            <p className="text-black mb-3 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                              {comment.text}
                            </p>

                            {comment.music && (
                              <button
                                type="button"
                                onClick={() =>
                                  handlePlayMusic(
                                    comment.music.title,
                                    comment.music.artist
                                  )
                                }
                                className="inline-flex items-center gap-3 bg-[#E6E8F6] p-2.5 md:p-3 rounded-xl cursor-pointer hover:bg-gray-200 transition-colors pr-4 md:pr-6 text-left"
                              >
                                <span className="bg-[#1D2EE5] p-2 md:p-3 rounded-lg text-white text-sm md:text-base">
                                  🎵
                                </span>
                                <span>
                                  <span className="block font-bold text-black text-xs md:text-sm">
                                    {comment.music.artist} -{' '}
                                    {comment.music.title}
                                  </span>
                                  <span className="block text-gray-500 text-[10px] md:text-xs mt-0.5">
                                    위로의 선물 도착
                                  </span>
                                </span>
                              </button>
                            )}
                          </>
                        )}

                        {replies.length > 0 && (
                          <div className="mt-4 flex flex-col gap-3 pl-3 md:pl-4 border-l-2 border-[#1D2EE5]/30">
                            {replies.map((reply) => {
                              const isReplyOwner = post.uid === reply.uid;
                              const isMyReply = currentUser?.uid === reply.uid;

                              return (
                                <div
                                  key={reply.id}
                                  className="bg-gray-50 rounded-r-xl p-3 md:p-4"
                                >
                                  {editingCommentId === reply.id ? (
                                    <div className="flex flex-col gap-2">
                                      <textarea
                                        value={editCommentText}
                                        onChange={(event) =>
                                          setEditCommentText(event.target.value)
                                        }
                                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs md:text-sm focus:outline-none focus:border-[#3D46AA] resize-none"
                                        rows={2}
                                      />

                                      <div className="flex justify-end gap-2 mt-1">
                                        <button
                                          type="button"
                                          onClick={resetCommentEditState}
                                          className="px-3 py-1 bg-gray-200 text-gray-700 font-bold text-xs rounded-md"
                                        >
                                          취소
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleEditCommentSave(reply.id)
                                          }
                                          className="px-3 py-1 bg-[#3D46AA] text-white font-bold text-xs rounded-md"
                                        >
                                          수정 완료
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      <div className="flex justify-between items-center mb-1">
                                        <p
                                          className={`font-bold text-xs md:text-sm ${
                                            isReplyOwner
                                              ? 'text-[#3D46AA]'
                                              : 'text-gray-600'
                                          }`}
                                        >
                                          ↳ {isReplyOwner ? '글쓴이' : '익명'}
                                        </p>

                                        {isMyReply && (
                                          <div className="flex gap-2">
                                            <button
                                              type="button"
                                              onClick={() =>
                                                handleEditCommentStart(reply)
                                              }
                                              className="text-[10px] md:text-xs font-bold text-gray-400 hover:text-gray-700"
                                            >
                                              수정
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() =>
                                                handleDeleteComment(reply.id)
                                              }
                                              className="text-[10px] md:text-xs font-bold text-[#E71616] hover:opacity-70"
                                            >
                                              삭제
                                            </button>
                                          </div>
                                        )}
                                      </div>

                                      <p className="text-black text-xs md:text-sm pl-4 mt-1 leading-relaxed whitespace-pre-wrap">
                                        {reply.text}
                                      </p>
                                    </>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {replyingToId === comment.id && (
                          <div className="mt-3 md:mt-4 pl-3 md:pl-4 border-l-2 border-gray-300 flex items-center gap-2">
                            <input
                              type="text"
                              value={replyText}
                              onChange={(event) =>
                                setReplyText(event.target.value)
                              }
                              onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                  event.preventDefault();
                                  handleAddReply(comment.id);
                                }
                              }}
                              placeholder="답글을 입력하세요"
                              className="flex-1 bg-gray-100 rounded-lg px-3 py-2 md:px-4 md:py-2.5 text-xs md:text-sm focus:outline-none focus:ring-1 focus:ring-[#3D46AA]"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddReply(comment.id)}
                              className="bg-[#1D2EE5] text-white px-3 py-2 md:px-4 md:py-2.5 rounded-lg font-bold text-xs md:text-sm hover:bg-[#1D2EE5]/90 shrink-0"
                            >
                              등록
                            </button>
                          </div>
                        )}
                      </article>
                    );
                  })
                )}
              </div>
            </section>

            <section className="bg-white rounded-2xl p-3 md:p-4 shadow-sm border border-gray-200 flex flex-col gap-2 relative">
              {selectedMusic && (
                <div className="px-2 text-xs md:text-sm font-bold text-[#1D2EE5]">
                  🎵 첨부 대기 중: {selectedMusic.artist} -{' '}
                  {selectedMusic.title}
                </div>
              )}

              <div className="flex items-center gap-2 md:gap-3">
                <button
                  type="button"
                  onClick={() => setIsMusicPopupOpen(true)}
                  className="bg-[#1D2EE5] text-white p-2.5 md:p-3.5 rounded-full hover:bg-[#1D2EE5]/90 transition-all shrink-0"
                  aria-label="음악 추천 첨부하기"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 md:h-6 md:w-6"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M18 3a1 1 0 00-1 1v8.196l-10 2A1 1 0 006 13v-8a1 1 0 01.804-.98l10-2A1 1 0 0118 3zM6 14a3 3 0 11-2 2.83V13a1 1 0 011-1h1v2zm11-2a3 3 0 11-2 2.83V8.82l2-.4V12z" />
                  </svg>
                </button>

                <input
                  type="text"
                  value={newComment}
                  onChange={(event) => setNewComment(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      handleAddComment();
                    }
                  }}
                  placeholder="댓글을 남겨주세요"
                  className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 md:px-6 md:py-3.5 text-sm md:text-base focus:outline-none focus:ring-1 focus:ring-[#3D46AA]"
                />

                <button
                  type="button"
                  onClick={handleAddComment}
                  className="text-gray-500 hover:text-[#1D2EE5] p-2 transition-colors shrink-0"
                  aria-label="댓글 보내기"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 md:h-7 md:w-7 transform rotate-45"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </button>
              </div>
            </section>
          </>
        )}

        {isMusicPopupOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-md shadow-xl">
              <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-4 text-[#1D2EE5]">
                음악 추천하기
              </h3>
              <p className="text-sm md:text-base text-gray-500 mb-4 md:mb-6">
                위로가 될 만한 음악을 입력해주세요
              </p>

              <div className="space-y-3 md:space-y-4">
                <input
                  type="text"
                  placeholder="가수 이름 (예: 루시)"
                  value={musicInput.artist}
                  onChange={(event) =>
                    updateMusicInput('artist', event.target.value)
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 md:py-3 text-sm md:text-base focus:outline-none focus:border-[#1D2EE5]"
                />
                <input
                  type="text"
                  placeholder="노래 제목 (예: 개화)"
                  value={musicInput.title}
                  onChange={(event) =>
                    updateMusicInput('title', event.target.value)
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 md:py-3 text-sm md:text-base focus:outline-none focus:border-[#1D2EE5]"
                />
              </div>

              <div className="flex gap-2 md:gap-3 mt-6 md:mt-8">
                <button
                  type="button"
                  onClick={() => setIsMusicPopupOpen(false)}
                  className="flex-1 py-2.5 md:py-3 bg-gray-200 text-gray-700 font-bold rounded-lg text-sm md:text-base hover:bg-gray-300"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleMusicSubmit}
                  className="flex-1 py-2.5 md:py-3 bg-[#1D2EE5] text-white font-bold rounded-lg text-sm md:text-base hover:bg-[#1D2EE5]/90"
                >
                  첨부하기
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SecretForestDetails;