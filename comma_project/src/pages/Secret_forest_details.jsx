//Secret_forest_details페이지는 Secret_forest_list 페이지에서 글 목록을 선택했을 때 상세 내용 및 댓글을 작성, 보여줄 수 있는 페이지입니다.
//Secret_forest_list 페이지에서 글을 작성하면 Secret_forest_details 페이지를 통해 그 글의 세부 내용을 볼 수 있도록 구현됩니다.
//Secret_forest_details 페이지에는 글의 제목, 내용, 태그가 보여집니다. 이것은 흰색의 둥근 모서리를 가진 네모 박스 안에 존재합니다.
//글의 제목은 검정색의 크고 굵은 글씨로, 글의 내용은 검정색의 보통 굵기의 글씨로, 태그는 회색 박스에 검정색 글씨의 '# 태그명'로 디자인되어 있습니다.
//태그 명 아래에는 노란 색 버튼의 검정색 글씨로 '이 글 따뜻하게 안아주기' 버튼이 존재합니다. 이 버튼을 누르면 웹페이지 전체 배경색이 연한 빨간색 계열의 따뜻한 파스텔톤으로 3초동안 바뀌었다가 원래대로 돌아옵니다.
//그 아래에는 '댓글'이 있고 댓글이 보입니다. 댓글의 글쓴이는 검정색의 작고 굵은 글씨로 익명1, 익명2, 익명3...으로 표시되고 댓글의 내용은 검정색의 보통 굵기의 글씨로 디자인되어 있습니다.
//댓글 작성 폼은 화면의 아래에 위치하며 음악을 선택할 수 있는 버튼과 댓글을 작성할 수 있는 입력 칸, 보내기 버튼으로 이루어져 있고 흰색의 둥근 모서리를 가진 박스로 묶여있습니다.
//음악을 선택할 수 있는 버튼은 둥근 버튼에 음악 아이콘이 그려져있고 이 버튼을 누르면 노래 제목과 가수 이름을 입력할 수 있는 팝업이 뜹니다. 노래 제목과 가수 이름을 입력하고 댓글 내용을 작성 한 후 보내기 버튼을 누르면 댓글과 함께 노래 제목과 가수 이름이 댓글 아래에 같이 보여집니다. 그리고 그 추천받은 음악 버튼을 누르면 유튜브에서 그 노래제목과 가수가 검색된 페이지로 이동합니다.
//댓글 입력 칸은 회색의 둥근 모서리를 가진 입력 칸으로, placeholder는 '댓글을 입력하세요'입니다.
//보내기 버튼은 보내기 아이콘이 그려진 둥근 버튼으로 디자인되어 있습니다.
//모든 디자인은 tailwindcss를 사용하여 구현됩니다.
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';

const SecretForestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

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
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
        alert('로그인이 필요한 서비스입니다. 따뜻한 이야기를 보기 위해 로그인을 해주세요!');
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const fetchPostAndComments = async () => {
      try {
        const docRef = doc(db, 'secret_forest_list', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setPost({ id: docSnap.id, ...docSnap.data() });
        } else {
          alert('존재하지 않거나 삭제된 글입니다.');
          navigate('/secret_forest');
          return;
        }

        const commentsRef = collection(db, 'secret_forest_list', id, 'comments');
        const q = query(commentsRef, orderBy('createdAt', 'asc'));
        const commentSnap = await getDocs(q);

        const fetchedComments = commentSnap.docs.map((cDoc) => ({
          id: cDoc.id,
          ...cDoc.data(),
        }));

        setComments(fetchedComments);
      } catch (error) {
        console.error('데이터 불러오기 실패:', error);
      }
    };

    fetchPostAndComments();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (window.confirm('정말 삭제하시겠습니까? 복구할 수 없습니다.')) {
      try {
        await deleteDoc(doc(db, 'secret_forest_list', id));
        alert('삭제되었습니다.');
        navigate('/secret_forest');
      } catch (error) {
        alert('글 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const handleEditStart = () => {
    setEditTitle(post.title || '');
    setEditContent(post.content || '');
    setEditTag(post.tag || '');
    setIsEditing(true);
  };

  const handleEditSave = async () => {
    if (!editTitle.trim() || !editContent.trim()) {
      return alert('제목과 내용을 모두 입력해 주세요.');
    }

    if (
      bannedWords.some(
        (word) => editTitle.includes(word) || editContent.includes(word)
      )
    ) {
      return alert('따뜻한 공간을 위해 정돈된 언어를 사용해 주세요.');
    }

    try {
      const docRef = doc(db, 'secret_forest_list', id);
      await updateDoc(docRef, {
        title: editTitle,
        content: editContent,
        tag: editTag,
        tags: [editTag],
      });

      setPost((prev) => ({
        ...prev,
        title: editTitle,
        content: editContent,
        tag: editTag,
      }));

      setIsEditing(false);
      alert('수정되었습니다.');
    } catch (error) {
      alert('글 수정 중 오류가 발생했습니다.');
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    const user = auth.currentUser;
    if (!user) return alert('로그인이 필요합니다.');

    if (bannedWords.some((word) => newComment.includes(word))) {
      return alert('따뜻한 공간을 위해 정돈된 언어를 사용해 주세요.');
    }

    try {
      const commentsRef = collection(db, 'secret_forest_list', id, 'comments');

      const newCommentData = {
        uid: user.uid,
        author: '익명',
        text: newComment,
        parentId: null,
        ...(selectedMusic && { music: selectedMusic }),
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(commentsRef, newCommentData);

      setComments((prev) => [
        ...prev,
        {
          id: docRef.id,
          ...newCommentData,
        },
      ]);

      setNewComment('');
      setSelectedMusic(null);

      if (post.uid && post.uid !== user.uid) {
        await addDoc(collection(db, 'alarms'), {
          uid: post.uid,
          type: 'comment',
          message: '다른 사용자의 온기가 닿았습니다! 댓글을 확인하세요.',
          postId: id,
          createdAt: serverTimestamp(),
          isRead: false,
        });
      }
    } catch (error) {
      console.error('댓글 등록 실패:', error);
      alert('댓글 등록에 실패했습니다.');
    }
  };

  const handleAddReply = async (parentId) => {
    if (!replyText.trim()) return;

    const user = auth.currentUser;
    if (!user) return alert('로그인이 필요합니다.');

    if (bannedWords.some((word) => replyText.includes(word))) {
      return alert('따뜻한 공간을 위해 정돈된 언어를 사용해 주세요.');
    }

    try {
      const commentsRef = collection(db, 'secret_forest_list', id, 'comments');

      const newReplyData = {
        uid: user.uid,
        author: '익명',
        text: replyText,
        parentId,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(commentsRef, newReplyData);

      setComments((prev) => [
        ...prev,
        {
          id: docRef.id,
          ...newReplyData,
        },
      ]);

      setReplyingToId(null);
      setReplyText('');
    } catch (error) {
      console.error('답글 등록 실패:', error);
      alert('답글 등록에 실패했습니다.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        await deleteDoc(doc(db, 'secret_forest_list', id, 'comments', commentId));
        setComments((prev) =>
          prev.filter((c) => c.id !== commentId && c.parentId !== commentId)
        );
      } catch (error) {
        console.error('삭제 실패:', error);
      }
    }
  };

  const handleEditCommentStart = (comment) => {
    setEditingCommentId(comment.id);
    setEditCommentText(comment.text);
  };

  const handleEditCommentSave = async (commentId) => {
    if (!editCommentText.trim()) return alert('내용을 입력해 주세요.');

    if (bannedWords.some((word) => editCommentText.includes(word))) {
      return alert('따뜻한 공간을 위해 정돈된 언어를 사용해 주세요.');
    }

    try {
      await updateDoc(doc(db, 'secret_forest_list', id, 'comments', commentId), {
        text: editCommentText,
      });

      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId ? { ...c, text: editCommentText } : c
        )
      );

      setEditingCommentId(null);
      setEditCommentText('');
    } catch (error) {
      console.error('수정 실패:', error);
    }
  };

  const handleReport = async () => {
    if (window.confirm('정말 신고하겠습니까?')) {
      try {
        const newReportCount = (post.reportCount || 0) + 1;

        await updateDoc(doc(db, 'secret_forest_list', id), {
          reportCount: newReportCount,
        });

        setPost((prev) => ({ ...prev, reportCount: newReportCount }));

        if (newReportCount >= 5) {
          alert('누적 신고 5회가 되어 해당 게시글이 블라인드 처리되었습니다.');
        } else {
          alert(`신고가 접수되었습니다. (현재 누적 신고: ${newReportCount}회)`);
        }
      } catch (error) {
        console.error('신고 처리 실패:', error);
      }
    }
  };

  const handleWarmHug = async () => {
    setIsWarm(true);
    setTimeout(() => setIsWarm(false), 3000);

    const user = auth.currentUser;
    if (!post || !user) {
      if (!user) alert('로그인이 필요합니다.');
      return;
    }

    if (post.uid && post.uid !== user.uid) {
      try {
        const alarmsRef = collection(db, 'alarms');
        const q = query(
          alarmsRef,
          where('uid', '==', post.uid),
          where('postId', '==', id),
          where('type', '==', 'hug')
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          await addDoc(alarmsRef, {
            uid: post.uid,
            type: 'hug',
            message:
              '다른 사용자의 온기가 닿았습니다! 누군가 당신의 글에 [안아주기]를 선물했습니다.',
            postId: id,
            createdAt: serverTimestamp(),
            isRead: false,
          });
        }
      } catch (error) {
        console.error('안아주기 알림 전송 실패:', error);
      }
    }
  };

  const handleMusicSubmit = () => {
    if (musicInput.title && musicInput.artist) {
      setSelectedMusic(musicInput);
      setIsMusicPopupOpen(false);
      setMusicInput({ title: '', artist: '' });
    } else {
      alert('노래 제목과 가수를 모두 입력해주세요.');
    }
  };

  const handlePlayMusic = (title, artist) => {
    window.open(
      `https://www.youtube.com/results?search_query=${encodeURIComponent(
        `${artist} ${title}`
      )}`,
      '_blank'
    );
  };

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg font-bold">
        글을 불러오는 중입니다...
      </div>
    );
  }

  const isBlinded = (post.reportCount || 0) >= 5;
  const isPostAuthor = currentUser && currentUser.uid === post.uid;
  const mainComments = comments.filter((c) => !c.parentId);

  return (
    <div
      className={`min-h-screen transition-colors duration-1000 ${
        isWarm ? 'bg-[#FADCD9]' : 'bg-[#F8F7EC]'
      }`}
    >
      <div className="w-full max-w-5xl mx-auto pt-6 md:pt-10 pb-20 px-4 sm:px-6 relative">
        <button
          onClick={() => navigate('/secret_forest')}
          className="flex items-center gap-2 bg-[#3D46AA] text-white px-4 md:px-5 py-2 md:py-2.5 rounded-lg font-bold text-base md:text-lg mb-4 md:mb-6 hover:bg-opacity-90"
        >
          &larr; 목록으로
        </button>

        <div className="bg-white rounded-2xl p-5 md:p-8 shadow-sm mb-6 border border-gray-100 relative">
          {!isBlinded && !isPostAuthor && (
            <button
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
          ) : (
            <>
              {isEditing ? (
                <div className="flex flex-col gap-4 mt-4">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full border border-gray-400 rounded-lg px-4 py-3 text-base md:text-lg font-bold focus:outline-none focus:border-[#3D46AA]"
                  />
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full border border-gray-400 rounded-lg px-4 py-3 text-sm md:text-base focus:outline-none focus:border-[#3D46AA] h-48 resize-none"
                  />
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <button
                        key={tag}
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
                      onClick={() => setIsEditing(false)}
                      className="px-5 py-2 bg-gray-200 text-gray-700 font-bold text-sm rounded-lg hover:bg-gray-300"
                    >
                      취소
                    </button>
                    <button
                      onClick={handleEditSave}
                      className="px-5 py-2 bg-[#3D46AA] text-white font-bold text-sm rounded-lg hover:bg-opacity-90"
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
                          onClick={handleEditStart}
                          className="bg-gray-200 text-gray-700 px-3 py-1.5 md:px-4 md:py-1.5 rounded-md font-bold text-xs md:text-sm hover:bg-gray-300 transition-colors"
                        >
                          수정
                        </button>
                        <button
                          onClick={handleDelete}
                          className="bg-[#F1B5B5] text-[#E71616] px-3 py-1.5 md:px-4 md:py-1.5 rounded-md font-bold text-xs md:text-sm hover:bg-opacity-80 transition-colors"
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
                      {post.tag}
                    </span>
                  </div>

                  {!isPostAuthor && (
                    <button
                      onClick={handleWarmHug}
                      className="w-full bg-[#EEDC5A] text-black py-3.5 md:py-4 rounded-xl font-bold text-lg md:text-xl hover:bg-[#e0cf55] transition-colors shadow-sm"
                    >
                      이 글 따뜻하게 안아주기
                    </button>
                  )}
                </>
              )}
            </>
          )}
        </div>

        {!isBlinded && (
          <>
            <div>
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
                    const isMyComment =
                      currentUser && currentUser.uid === comment.uid;
                    const replies = comments.filter(
                      (c) => c.parentId === comment.id
                    );

                    return (
                      <div
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
                              onChange={(e) =>
                                setEditCommentText(e.target.value)
                              }
                              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 md:px-4 md:py-3 text-sm md:text-base focus:outline-none focus:border-[#3D46AA] resize-none"
                              rows="2"
                            />
                            <div className="flex justify-end gap-2 mt-1">
                              <button
                                onClick={() => setEditingCommentId(null)}
                                className="px-3 py-1.5 bg-gray-200 text-gray-700 font-bold text-xs md:text-sm rounded-md"
                              >
                                취소
                              </button>
                              <button
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
                                      onClick={() =>
                                        handleEditCommentStart(comment)
                                      }
                                      className="text-xs font-bold text-gray-400 hover:text-gray-700 transition-colors"
                                    >
                                      수정
                                    </button>
                                    <button
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

                            <p className="text-black mb-3 text-sm md:text-base leading-relaxed">
                              {comment.text}
                            </p>

                            {comment.music && (
                              <div
                                onClick={() =>
                                  handlePlayMusic(
                                    comment.music.title,
                                    comment.music.artist
                                  )
                                }
                                className="inline-flex items-center gap-3 bg-[#E6E8F6] p-2.5 md:p-3 rounded-xl cursor-pointer hover:bg-gray-200 transition-colors inline-flex pr-4 md:pr-6"
                              >
                                <div className="bg-[#1D2EE5] p-2 md:p-3 rounded-lg text-white text-sm md:text-base">
                                  🎵
                                </div>
                                <div>
                                  <p className="font-bold text-black text-xs md:text-sm">
                                    {comment.music.artist} - {comment.music.title}
                                  </p>
                                  <p className="text-gray-500 text-[10px] md:text-xs mt-0.5">
                                    위로의 선물 도착
                                  </p>
                                </div>
                              </div>
                            )}
                          </>
                        )}

                        {replies.length > 0 && (
                          <div className="mt-4 flex flex-col gap-3 pl-3 md:pl-4 border-l-2 border-[#1D2EE5]/30">
                            {replies.map((reply) => {
                              const isReplyOwner = post.uid === reply.uid;
                              const isMyReply =
                                currentUser && currentUser.uid === reply.uid;

                              return (
                                <div
                                  key={reply.id}
                                  className="bg-gray-50 rounded-r-xl p-3 md:p-4"
                                >
                                  {editingCommentId === reply.id ? (
                                    <div className="flex flex-col gap-2">
                                      <textarea
                                        value={editCommentText}
                                        onChange={(e) =>
                                          setEditCommentText(e.target.value)
                                        }
                                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs md:text-sm focus:outline-none focus:border-[#3D46AA] resize-none"
                                        rows="2"
                                      />
                                      <div className="flex justify-end gap-2 mt-1">
                                        <button
                                          onClick={() =>
                                            setEditingCommentId(null)
                                          }
                                          className="px-3 py-1 bg-gray-200 text-gray-700 font-bold text-xs rounded-md"
                                        >
                                          취소
                                        </button>
                                        <button
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
                                              onClick={() =>
                                                handleEditCommentStart(reply)
                                              }
                                              className="text-[10px] md:text-xs font-bold text-gray-400 hover:text-gray-700"
                                            >
                                              수정
                                            </button>
                                            <button
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

                                      <p className="text-black text-xs md:text-sm pl-4 mt-1 leading-relaxed">
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
                              onChange={(e) => setReplyText(e.target.value)}
                              onKeyDown={(e) =>
                                e.key === 'Enter' && handleAddReply(comment.id)
                              }
                              placeholder="답글을 입력하세요"
                              className="flex-1 bg-gray-100 rounded-lg px-3 py-2 md:px-4 md:py-2.5 text-xs md:text-sm focus:outline-none focus:ring-1 focus:ring-[#3D46AA]"
                            />
                            <button
                              onClick={() => handleAddReply(comment.id)}
                              className="bg-[#1D2EE5] text-white px-3 py-2 md:px-4 md:py-2.5 rounded-lg font-bold text-xs md:text-sm hover:bg-opacity-90 shrink-0"
                            >
                              등록
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-3 md:p-4 shadow-sm border border-gray-200 flex flex-col gap-2 relative">
              {selectedMusic && (
                <div className="px-2 text-xs md:text-sm font-bold text-[#1D2EE5]">
                  🎵 첨부 대기 중: {selectedMusic.artist} - {selectedMusic.title}
                </div>
              )}

              <div className="flex items-center gap-2 md:gap-3">
                <button
                  onClick={() => setIsMusicPopupOpen(true)}
                  className="bg-[#1D2EE5] text-white p-2.5 md:p-3.5 rounded-full hover:bg-opacity-90 transition-all shrink-0"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 md:h-6 md:w-6"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M18 3a1 1 0 00-1 1v8.196l-10 2A1 1 0 006 13v-8a1 1 0 01.804-.98l10-2A1 1 0 0118 3zM6 14a3 3 0 11-2 2.83V13a1 1 0 011-1h1v2zm11-2a3 3 0 11-2 2.83V8.82l2-.4V12z" />
                  </svg>
                </button>

                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                  placeholder="댓글을 남겨주세요"
                  className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 md:px-6 md:py-3.5 text-sm md:text-base focus:outline-none focus:ring-1 focus:ring-[#3D46AA]"
                />

                <button
                  onClick={handleAddComment}
                  className="text-gray-500 hover:text-[#1D2EE5] p-2 transition-colors shrink-0"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 md:h-7 md:w-7 transform rotate-45"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </>
        )}

        {isMusicPopupOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
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
                  onChange={(e) =>
                    setMusicInput({ ...musicInput, artist: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 md:py-3 text-sm md:text-base focus:outline-none focus:border-[#1D2EE5]"
                />
                <input
                  type="text"
                  placeholder="노래 제목 (예: 개화)"
                  value={musicInput.title}
                  onChange={(e) =>
                    setMusicInput({ ...musicInput, title: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 md:py-3 text-sm md:text-base focus:outline-none focus:border-[#1D2EE5]"
                />
              </div>

              <div className="flex gap-2 md:gap-3 mt-6 md:mt-8">
                <button
                  onClick={() => setIsMusicPopupOpen(false)}
                  className="flex-1 py-2.5 md:py-3 bg-gray-200 text-gray-700 font-bold rounded-lg text-sm md:text-base hover:bg-gray-300"
                >
                  취소
                </button>
                <button
                  onClick={handleMusicSubmit}
                  className="flex-1 py-2.5 md:py-3 bg-[#1D2EE5] text-white font-bold rounded-lg text-sm md:text-base hover:bg-opacity-90"
                >
                  첨부하기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecretForestDetails;
