//정서 케어 서비스 결과 페이지
//'정서 케어 서비스 결과 // 쉼표가 분석 완료한 결과입니다.'라는 문구가 Header.jsx 아래에 위치해 있습니다. 이 문구는 '로그인'은 크고 굵은 파란색으로, '다시 마음에 편안한 쉼표를 찍어보세요.'는 회색 글씨로('로그인' 단어보다 작게) 디자인되어 있습니다.
//흰색 둥근 박스 안에는 맞춤 위로 진단 결과가 표시됩니다.
//추천 음악, 추천 글귀, 힐링 공간, 익명 대나무숲의 글을 추천합니다.
//추천 음악은 파란색 글씨로 작성하고 실제 추천하는 음악은 검은색 굵은 글씨로 작성합니다. 임의로 추천 음악은 '루시(LUCY)-개화'로 설정하고 추후에 백엔드와 연동하여 사용자가 선택한 감정과 상황에 맞는 음악이 추천되도록 할 수 있습니다.
//추천한 음악 바로 옆에는 '음악 들으러 가기' 버튼이 있습니다. 버튼 색상은 '#3D46AA' 배경에 흰색 글씨로 설정되어 있습니다. 버튼을 누르면 유튜브에서 '루시(LUCY)-개화' 음악이 검색되어있는 링크로 이동하도록 설정합니다.
//추천 글귀는 파란색 글씨로 작성하고 실제 추천하는 글귀는 검은색 굵은 글씨로 작성합니다. 임의로 추천 글귀는 '자신의 감정을 말로 표현하는데 서투른 사람도 있는 법이야.'로 설정하고 추후에 백엔드와 연동하여 사용자가 선택한 감정과 상황에 맞는 글귀가 추천되도록 할 수 있습니다.
//추천 음악과 추천 글귀 바로 옆에는 익명 대나무숲의 글을 추천하는 영역이 있습니다. 추천하는 글의 제목을 띄어주고 그 제목 버튼을 누르면 실제 글로 이동할 수 있도록 설정합니다. 임의로 추천하는 글 제목 3개는 각각 "팀플 발표 당일 조원이 잠수탈 때 대처법", "나 혼자만 부족해 보일 때", "팀플 나만 힘들어?" 로 설정하고 추후에 백엔드와 연동하여 사용자가 선택한 감정과 상황에 맞는 글이 추천되도록 할 수 있습니다.
//추천 음악, 추천 글귀, 익명 대나무숲 아래에는 힐링 공간을 추천하는 영역이 있습니다. 카카오 맵 API와 연동하여 지도 및 추천 장소를 보여주고 그 옆에는 어느 장소를 추천하는지 장소 명이 작성되어있습니다.
//장소명은 추천에 따라 달라지지만 '#9299E5' 배경에 흰색 글씨로 작성하고 임의로 '성정동 파스텔 다락방 북카페', '카페 이숲', '두정도서관'으로 설정합니다. 추후에 백엔드와 연동하여 사용자가 선택한 감정과 상황에 맞는 장소가 추천되도록 할 수 있습니다.
//흰색 둥근 박스 아래에는 '다시 진단하기' 버튼이 있고 버튼 색상은 '#3D46AA' 배경에 흰색 글씨로 설정되어 있습니다. 버튼을 누르면 다시 './pages/Consolation'으로 이동하도록 설정합니다.
//모든 디자인은 Tailwind CSS로 구현됩니다.
// Consolation_result.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Map, MapMarker, useKakaoLoader } from 'react-kakao-maps-sdk'; 
import axios from 'axios'; 

import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

// 🌟 확장된 상황/감정 데이터에 맞춘 명언 DB
const QUOTES_DB = [
    { text: "지금 당장 모든 걸 완벽하게 해내지 않아도 괜찮아요. 조금 쉬어가도 세상은 무너지지 않습니다.", tags: ["지침 / 번아웃", "무기력", "시험 및 학업"] },
    { text: "누군가와의 관계가 당신을 아프게 한다면, 가장 먼저 지켜야 할 것은 당신 자신의 마음입니다.", tags: ["인간관계", "가족 갈등", "연애/이별", "우울함"] },
    { text: "앞이 보이지 않는 막막함은, 역설적으로 당신이 새로운 길을 개척할 수 있는 백지상태라는 뜻이기도 해요.", tags: ["막막함", "불안", "진로 고민"] },
    { text: "화가 나는 건 당연한 감정이에요. 그 감정을 부정하지 말고, 안전하게 흘려보내는 연습을 해보세요.", tags: ["화남", "팀플 문제", "인간관계"] },
    { text: "외로움은 누군가가 필요해서가 아니라, 나 자신과 깊이 대화할 시간이 필요하다는 신호일지 모릅니다.", tags: ["외로움", "우울함", "연애/이별"] },
    { text: "결과가 모든 것을 증명하지 않아요. 그 과정을 묵묵히 걸어온 당신의 노력은 이미 충분히 빛납니다.", tags: ["시험 및 학업", "면접", "조급함"] },
    { text: "당신의 가치는 남들의 평가나 현재의 상황으로 결정되지 않아요. 당신은 그 자체로 귀한 사람입니다.", tags: ["경제적 어려움", "불안", "우울함"] }
];

const Consolation_result = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // 전달받은 데이터 추출
    const userState = {
        emotion: location.state?.emotion || '우울함',
        situation: location.state?.situation || '진로 고민'
    };

    const [myLocation, setMyLocation] = useState({ lat: 36.8322, lng: 127.1350 }); 
    const [weatherCondition, setWeatherCondition] = useState("");
    const [recommendedPlaces, setRecommendedPlaces] = useState([]);
    
    const [recommendedPosts, setRecommendedPosts] = useState([]);
    const [recommendedMusic, setRecommendedMusic] = useState(null);
    const [recommendedQuote, setRecommendedQuote] = useState("");
    
    const [isSearching, setIsSearching] = useState(true); 

    const [loading, error] = useKakaoLoader({
        appkey: process.env.REACT_APP_KAKAO_MAP_API_KEY, 
        libraries: ["services"] 
    });

    useEffect(() => {
        if (loading || error) return;

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    setMyLocation({ lat, lng });
                    fetchWeatherAndPlaces(lat, lng); 
                },
                (error) => {
                    console.error("위치 정보 거부됨. 기본 위치로 진행합니다.");
                    fetchWeatherAndPlaces(myLocation.lat, myLocation.lng);
                }
            );
        } else {
            fetchWeatherAndPlaces(myLocation.lat, myLocation.lng);
        }

        fetchRecommendations();
        generateQuote();
    }, [loading]);

    const fetchRecommendations = async () => {
        try {
            const postsRef = collection(db, "secret_forest_list");
            const searchTags = [userState.situation, `#${userState.situation}`];
            const q = query(postsRef, where("tag", "in", searchTags));
            const querySnapshot = await getDocs(q);
            
            let matchedPosts = [];
            let musicScores = {}; 

            for (const postDoc of querySnapshot.docs) {
                const postData = postDoc.data();
                matchedPosts.push({ id: postDoc.id, ...postData });

                const hugCount = postData.hugCount || 0; 
                const commentsRef = collection(db, "secret_forest_list", postDoc.id, "comments");
                const commentSnap = await getDocs(commentsRef);

                commentSnap.forEach(cDoc => {
                    const commentData = cDoc.data();
                    if (commentData.music) {
                        const musicKey = `${commentData.music.artist}-${commentData.music.title}`;
                        if (!musicScores[musicKey]) {
                            musicScores[musicKey] = { ...commentData.music, score: 0 };
                        }
                        musicScores[musicKey].score += (1 + hugCount);
                    }
                });
            }

            matchedPosts.sort((a, b) => b.createdAt - a.createdAt);
            setRecommendedPosts(matchedPosts.slice(0, 3));

            const sortedMusic = Object.values(musicScores).sort((a, b) => b.score - a.score);
            if (sortedMusic.length > 0) {
                setRecommendedMusic(sortedMusic[0]);
            } else {
                setRecommendedMusic({ title: "한 페이지가 될 수 있게", artist: "DAY6" });
            }

        } catch (error) {
            console.error("추천 데이터 불러오기 실패:", error);
        }
    };

    const generateQuote = () => {
        const matchedQuotes = QUOTES_DB.filter(q => 
            q.tags.includes(userState.situation) || q.tags.includes(userState.emotion)
        );
        
        if (matchedQuotes.length > 0) {
            const randomQuote = matchedQuotes[Math.floor(Math.random() * matchedQuotes.length)];
            setRecommendedQuote(randomQuote.text);
        } else {
            setRecommendedQuote("모든 것을 완벽하게 해낼 필요는 없습니다. 최선을 다한 당신, 그것으로 충분해요.");
        }
    };

    const fetchWeatherAndPlaces = async (lat, lng) => {
        const openWeatherKey = process.env.REACT_APP_WEATHER_API_KEY;
        let currentWeather = "Clear"; 

        try {
            const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${openWeatherKey}`);
            currentWeather = response.data.weather[0].main; 
            setWeatherCondition(currentWeather);
        } catch (err) {
            console.error("날씨 API 실패, 기본값으로 진행합니다.", err);
        }

        searchPlaces(currentWeather, lat, lng); 
    };

    const searchPlaces = (weather, lat, lng) => {
        if (!window.kakao || !window.kakao.maps.services) return;

        const ps = new window.kakao.maps.services.Places();
        let keywords = [];

        switch(userState.situation) {
            case '시험 및 학업': keywords.push('스터디카페', '도서관', '조용한 카페'); break;
            case '인간관계': keywords.push('독립서점', '힐링카페'); break;
            case '진로 고민': keywords.push('북카페', '전시회'); break;
            case '면접': keywords.push('테마카페', '공방'); break;
            case '팀플 문제': keywords.push('만화카페', '오락실'); break;
            case '연애/이별': keywords.push('공방', '베이커리 카페'); break;
            case '경제적 어려움': keywords.push('도서관', '무료 전시회', '공원'); break;
            case '가족 갈등': keywords.push('코인노래방', '독립서점'); break;
            default: keywords.push('카페');
        }

        if (['우울함', '무기력', '외로움'].includes(userState.emotion)) keywords.push('산책로', '수목원', '꽃집');
        if (['불안', '조급함', '막막함'].includes(userState.emotion)) keywords.push('미술관', '찻집');
        if (['지침 / 번아웃', '화남'].includes(userState.emotion)) keywords.push('마사지', '휴양림', '코인노래방');

        const isCloudyOrRainy = ["Rain", "Snow", "Thunderstorm", "Clouds", "Drizzle"].includes(weather);
        
        if (isCloudyOrRainy) {
            keywords = keywords.filter(kw => !['산책로', '수목원', '공원', '휴양림'].includes(kw));
            if (keywords.length === 0) keywords.push("실내 카페");
        }

        const searchKeyword = keywords[0];

        ps.keywordSearch(searchKeyword, (data, status) => {
            if (status === window.kakao.maps.services.Status.OK) {
                const top3 = data.slice(0, 3).map(place => ({
                    name: place.place_name,
                    lat: parseFloat(place.y),
                    lng: parseFloat(place.x)
                }));
                setRecommendedPlaces(top3);
            } else {
                setRecommendedPlaces([{ name: "근처에 추천 장소가 없습니다.", lat, lng }]);
            }
            setIsSearching(false); 
        }, {
            location: new window.kakao.maps.LatLng(lat, lng),
            radius: 3000 
        });
    };

    const getWeatherMessage = () => {
        switch (weatherCondition) {
            case 'Rain':
            case 'Drizzle':
            case 'Thunderstorm': return '비 소식, 아늑한 실내 공간 추천';
            case 'Snow': return '하얀 눈, 따뜻한 실내 공간 추천';
            case 'Clouds': return '흐린 날씨, 차분한 정서 완화 공간 추천';
            case 'Clear': return '맑고 상쾌한 날씨, 기분 전환 공간 추천';
            default: return '오늘의 날씨 맞춤 공간 추천';
        }
    };

    const handleDiagnosisAgain = () => navigate('/consolation');

    const handleMusicPlay = () => {
        if (recommendedMusic) {
            window.open(`https://www.youtube.com/results?search_query=${recommendedMusic.artist}+${recommendedMusic.title}`, '_blank');
        }
    };

    if (loading || isSearching) return <div className="min-h-screen flex items-center justify-center font-bold text-[#1D2EE5] text-sm md:text-xl">쉼표가 맞춤형 힐링 공간을 찾는 중입니다... ☕</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center font-bold text-red-500 text-sm md:text-base">지도 로딩에 실패했습니다. 키를 확인해주세요.</div>;

    return (
        // 🌟 전체 여백 다이어트
        <div className="w-full max-w-6xl mx-auto pt-10 md:pt-16 pb-12 px-4 md:px-6">
            
            {/* 상단 텍스트 폰트 조절 */}
            <div className="text-left mb-6 md:mb-10 px-1 md:px-2">
                <h1 className="text-2xl md:text-4xl font-bold text-[#1D2EE5] mb-2 md:mb-3">정서 케어 서비스 결과</h1>
                <p className="text-gray-500 text-sm md:text-lg leading-relaxed break-keep">
                    <span className="font-bold text-[#1D2EE5]">[{userState.emotion}]</span> 감정과 <span className="font-bold text-[#1D2EE5]">[{userState.situation}]</span> 상황을 겪고 계신 당신을 위한 처방입니다.
                </p>
            </div>

            {/* 카드 안쪽 여백 축소 p-10 -> p-6 */}
            <div className="bg-white rounded-2xl p-6 md:p-10 shadow-sm w-full flex flex-col gap-8 md:gap-10 border border-gray-100">
                
                {/* 🌟 1. 추천 음악 & 글귀 (그리드 간격 조절) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    <div className="flex flex-col gap-8 md:gap-10">
                        {/* 음악 추천 */}
                        <div>
                            <h2 className="text-base md:text-lg font-bold text-[#1D2EE5] mb-3 flex items-center">
                                <span className="w-1.5 h-1.5 bg-[#1D2EE5] rounded-full mr-2"></span>추천 음악
                            </h2>
                            {/* 🌟 가로로 꽉 끼던 것을 세로 정렬(모바일) -> 가로 정렬(PC)로 변경 */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                <p className="text-base md:text-xl font-bold text-black break-words leading-snug">
                                    {recommendedMusic ? `${recommendedMusic.artist} - ${recommendedMusic.title}` : "음악을 분석 중입니다."}
                                </p>
                                <button 
                                    onClick={handleMusicPlay}
                                    className="w-full sm:w-auto bg-[#3D46AA] text-white px-4 py-2.5 md:py-2 rounded-lg font-bold hover:bg-opacity-90 transition-all text-sm whitespace-nowrap shrink-0"
                                >
                                    음악 들으러 가기
                                </button>
                            </div>
                        </div>

                        {/* 글귀 추천 */}
                        <div>
                            <h2 className="text-base md:text-lg font-bold text-[#1D2EE5] mb-3 flex items-center">
                                <span className="w-1.5 h-1.5 bg-[#1D2EE5] rounded-full mr-2"></span>추천 글귀
                            </h2>
                            <p className="text-base md:text-xl font-bold text-black leading-relaxed break-keep">
                                {recommendedQuote}
                            </p>
                        </div>
                    </div>

                    {/* 대나무숲 추천 */}
                    <div>
                        <h2 className="text-base md:text-lg font-bold text-[#1D2EE5] mb-3 flex items-center">
                            <span className="w-1.5 h-1.5 bg-[#1D2EE5] rounded-full mr-2"></span>익명 대나무숲
                        </h2>
                        <div className="flex flex-col gap-3">
                            {recommendedPosts.length === 0 ? (
                                <p className="text-gray-400 py-4 text-sm md:text-base">해당 상황에 대한 글이 아직 없습니다.</p>
                            ) : (
                                recommendedPosts.map((post) => (
                                    <button 
                                        key={post.id}
                                        onClick={() => navigate(`/secret_forest/${post.id}`)}
                                        className="text-left px-4 md:px-5 py-3 md:py-3.5 bg-white border border-gray-300 rounded-lg font-bold text-sm md:text-base text-black hover:bg-gray-50 transition-all shadow-sm truncate"
                                    >
                                        "{post.title}"
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* 🌟 2. 힐링 공간 지도 영역 */}
                <div>
                    {/* 타이틀이 좁아서 찌그러지던 것 해결 (모바일 세로 배치) */}
                    <h2 className="text-base md:text-lg font-bold text-[#1D2EE5] mb-3 md:mb-4 flex flex-col md:flex-row md:items-center items-start gap-1 md:gap-0">
                        <div className="flex items-center">
                            <span className="w-1.5 h-1.5 bg-[#1D2EE5] rounded-full mr-2"></span>
                            힐링 공간 
                        </div>
                        <span className="text-xs md:text-sm font-normal text-gray-500 md:ml-3 pl-3 md:pl-0 break-keep">
                            ({getWeatherMessage()})
                        </span>
                    </h2>
                    
                    <div className="flex flex-col lg:flex-row w-full rounded-xl overflow-hidden shadow-sm border border-gray-200 h-auto lg:h-[400px]">
                        {/* 카카오맵 뷰어 */}
                        <div className="w-full lg:flex-1 h-64 sm:h-80 lg:h-full bg-gray-100 relative">
                            <Map
                                center={myLocation} 
                                style={{ width: "100%", height: "100%" }}
                                level={5}
                            >
                                <MapMarker position={myLocation}>
                                    <div style={{ padding: "5px", color: "#E71616", fontSize: "11px", textAlign: "center", width: "100px", fontWeight:"bold" }}>
                                        📍 현재 내 위치
                                    </div>
                                </MapMarker>

                                {recommendedPlaces.map((place, index) => (
                                    <MapMarker
                                        key={index} 
                                        position={{ lat: place.lat, lng: place.lng }}
                                    >
                                        <div className="p-1 text-black text-[10px] md:text-xs text-center w-24 md:w-32 font-bold truncate">
                                            {place.name}
                                        </div>
                                    </MapMarker>
                                ))}
                            </Map>
                        </div>
                        
                        {/* 보라색 추천 목록 */}
                        <div className="w-full lg:w-1/3 bg-[#9299E5] p-5 md:p-8 flex flex-col justify-center gap-4 md:gap-5 text-white h-auto lg:h-full">
                            {recommendedPlaces.map((place, index) => (
                                <div key={index} className="flex items-center gap-3 font-bold text-sm md:text-base leading-snug">
                                    <span className="w-1.5 h-1.5 bg-white rounded-full shrink-0"></span>
                                    {place.name}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>

            {/* 하단 다시 진단하기 버튼 최적화 */}
            <div className="mt-8 md:mt-10 flex justify-center md:justify-start px-2">
                <button
                    onClick={handleDiagnosisAgain}
                    className="w-full md:w-auto px-8 py-3.5 bg-[#3D46AA] text-white rounded-xl font-bold text-base md:text-lg hover:bg-opacity-90 transition-all shadow-sm"
                >
                    다시 진단하기
                </button>
            </div>
            
        </div>
    );
};

export default Consolation_result;