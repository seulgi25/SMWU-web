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

const SecretForestDetails = () => {
    const { id } = useParams(); 
    const navigate = useNavigate();

    const [post, setPost] = useState(null); 
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

    const tags = ['#인간관계', '#학업스트레스', '#면접', '#취업', '#기타'];
    
    const bannedWords = [
        '자살', '죽고 싶다', '죽고싶다', '죽을래', '죽을래요', 
        '죽을 것 같다', '죽을 것 같아', '죽을 것 같아요', 
        '씨발', '시발', '개새끼', '미친놈', '병신'
    ];

    const [comments, setComments] = useState([
        { id: 1, author: '익명1', text: '저도 공감해요! 힘내세요!!' },
        { id: 2, author: '익명2', text: '이 노래 듣고 기분 푸셨으면 좋겠어요.', music: { title: '개화', artist: '루시(LUCY)' } }
    ]);

    useEffect(() => {
        const savedPosts = JSON.parse(localStorage.getItem('forestPosts')) || [];
        const foundPost = savedPosts.find(p => p.id === Number(id));
        if (foundPost) setPost(foundPost);
    }, [id]);

    const handleDelete = () => {
        if (window.confirm('정말 삭제하시겠습니까?')) {
            const savedPosts = JSON.parse(localStorage.getItem('forestPosts')) || [];
            const updatedPosts = savedPosts.filter(p => p.id !== Number(id));
            localStorage.setItem('forestPosts', JSON.stringify(updatedPosts));
            alert('삭제되었습니다.');
            navigate('/secret_forest');
        }
    };

    const handleEditStart = () => {
        setEditTitle(post.title);
        setEditContent(post.content);
        setEditTag(post.tag);
        setIsEditing(true);
    };

    const handleEditSave = () => {
        if (!editTitle.trim() || !editContent.trim()) {
            alert('제목과 내용을 모두 입력해 주세요.');
            return;
        }
        const hasBannedWord = bannedWords.some(word => editTitle.includes(word) || editContent.includes(word));
        if (hasBannedWord) {
            alert('따뜻한 공간을 위해 정돈된 언어를 사용해 주세요.');
            return;
        }

        const savedPosts = JSON.parse(localStorage.getItem('forestPosts')) || [];
        const updatedPosts = savedPosts.map(p => {
            if (p.id === Number(id)) return { ...p, title: editTitle, content: editContent, tag: editTag };
            return p;
        });

        localStorage.setItem('forestPosts', JSON.stringify(updatedPosts));
        setPost(prev => ({ ...prev, title: editTitle, content: editContent, tag: editTag }));
        setIsEditing(false);
    };

    // 🌟 댓글 작성 로직 + 알림 추가 🌟
    const handleAddComment = () => {
        if (!newComment.trim()) return;

        const hasBannedWord = bannedWords.some(word => newComment.includes(word));
        if (hasBannedWord) {
            alert('따뜻한 공간을 위해 정돈된 언어를 사용해 주세요.');
            return;
        }

        const newId = comments.length > 0 ? Math.max(...comments.map(c => c.id)) + 1 : 1;
        const newCommentObj = { id: newId, author: `익명${newId}`, text: newComment, ...(selectedMusic && { music: selectedMusic }) };
        setComments([...comments, newCommentObj]);
        setNewComment(''); 
        setSelectedMusic(null); 

        // 🌟 알림 저장 로직
        const savedAlarms = JSON.parse(localStorage.getItem('alarms')) || [];
        const newAlarm = {
            id: Date.now(),
            type: 'comment',
            message: '다른 사용자의 온기가 닿았습니다! 댓글을 확인하세요.',
            time: '방금 전',
            postId: Number(id)
        };
        localStorage.setItem('alarms', JSON.stringify([newAlarm, ...savedAlarms]));
    };

    const handleDeleteComment = (commentId) => {
        if (window.confirm('정말 이 댓글을 삭제하시겠습니까?')) {
            setComments(comments.filter(c => c.id !== commentId));
        }
    };

    const handleEditCommentStart = (comment) => {
        setEditingCommentId(comment.id);
        setEditCommentText(comment.text);
    };

    const handleEditCommentSave = (commentId) => {
        if (!editCommentText.trim()) {
            alert('댓글 내용을 입력해 주세요.');
            return;
        }
        const hasBannedWord = bannedWords.some(word => editCommentText.includes(word));
        if (hasBannedWord) {
            alert('따뜻한 공간을 위해 정돈된 언어를 사용해 주세요.');
            return;
        }

        setComments(comments.map(c => c.id === commentId ? { ...c, text: editCommentText } : c));
        setEditingCommentId(null); 
        setEditCommentText('');
    };

    const handleReport = () => {
        if (window.confirm('정말 신고하겠습니까?')) {
            const savedPosts = JSON.parse(localStorage.getItem('forestPosts')) || [];
            let currentReportCount = 0;
            const updatedPosts = savedPosts.map(p => {
                if (p.id === Number(id)) {
                    currentReportCount = (p.reportCount || 0) + 1;
                    return { ...p, reportCount: currentReportCount };
                }
                return p;
            });
            localStorage.setItem('forestPosts', JSON.stringify(updatedPosts));
            setPost(prev => ({ ...prev, reportCount: currentReportCount }));

            if (currentReportCount >= 5) alert('누적 신고 5회가 되어 해당 게시글이 블라인드 처리되었습니다.');
            else alert(`신고가 접수되었습니다. (현재 누적 신고: ${currentReportCount}회)`);
        }
    };

    // 🌟 안아주기 로직 + 최초 1회 알림 추가 🌟
    const handleWarmHug = () => {
        setIsWarm(true);
        setTimeout(() => setIsWarm(false), 3000);

        // 🌟 알림 저장 로직
        const savedAlarms = JSON.parse(localStorage.getItem('alarms')) || [];
        const hasHugged = savedAlarms.some(alarm => alarm.type === 'hug' && alarm.postId === Number(id));
        
        if (!hasHugged) {
            const newAlarm = {
                id: Date.now(),
                type: 'hug',
                message: '다른 사용자의 온기가 닿았습니다! 누군가 당신의 글에 [안아주기]를 선물했습니다.',
                time: '방금 전',
                postId: Number(id)
            };
            localStorage.setItem('alarms', JSON.stringify([newAlarm, ...savedAlarms]));
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
        window.open(`https://www.youtube.com/results?search_query=${artist}+${title}`, '_blank');
    };

    if (!post) {
        return <div className="min-h-screen flex items-center justify-center text-lg font-bold">글을 불러오는 중입니다...</div>;
    }

    const isBlinded = post.reportCount >= 5;

    return (
        <div className={`min-h-screen transition-colors duration-1000 ${isWarm ? 'bg-[#FADCD9]' : 'bg-[#F8F7EC]'}`}>
            <div className="w-full max-w-5xl mx-auto pt-10 pb-20 px-4 relative">
                
                <button onClick={() => navigate('/secret_forest')} className="flex items-center gap-2 bg-[#3D46AA] text-white px-5 py-2.5 rounded-lg font-bold text-lg mb-6 hover:bg-opacity-90">
                    &larr; 목록으로
                </button>
                
                <div className="bg-white rounded-2xl p-8 shadow-sm mb-6 border border-gray-100">
                    {isBlinded ? (
                        <div className="py-16 flex flex-col items-center justify-center text-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">블라인드 처리된 게시물입니다.</h2>
                            <p className="text-gray-500">누적 신고 5회 이상이 접수되어 숨김 처리되었습니다.</p>
                        </div>
                    ) : (
                        <>
                            {isEditing ? (
                                <div className="flex flex-col gap-4">
                                    <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full border border-gray-400 rounded-lg px-4 py-3 text-lg font-bold focus:outline-none focus:border-[#3D46AA]" />
                                    <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} className="w-full border border-gray-400 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-[#3D46AA] h-48 resize-none" />
                                    <div className="flex flex-wrap gap-2">
                                        {tags.map((tag) => (
                                            <button key={tag} onClick={() => setEditTag(tag)} className={`px-3 py-1.5 rounded-md font-bold text-sm ${editTag === tag ? 'bg-[#3D46AA] text-white' : 'bg-gray-200 text-gray-600'}`}>{tag}</button>
                                        ))}
                                    </div>
                                    <div className="flex gap-2 mt-2 justify-end">
                                        <button onClick={() => setIsEditing(false)} className="px-6 py-2 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300">취소</button>
                                        <button onClick={handleEditSave} className="px-6 py-2 bg-[#3D46AA] text-white font-bold rounded-lg hover:bg-opacity-90">수정 완료</button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-between items-start mb-2">
                                        <h1 className="text-3xl md:text-4xl font-bold text-black break-keep pr-4">{post.title}</h1>
                                        <div className="flex gap-2 min-w-max">
                                            <button onClick={handleEditStart} className="bg-gray-200 text-gray-700 px-4 py-1.5 rounded-md font-bold text-sm hover:bg-gray-300 transition-colors">수정</button>
                                            <button onClick={handleDelete} className="bg-[#F1B5B5] text-[#E71616] px-4 py-1.5 rounded-md font-bold text-sm hover:bg-opacity-80 transition-colors">삭제</button>
                                        </div>
                                    </div>
                                    <p className="text-gray-400 font-medium mb-6">익명의 사용자</p>
                                    <p className="text-lg text-black mb-10 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                                    <div className="mb-8"><span className="bg-gray-200 text-gray-700 px-4 py-1.5 rounded-full font-bold text-sm">{post.tag}</span></div>
                                    <button onClick={handleWarmHug} className="w-full bg-[#EEDC5A] text-black py-4 rounded-xl font-bold text-xl hover:bg-[#e0cf55] transition-colors">이 글 따뜻하게 안아주기</button>
                                </>
                            )}
                        </>
                    )}
                </div>
                
                {!isBlinded && (
                    <>
                        <div>
                            <h2 className="text-lg font-bold text-black mb-2 ml-2">댓글</h2>
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                                {comments.map((comment, index) => (
                                    <div key={comment.id} className={`p-6 ${index !== comments.length - 1 ? 'border-b border-gray-200' : ''}`}>
                                        
                                        {editingCommentId === comment.id ? (
                                            <div className="flex flex-col gap-2">
                                                <p className="font-bold text-black mb-1">{comment.author}</p>
                                                <textarea
                                                    value={editCommentText}
                                                    onChange={(e) => setEditCommentText(e.target.value)}
                                                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-[#3D46AA] resize-none"
                                                    rows="2"
                                                />
                                                <div className="flex justify-end gap-2 mt-1">
                                                    <button onClick={() => setEditingCommentId(null)} className="px-4 py-1.5 bg-gray-200 text-gray-700 font-bold text-sm rounded-md hover:bg-gray-300">취소</button>
                                                    <button onClick={() => handleEditCommentSave(comment.id)} className="px-4 py-1.5 bg-[#3D46AA] text-white font-bold text-sm rounded-md hover:bg-opacity-90">수정 완료</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex justify-between items-start mb-2">
                                                    <p className="font-bold text-black">{comment.author}</p>
                                                    <div className="flex gap-3">
                                                        <button onClick={() => handleEditCommentStart(comment)} className="text-sm font-bold text-gray-400 hover:text-gray-700 transition-colors">수정</button>
                                                        <button onClick={() => handleDeleteComment(comment.id)} className="text-sm font-bold text-[#E71616] hover:opacity-70 transition-colors">삭제</button>
                                                    </div>
                                                </div>
                                                
                                                <p className="text-black mb-3">{comment.text}</p>
                                                
                                                {comment.music && (
                                                    <div 
                                                        onClick={() => handlePlayMusic(comment.music.title, comment.music.artist)}
                                                        className="flex items-center gap-4 bg-[#E6E8F6] p-3 rounded-xl cursor-pointer hover:bg-gray-200 transition-colors"
                                                    >
                                                        <div className="bg-[#1D2EE5] p-3 rounded-lg text-white">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" /></svg>
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-black">{comment.music.artist} - {comment.music.title}</p>
                                                            <p className="text-gray-500 text-sm">위로의 선물 도착</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 flex flex-col gap-2">
                            {selectedMusic && (
                                <div className="px-2 text-sm font-bold text-[#1D2EE5]">
                                    🎵 첨부 대기 중: {selectedMusic.artist} - {selectedMusic.title}
                                </div>
                            )}
                            <div className="flex items-center gap-3">
                                <button onClick={() => setIsMusicPopupOpen(true)} className="bg-[#1D2EE5] text-white p-3.5 rounded-full hover:bg-opacity-90 transition-all shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" /></svg>
                                </button>
                                <input 
                                    type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAddComment()} placeholder="댓글을 입력하세요."
                                    className="flex-1 bg-gray-100 rounded-full px-6 py-3.5 text-base focus:outline-none focus:ring-1 focus:ring-[#3D46AA]"
                                />
                                <button onClick={handleAddComment} className="text-gray-500 hover:text-black p-2 transition-colors shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 transform rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {isMusicPopupOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl">
                            <h3 className="text-xl font-bold mb-4 text-[#1D2EE5]">음악 추천하기</h3>
                            <p className="text-gray-500 mb-6">위로가 될 만한 음악을 입력해주세요.</p>
                            <div className="space-y-4">
                                <input type="text" placeholder="가수 이름 (예: 루시)" value={musicInput.artist} onChange={(e) => setMusicInput({...musicInput, artist: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-[#1D2EE5]" />
                                <input type="text" placeholder="노래 제목 (예: 개화)" value={musicInput.title} onChange={(e) => setMusicInput({...musicInput, title: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-[#1D2EE5]" />
                            </div>
                            <div className="flex gap-3 mt-8">
                                <button onClick={() => setIsMusicPopupOpen(false)} className="flex-1 py-3 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300">취소</button>
                                <button onClick={handleMusicSubmit} className="flex-1 py-3 bg-[#1D2EE5] text-white font-bold rounded-lg hover:bg-opacity-90">첨부하기</button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default SecretForestDetails;