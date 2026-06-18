/**
 * Consolation_result.jsx
 *
 * 정서 케어 진단 결과 페이지입니다.
 * 사용자가 선택한 감정과 상황을 바탕으로 음악, 글귀, 대나무숲 글,
 * 현재 위치 기반 힐링 공간을 추천합니다.
 *
 * - Firestore: 대나무숲 게시글/댓글 기반 글·음악 추천
 * - OpenWeatherMap API: 현재 날씨 확인
 * - Kakao Map API: 현재 위치 반경 3km 내 힐링 공간 검색
 * - YouTube Search: 추천 음악 검색 페이지 연결
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Map as KakaoMap, MapMarker, useKakaoLoader } from 'react-kakao-maps-sdk';
import axios from 'axios';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

// 기본 설정 및 API 키
const POST_COLLECTION = 'secret_forest_list';
const PLACE_SEARCH_RADIUS = 3000;

const KAKAO_MAP_API_KEY = import.meta.env.VITE_KAKAO_MAP_API_KEY;
const OPENWEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

// 위치, 음악, 글귀 데이터가 없을 때 사용할 기본값
const DEFAULT_LOCATION = { lat: 36.8322, lng: 127.135 };
const DEFAULT_MUSIC = { title: '한 페이지가 될 수 있게', artist: 'DAY6' };
const DEFAULT_QUOTE =
  '모든 것을 완벽하게 해낼 필요는 없습니다. 최선을 다한 당신, 그것으로 충분해요.';

/**
 * 추천 글귀 DB
 * 사용자가 선택한 감정(emotion) 또는 상황(situation)이 각 글귀의 tags 배열에 포함되어 있으면 추천 후보가 됨.
 */
const QUOTES_DB = [
  {
    text: '지금 당장 모든 걸 완벽하게 해내지 않아도 괜찮아요. 조금 쉬어가도 세상은 무너지지 않습니다.',
    tags: ['지침 / 번아웃', '무기력', '시험 및 학업'],
  },
  {
    text: '아무것도 하기 싫은 날에도 당신은 이미 버티고 있어요. 버티는 것만으로도 충분히 애쓰고 있는 거예요.',
    tags: ['무기력', '지침 / 번아웃'],
  },
  {
    text: '계속 달리기만 하면 누구라도 지칠 수밖에 없어요. 오늘은 속도를 늦추는 것도 하나의 선택입니다.',
    tags: ['지침 / 번아웃', '조급함'],
  },
  {
    text: '당신의 가치는 남들의 평가나 현재의 상황으로 결정되지 않아요. 당신은 그 자체로 귀한 사람입니다.',
    tags: ['우울함', '불안', '경제적 어려움'],
  },
  {
    text: '외로움은 누군가가 필요해서가 아니라, 나 자신과 깊이 대화할 시간이 필요하다는 신호일지 모릅니다.',
    tags: ['외로움', '우울함', '연애/이별'],
  },
  {
    text: '오늘 마음이 조금 무너졌더라도 괜찮아요. 무너진 마음을 다시 세우는 데에는 시간이 필요합니다.',
    tags: ['우울함', '외로움'],
  },
  {
    text: '혼자인 것처럼 느껴지는 순간에도 당신의 마음은 혼자 남겨져서는 안 돼요. 천천히 기대도 괜찮습니다.',
    tags: ['외로움', '인간관계'],
  },
  {
    text: '앞이 보이지 않는 막막함은, 역설적으로 당신이 새로운 길을 개척할 수 있는 백지상태라는 뜻이기도 해요.',
    tags: ['막막함', '불안', '진로 고민'],
  },
  {
    text: '아직 답을 찾지 못했다고 해서 길을 잃은 건 아니에요. 고민하고 있다는 것 자체가 앞으로 나아가고 있다는 증거입니다.',
    tags: ['막막함', '진로 고민'],
  },
  {
    text: '불안한 마음은 미래를 잘 해내고 싶다는 마음에서 오기도 해요. 그 마음까지 너무 미워하지 않았으면 좋겠어요.',
    tags: ['불안', '면접', '진로 고민'],
  },
  {
    text: '빨리 가야 할 것 같은 마음이 들수록 잠시 멈춰 숨을 골라도 괜찮아요. 방향은 속도보다 중요합니다.',
    tags: ['조급함', '시험 및 학업', '진로 고민'],
  },
  {
    text: '화가 나는 건 당연한 감정이에요. 그 감정을 부정하지 말고, 안전하게 흘려보내는 연습을 해보세요.',
    tags: ['화남', '팀플 문제', '인간관계'],
  },
  {
    text: '상처받은 마음이 화로 올라올 때가 있어요. 그 감정 뒤에 있는 나의 힘듦을 먼저 알아차려 주세요.',
    tags: ['화남', '인간관계', '가족 갈등'],
  },
  {
    text: '결과가 모든 것을 증명하지 않아요. 그 과정을 묵묵히 걸어온 당신의 노력은 이미 충분히 빛납니다.',
    tags: ['시험 및 학업', '면접', '조급함'],
  },
  {
    text: '오늘의 공부가 완벽하지 않았더라도 괜찮아요. 쌓이지 않는 것처럼 보여도 마음속에는 분명히 남고 있습니다.',
    tags: ['시험 및 학업', '무기력'],
  },
  {
    text: '남들보다 느린 것 같아도, 당신만의 속도로 쌓아온 시간은 절대 사라지지 않습니다.',
    tags: ['시험 및 학업', '불안', '조급함'],
  },
  {
    text: '누군가와의 관계가 당신을 아프게 한다면, 가장 먼저 지켜야 할 것은 당신 자신의 마음입니다.',
    tags: ['인간관계', '가족 갈등', '연애/이별', '우울함'],
  },
  {
    text: '모든 관계를 끝까지 붙잡아야 하는 건 아니에요. 나를 너무 아프게 하는 거리는 조절해도 괜찮습니다.',
    tags: ['인간관계', '가족 갈등'],
  },
  {
    text: '가까운 사람과의 갈등일수록 더 크게 아플 수 있어요. 아픈 마음을 느끼는 당신이 이상한 게 아닙니다.',
    tags: ['가족 갈등', '우울함', '화남'],
  },
  {
    text: '아직 무엇이 맞는지 모르겠다는 건, 가능성이 닫힌 게 아니라 아직 여러 방향이 열려 있다는 뜻일 수 있어요.',
    tags: ['진로 고민', '막막함'],
  },
  {
    text: '면접 한 번이 당신의 전부를 평가할 수는 없어요. 오늘의 긴장과 아쉬움이 당신의 가능성을 지우지는 못합니다.',
    tags: ['면접', '불안', '조급함'],
  },
  {
    text: '지금의 불확실함이 너무 크게 느껴져도, 당신은 이미 답을 찾기 위해 충분히 움직이고 있습니다.',
    tags: ['진로 고민', '면접', '불안'],
  },
  {
    text: '혼자 감당하고 있는 것처럼 느껴질 때는, 책임감이 큰 사람일수록 더 지치기 쉽습니다. 모든 짐을 혼자 들지 않아도 됩니다.',
    tags: ['팀플 문제', '지침 / 번아웃', '화남'],
  },
  {
    text: '불공평한 상황에 화가 나는 건 당연해요. 당신이 예민해서가 아니라, 그만큼 책임을 다하려 했기 때문입니다.',
    tags: ['팀플 문제', '화남'],
  },
  {
    text: '마음이 멀어진 관계 앞에서 아픈 건 그만큼 진심이었다는 뜻이에요. 그 마음까지 부정하지 않아도 됩니다.',
    tags: ['연애/이별', '우울함', '외로움'],
  },
  {
    text: '이별은 나의 부족함을 증명하는 일이 아니에요. 한 관계가 끝났을 뿐, 당신의 사랑받을 자격이 사라진 건 아닙니다.',
    tags: ['연애/이별', '외로움'],
  },
  {
    text: '경제적인 어려움은 마음까지 작아지게 만들 수 있어요. 하지만 지금의 상황이 당신의 가능성을 정하는 것은 아닙니다.',
    tags: ['경제적 어려움', '불안', '우울함'],
  },
  {
    text: '지금은 여유가 없어 보여도, 버티고 있는 당신의 시간은 분명히 다음을 준비하는 힘이 되고 있습니다.',
    tags: ['경제적 어려움', '막막함'],
  },
];

/**
 * 진단 태그와 대나무숲 태그를 연결하는 매핑
 * 예: 시험 및 학업, 학업스트레스, 팀플 문제 → #학업
 */
const COMMUNITY_TAG_MAP = {
  '#시험및학업': '#학업',
  '시험및학업': '#학업',
  '#학업스트레스': '#학업',
  '학업스트레스': '#학업',
  '#팀플문제': '#학업',
  '팀플문제': '#학업',
  '#학업': '#학업',
  '학업': '#학업',

  '#진로고민': '#취업',
  '진로고민': '#취업',
  '#취업': '#취업',
  '취업': '#취업',

  '#면접': '#면접',
  '면접': '#면접',

  '#인간관계': '#인간관계',
  '인간관계': '#인간관계',
  '#가족갈등': '#인간관계',
  '가족갈등': '#인간관계',
  '#연애/이별': '#인간관계',
  '연애/이별': '#인간관계',

  '#경제적어려움': '#기타',
  '경제적어려움': '#기타',
  '#기타': '#기타',
  '기타': '#기타',
};

// 상황/감정 기반 장소 검색 키워드
const SITUATION_PLACE_KEYWORDS = {
  '시험 및 학업': ['힐링카페', '북카페', '조용한 카페', '독립서점', '꽃집'],
  '인간관계': ['독립서점', '힐링카페', '조용한 카페', '산책로'],
  '진로 고민': ['북카페', '전시회', '독립서점', '조용한 카페'],
  '면접': ['힐링카페', '공방', '전시회', '조용한 카페'],
  '팀플 문제': ['힐링카페', '코인노래방', '만화카페', '오락실'],
  '연애/이별': ['공방', '베이커리 카페', '독립서점', '산책로'],
  '경제적 어려움': ['도서관', '무료 전시회', '공원', '조용한 카페'],
  '가족 갈등': ['코인노래방', '독립서점', '힐링카페', '산책로'],
};

// 날씨에 따른 장소 추천 문구
const WEATHER_MESSAGE_MAP = {
  Clear: '맑고 상쾌한 날씨, 기분 전환 공간 추천',
  PartlyCloudy: '구름이 조금 있는 날씨, 가볍게 기분 전환하기 좋은 공간 추천',
  MostlyCloudy: '구름이 많은 날씨, 차분한 정서 완화 공간 추천',
  Clouds: '흐린 날씨, 차분한 정서 완화 공간 추천',
  Rain: '비 소식, 아늑한 실내 공간 추천',
  Drizzle: '비 소식, 아늑한 실내 공간 추천',
  Thunderstorm: '비 소식, 아늑한 실내 공간 추천',
  Snow: '하얀 눈, 따뜻한 실내 공간 추천',
};

// 날씨가 좋지 않을 때 야외 장소 키워드 제외
const BAD_WEATHER_TYPES = ['Rain', 'Snow', 'Thunderstorm', 'Clouds', 'Drizzle'];
const OUTDOOR_KEYWORDS = ['산책로', '수목원', '공원', '휴양림'];

//특정 게시글의 댓글 하위 컬렉션 참조 만듦
const getCommentsRef = (postId) => {
  return collection(db, POST_COLLECTION, postId, 'comments');
};

// Firestore Timestamp 객체를 밀리초로 변환
const getTimestampMillis = (timestamp) => {
  if (!timestamp) return 0;
  if (typeof timestamp.toMillis === 'function') return timestamp.toMillis();
  if (typeof timestamp.toDate === 'function') return timestamp.toDate().getTime();

  return 0;
};

// 대나무숲 게시글 최신순으로 정렬
const sortPostsByLatest = (posts) => {
  return [...posts].sort(
    (a, b) => getTimestampMillis(b.createdAt) - getTimestampMillis(a.createdAt)
  );
};

// 태그 비교하기 위해 공백 제거한 문자열로 정규화
const normalizeTagKey = (value) => {
  return String(value ?? '').trim().replace(/\s+/g, '');
};

// 태그 값에 #이 없으면 앞에 붙여서 해시태그로 변환
const toHashTag = (value) => {
  const trimmedValue = String(value ?? '').trim();

  if (!trimmedValue) return null;

  return trimmedValue.startsWith('#') ? trimmedValue : `#${trimmedValue}`;
};

// 감성, 상황, 게시글 태그를 익명 대나무숲 대표 태그로 변환
const getCommunityTag = (value) => {
  const hashTag = toHashTag(value);

  if (!hashTag) return null;

  const normalizedHashTag = normalizeTagKey(hashTag);
  const normalizedPlainTag = normalizedHashTag.replace(/^#/, '');

  return (
    COMMUNITY_TAG_MAP[normalizedHashTag] ||
    COMMUNITY_TAG_MAP[normalizedPlainTag] ||
    hashTag
  );
};

const getComparableCommunityTag = (value) => {
  const communityTag = getCommunityTag(value);

  if (!communityTag) return null;

  return normalizeTagKey(communityTag);
};

const getPostTagValues = (post) => {
  const tagValues = [];

  if (post.tag) {
    tagValues.push(post.tag);
  }

  if (Array.isArray(post.tags)) {
    tagValues.push(...post.tags);
  }

  return tagValues;
};

const isPostMatchedWithUserState = (post, userState) => {
  const targetTags = new Set(
    [
      getComparableCommunityTag(userState.situation),
      getComparableCommunityTag(userState.emotion),
    ].filter(Boolean)
  );

  const postTags = getPostTagValues(post)
    .map((tag) => getComparableCommunityTag(tag))
    .filter(Boolean);

  return postTags.some((tag) => targetTags.has(tag));
};

// 감정 또는 상황 태그와 일치하는 글귀 중 하나 랜덤으로 추천
const getRecommendedQuote = ({ emotion, situation }) => {
  const matchedQuotes = QUOTES_DB.filter((quote) => {
    return quote.tags.includes(situation) || quote.tags.includes(emotion);
  });

  if (matchedQuotes.length === 0) return DEFAULT_QUOTE;

  const randomIndex = Math.floor(Math.random() * matchedQuotes.length);
  return matchedQuotes[randomIndex].text;
};

//추천 음악 검색 URL 생성
const getYoutubeSearchUrl = (title, artist) => {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(
    `${artist} ${title}`
  )}`;
};

// 현재 위치 가져오고 실패하면 기본 위치 사용
const getCurrentLocation = () => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(DEFAULT_LOCATION);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({ lat: coords.latitude, lng: coords.longitude }),
      () => {
        console.error('위치 정보 접근 실패. 기본 위치로 진행합니다.');
        resolve(DEFAULT_LOCATION);
      },
      { timeout: 5000 }
    );
  });
};

// OpenWeatherMap에서 Clouds로 내려오더라도 구름량에 따라 날씨 상태를 세분화함
const getWeatherConditionKey = (weatherMain, cloudiness = 0) => {
  if (weatherMain === 'Clouds') {
    if (cloudiness <= 35) {
      return 'Clear';
    }

    if (cloudiness <= 60) {
      return 'PartlyCloudy';
    }

    if (cloudiness <= 85) {
      return 'MostlyCloudy';
    }

    return 'Clouds';
  }

  return weatherMain || 'Clear';
};

const fetchCurrentWeather = async (lat, lng) => {
  if (!OPENWEATHER_API_KEY) {
    console.error('OpenWeatherMap API 키가 설정되지 않았습니다.');
    return 'Clear';
  }

  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${OPENWEATHER_API_KEY}`
    );

    const weatherMain = response.data?.weather?.[0]?.main || 'Clear';
    const cloudiness = response.data?.clouds?.all ?? 0;

    return getWeatherConditionKey(weatherMain, cloudiness);
  } catch (error) {
    console.error('날씨 API 호출 실패. 기본 날씨값으로 진행합니다.', error);
    return 'Clear';
  }
};

// 감정에 따른 장소 추천 키워드
const getEmotionPlaceKeywords = (emotion) => {
  if (['우울함', '무기력', '외로움'].includes(emotion)) {
    return ['힐링카페', '꽃집', '산책로', '수목원'];
  }

  if (['불안', '조급함', '막막함'].includes(emotion)) {
    return ['미술관', '찻집', '독립서점'];
  }

  if (['지침 / 번아웃', '화남'].includes(emotion)) {
    return ['마사지', '힐링카페', '코인노래방', '휴양림'];
  }

  return [];
};

// 감정과 상황을 기반으로 추천 장소 키워드 생성
const getPlaceKeywords = (weather, { emotion, situation }) => {
  const situationKeywords = SITUATION_PLACE_KEYWORDS[situation] || ['힐링카페', '카페'];
  const emotionKeywords = getEmotionPlaceKeywords(emotion);
  let keywords = [...new Set([...situationKeywords, ...emotionKeywords])];

  if (BAD_WEATHER_TYPES.includes(weather)) {
    keywords = keywords.filter((keyword) => !OUTDOOR_KEYWORDS.includes(keyword));
  }

  return keywords.length > 0 ? keywords : ['실내 카페'];
};

// Kakao Map API를 사용하여 키워드 기반 장소 검색
const searchPlacesByKeyword = (placesService, keyword, location) => {
  return new Promise((resolve) => {
    placesService.keywordSearch(
      keyword,
      (data, status) => {
        if (status !== window.kakao.maps.services.Status.OK) {
          resolve([]);
          return;
        }

        const places = data.map((place) => ({
          id: place.id,
          name: place.place_name,
          lat: Number(place.y),
          lng: Number(place.x),
        }));

        resolve(places);
      },
      {
        location: new window.kakao.maps.LatLng(location.lat, location.lng),
        radius: PLACE_SEARCH_RADIUS,
      }
    );
  });
};

// 현재 위치와 날씨를 기반으로 카카오맵에서 방문 가능한 힐링 공간 최대 3개 추천
const searchRecommendedPlaces = async (weather, location, userState) => {
  if (!window.kakao?.maps?.services) return [];

  const placesService = new window.kakao.maps.services.Places();
  const keywords = getPlaceKeywords(weather, userState);
  const placeMap = new Map();

  for (const keyword of keywords) {
    const searchedPlaces = await searchPlacesByKeyword(placesService, keyword, location);

    searchedPlaces.forEach((place) => {
      if (!placeMap.has(place.id) && placeMap.size < 3) {
        placeMap.set(place.id, place);
      }
    });

    if (placeMap.size >= 3) break;
  }

  return Array.from(placeMap.values());
};

// 대나무숲 글 추천
const fetchMatchedPosts = async (userState) => {
  const postsRef = collection(db, POST_COLLECTION);
  const querySnapshot = await getDocs(postsRef);

  const posts = querySnapshot.docs.map((postDoc) => ({
    id: postDoc.id,
    ...postDoc.data(),
  }));

  const matchedPosts = posts.filter((post) => {
    return isPostMatchedWithUserState(post, userState);
  });

  return sortPostsByLatest(matchedPosts);
};

const getMusicFromComment = (commentData) => {
  if (commentData.music?.title && commentData.music?.artist) {
    return {
      title: String(commentData.music.title).trim(),
      artist: String(commentData.music.artist).trim(),
    };
  }

  if (commentData.musicTitle && commentData.musicArtist) {
    return {
      title: String(commentData.musicTitle).trim(),
      artist: String(commentData.musicArtist).trim(),
    };
  }

  return null;
};

// 관련 대나무숲 글의 댓글에 첨부된 음악을 분석하여 추천 음악을 선정
const fetchRecommendedMusic = async (posts) => {
  const musicScores = {};

  await Promise.all(
    posts.map(async (post) => {
      const hugCount = post.hugCount || 0;
      const commentSnapshot = await getDocs(getCommentsRef(post.id));

      commentSnapshot.forEach((commentDoc) => {
        const music = getMusicFromComment(commentDoc.data());

        if (!music?.title || !music?.artist) return;

        const musicKey = `${music.artist}-${music.title}`;

        if (!musicScores[musicKey]) {
          musicScores[musicKey] = { ...music, score: 0 };
        }

        musicScores[musicKey].score += 1 + hugCount;
      });
    })
  );

  const sortedMusic = Object.values(musicScores).sort((a, b) => b.score - a.score);
  return sortedMusic[0] || DEFAULT_MUSIC;
};

const getWeatherMessage = (weatherCondition) => {
  return WEATHER_MESSAGE_MAP[weatherCondition] || '오늘의 날씨 맞춤 공간 추천';
};

// 추천 장소가 없을 때 사용할 기본 장소 객체 생성
const createFallbackPlace = (location) => ({
  id: 'fallback-place',
  name: '근처에 추천 장소가 없습니다.',
  lat: location.lat,
  lng: location.lng,
});

const Consolation_result = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const userState = useMemo(
    () => ({
      emotion: location.state?.emotion || '우울함',
      situation: location.state?.situation || '진로 고민',
    }),
    [location.state?.emotion, location.state?.situation]
  );

  const recommendedQuote = useMemo(() => getRecommendedQuote(userState), [userState]);

  const [myLocation, setMyLocation] = useState(DEFAULT_LOCATION);
  const [weatherCondition, setWeatherCondition] = useState('Clear');
  const [recommendedPlaces, setRecommendedPlaces] = useState([]);

  const [recommendedPosts, setRecommendedPosts] = useState([]);
  const [recommendedMusic, setRecommendedMusic] = useState(DEFAULT_MUSIC);

  const [isSearchingPlaces, setIsSearchingPlaces] = useState(true);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(true);

  const [kakaoLoading, kakaoError] = useKakaoLoader({
    appkey: KAKAO_MAP_API_KEY,
    libraries: ['services'],
  });

  // 대나무숲 게시글과 댓글에 첨부된 음악을 분석하여 맞춤 추천을 만듦
  useEffect(() => {
    let isActive = true;

    const loadCommunityRecommendations = async () => {
      try {
        setIsLoadingRecommendations(true);

        const matchedPosts = await fetchMatchedPosts(userState);
        const music = await fetchRecommendedMusic(matchedPosts);

        if (!isActive) return;

        setRecommendedPosts(matchedPosts.slice(0, 3));
        setRecommendedMusic(music);
      } catch (error) {
        console.error('추천 데이터 불러오기 실패:', error);

        if (isActive) {
          setRecommendedPosts([]);
          setRecommendedMusic(DEFAULT_MUSIC);
        }
      } finally {
        if (isActive) setIsLoadingRecommendations(false);
      }
    };

    loadCommunityRecommendations();

    return () => {
      isActive = false;
    };
  }, [userState]);

  // 현재 위치와 날씨를 기반으로 카카오맵에서 방문 가능한 힐링 공간을 검색
  useEffect(() => {
    if (kakaoLoading || kakaoError) return undefined;

    let isActive = true;

    const loadWeatherAndPlaces = async () => {
      try {
        setIsSearchingPlaces(true);

        const currentLocation = await getCurrentLocation();
        const weather = await fetchCurrentWeather(currentLocation.lat, currentLocation.lng);
        const places = await searchRecommendedPlaces(weather, currentLocation, userState);

        if (!isActive) return;

        setMyLocation(currentLocation);
        setWeatherCondition(weather);
        setRecommendedPlaces(places.length > 0 ? places : [createFallbackPlace(currentLocation)]);
      } catch (error) {
        console.error('힐링 공간 추천 실패:', error);

        if (isActive) {
          setRecommendedPlaces([createFallbackPlace(DEFAULT_LOCATION)]);
        }
      } finally {
        if (isActive) setIsSearchingPlaces(false);
      }
    };

    loadWeatherAndPlaces();

    return () => {
      isActive = false;
    };
  }, [kakaoLoading, kakaoError, userState]);

  const handleDiagnosisAgain = () => {
    navigate('/consolation');
  };

  const handleMusicPlay = () => {
    if (!recommendedMusic) return;

    window.open(
      getYoutubeSearchUrl(recommendedMusic.title, recommendedMusic.artist),
      '_blank',
      'noopener,noreferrer'
    );
  };

  if (kakaoError) {
    return (
      <div className="min-h-screen flex items-center justify-center font-bold text-red-500 text-sm md:text-base">
        지도 로딩에 실패했습니다. Kakao Map API 키를 확인해주세요.
      </div>
    );
  }

  if (kakaoLoading || isSearchingPlaces) {
    return (
      <div className="min-h-screen flex items-center justify-center font-bold text-[#1D2EE5] text-sm md:text-xl">
        쉼표가 맞춤형 힐링 공간을 찾는 중입니다... ☕
      </div>
    );
  }

  return (
    <main className="w-full max-w-6xl mx-auto pt-10 md:pt-16 pb-12 px-4 md:px-6">
      <section className="text-left mb-6 md:mb-10 px-1 md:px-2">
        <h1 className="text-2xl md:text-4xl font-bold text-[#1D2EE5] mb-2 md:mb-3">
          정서 케어 서비스 결과
        </h1>
        <p className="text-gray-500 text-sm md:text-lg leading-relaxed break-keep">
          <span className="font-bold text-[#1D2EE5]">[{userState.emotion}]</span>
          {' '}감정과{' '}
          <span className="font-bold text-[#1D2EE5]">
            [{userState.situation}]
          </span>
          {' '}상황을 겪고 계신 당신을 위한 처방입니다.
        </p>
      </section>

      <section className="bg-white rounded-2xl p-6 md:p-10 shadow-sm w-full flex flex-col gap-8 md:gap-10 border border-gray-100">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="flex flex-col gap-8 md:gap-10">
            <div>
              <h2 className="text-base md:text-lg font-bold text-[#1D2EE5] mb-3 flex items-center">
                <span className="w-1.5 h-1.5 bg-[#1D2EE5] rounded-full mr-2" />
                추천 음악
              </h2>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <p className="text-base md:text-xl font-bold text-black wrap-break-word leading-snug">
                  {isLoadingRecommendations
                    ? '음악을 분석 중입니다.'
                    : `${recommendedMusic.artist} - ${recommendedMusic.title}`}
                </p>
                <button
                  type="button"
                  onClick={handleMusicPlay}
                  disabled={isLoadingRecommendations}
                  className="w-full sm:w-auto bg-[#3D46AA] text-white px-4 py-2.5 md:py-2 rounded-lg font-bold hover:bg-[#3D46AA]/90 transition-all text-sm whitespace-nowrap shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  음악 들으러 가기
                </button>
              </div>
            </div>

            <div>
              <h2 className="text-base md:text-lg font-bold text-[#1D2EE5] mb-3 flex items-center">
                <span className="w-1.5 h-1.5 bg-[#1D2EE5] rounded-full mr-2" />
                추천 글귀
              </h2>
              <p className="text-base md:text-xl font-bold text-black leading-relaxed break-keep">
                {recommendedQuote}
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-base md:text-lg font-bold text-[#1D2EE5] mb-3 flex items-center">
              <span className="w-1.5 h-1.5 bg-[#1D2EE5] rounded-full mr-2" />
              익명 대나무숲
            </h2>

            <div className="flex flex-col gap-3">
              {isLoadingRecommendations ? (
                <p className="text-gray-400 py-4 text-sm md:text-base">
                  비슷한 대나무숲 글을 분석 중입니다...
                </p>
              ) : recommendedPosts.length === 0 ? (
                <p className="text-gray-400 py-4 text-sm md:text-base">
                  해당 상황에 대한 글이 아직 없습니다.
                </p>
              ) : (
                recommendedPosts.map((post) => (
                  <button
                    key={post.id}
                    type="button"
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

        <div>
          <h2 className="text-base md:text-lg font-bold text-[#1D2EE5] mb-3 md:mb-4 flex flex-col md:flex-row md:items-center items-start gap-1 md:gap-0">
            <span className="flex items-center">
              <span className="w-1.5 h-1.5 bg-[#1D2EE5] rounded-full mr-2" />
              힐링 공간
            </span>
            <span className="text-xs md:text-sm font-normal text-gray-500 md:ml-3 pl-3 md:pl-0 break-keep">
              ({getWeatherMessage(weatherCondition)})
            </span>
          </h2>

          <div className="flex flex-col lg:flex-row w-full rounded-xl overflow-hidden shadow-sm border border-gray-200 h-auto lg:h-100">
            <div className="w-full lg:flex-1 h-64 sm:h-80 lg:h-full bg-gray-100 relative">
              <KakaoMap center={myLocation} style={{ width: '100%', height: '100%' }} level={5}>
                <MapMarker position={myLocation}>
                  <div
                    style={{
                      padding: '5px',
                      color: '#E71616',
                      fontSize: '11px',
                      textAlign: 'center',
                      width: '100px',
                      fontWeight: 'bold',
                    }}
                  >
                    📍 현재 내 위치
                  </div>
                </MapMarker>

                {recommendedPlaces.map((place, index) => (
                  <MapMarker
                    key={place.id || `${place.name}-${index}`}
                    position={{ lat: place.lat, lng: place.lng }}
                  >
                    <div className="p-1 text-black text-[10px] md:text-xs text-center w-24 md:w-32 font-bold truncate">
                      {place.name}
                    </div>
                  </MapMarker>
                ))}
              </KakaoMap>
            </div>

            <div className="w-full lg:w-1/3 bg-[#9299E5] p-5 md:p-8 flex flex-col justify-center gap-4 md:gap-5 text-white h-auto lg:h-full">
              {recommendedPlaces.map((place, index) => (
                <div
                  key={place.id || `${place.name}-${index}`}
                  className="flex items-center gap-3 font-bold text-sm md:text-base leading-snug"
                >
                  <span className="w-1.5 h-1.5 bg-white rounded-full shrink-0" />
                  {place.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="mt-8 md:mt-10 flex justify-center md:justify-start px-2">
        <button
          type="button"
          onClick={handleDiagnosisAgain}
          className="w-full md:w-auto px-8 py-3.5 bg-[#3D46AA] text-white rounded-xl font-bold text-base md:text-lg hover:bg-[#3D46AA]/90 transition-all shadow-sm"
        >
          다시 진단하기
        </button>
      </div>
    </main>
  );
};

export default Consolation_result;