/**
 * Home.jsx
 *
 * 쉼표 웹서비스의 메인 홈 화면 컴포넌트입니다.
 * 사용자가 서비스의 핵심 기능으로 빠르게 이동할 수 있도록
 * 메인 배너, 현재 위치 기반 날씨, 실시간 공감 키워드,
 * 주요 기능 카드 영역을 제공합니다.
 *
 * - OpenWeatherMap API: 현재 위치 기반 날씨 표시
 * - Firestore: 최근 대나무숲 게시글 태그를 분석하여 공감 키워드 표시
 * - React Router: 주요 기능 페이지로 이동
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
} from 'firebase/firestore';
import { db } from '../firebase';

const OPENWEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

// 날씨 정보 불러오기 전에 기본값으로 보여줄 데이터와 API 호출 실패 시 보여줄 대체 데이터를 정의
const DEFAULT_WEATHER = {
  location: '위치 파악 중...',
  condition: '날씨 로딩 중...',
  emoji: '☀️',
};

const WEATHER_ERROR_FALLBACK = {
  location: '위치 확인 불가',
  condition: '맑음',
  emoji: '☀️',
};

// OpenWeatherMap의 날씨 상태값을 화면에 표시할 문구와 이모지로 변환하기 위해 매핑함
const WEATHER_INFO_MAP = {
  Clear: { emoji: '☀️', condition: '맑음' },
  Rain: { emoji: '🌧️', condition: '비' },
  Drizzle: { emoji: '🌦️', condition: '가벼운 비' },
  Thunderstorm: { emoji: '⚡', condition: '천둥번개' },
  Snow: { emoji: '❄️', condition: '눈' },
  Mist: { emoji: '🌫️', condition: '안개/미세먼지' },
  Smoke: { emoji: '🌫️', condition: '안개/미세먼지' },
  Haze: { emoji: '🌫️', condition: '안개/미세먼지' },
  Dust: { emoji: '🌫️', condition: '안개/미세먼지' },
  Fog: { emoji: '🌫️', condition: '안개/미세먼지' },
};

// 대나무숲의 태그 데이터가 없을 때 보여줄 기본 태그 목록을 정의
const DEFAULT_TAGS = ['#쉼표', '#공감', '#이야기'];

// 홈화면에서 주요 기능 페이지로 이동하기 위한 카드 데이터
const FEATURE_CARDS = [
  {
    title: '맞춤 위로 진단',
    description: '현재 감정과 상황을 고려한 정서 케어 서비스',
    path: '/consolation',
  },
  {
    title: '익명 대나무숲',
    description: '정량적 수치 없는 온전한 연대',
    path: '/secret_forest',
  },
  {
    title: '비밀 일기장',
    description: '나만 보는 시크릿 기록',
    path: '/secret_note',
  },
];

// Firestore에 저장된 유사한 태그명을 홈 화면에서는 하나의 대표 태그로 표시
const TAG_NAME_MAP = {
  '#학업스트레스': '#학업',
  '#학업 스트레스': '#학업',
};

// OpenWeatherMap에서 Clouds로 내려오더라도 구름량에 따라 표시 문구를 세분화
const getWeatherInfo = (weatherMain, cloudiness = 0) => {
  if (weatherMain === 'Clouds') {
    if (cloudiness <= 35) {
      return { emoji: '☀️', condition: '맑음' };
    }

    if (cloudiness <= 60) {
      return { emoji: '⛅', condition: '구름 조금' };
    }

    if (cloudiness <= 85) {
      return { emoji: '☁️', condition: '구름 많음' };
    }

    return { emoji: '☁️', condition: '흐림' };
  }

  return WEATHER_INFO_MAP[weatherMain] || WEATHER_INFO_MAP.Clear;
};

// 현재 위치의 위도오와 경도를 받아 OpenWeatherMap API를 호출할 URL을 생성
const getWeatherApiUrl = (latitude, longitude) => {
  const params = new URLSearchParams({
    lat: String(latitude),
    lon: String(longitude),
    appid: OPENWEATHER_API_KEY,
    units: 'metric',
  });

  return `https://api.openweathermap.org/data/2.5/weather?${params.toString()}`;
};

// Firestore에 저장된 태그를 화면에 표시할 형태로 포맷팅
const formatTag = (tag) => {
  const trimmedTag = String(tag ?? '').trim();

  if (!trimmedTag) return null;

  const formattedTag = trimmedTag.startsWith('#')
    ? trimmedTag
    : `#${trimmedTag}`;

  return TAG_NAME_MAP[formattedTag] || formattedTag;
};

// 최근 대나무숲 게시글의 태그를 분석하여 상위 3개의 공감 키워드를 추출
const extractTopTags = (querySnapshot) => {
  const tagCounts = {};

  querySnapshot.forEach((doc) => {
    const postData = doc.data();
    const tags = postData.tags;

    if (!Array.isArray(tags)) return;

    tags.forEach((tag) => {
      const formattedTag = formatTag(tag);

      if (!formattedTag) return;

      tagCounts[formattedTag] = (tagCounts[formattedTag] || 0) + 1;
    });
  });

  return Object.entries(tagCounts)
    .sort(([, countA], [, countB]) => countB - countA)
    .map(([tag]) => tag)
    .slice(0, 3);
};

const Home = () => {
  const navigate = useNavigate();

  const [weather, setWeather] = useState(DEFAULT_WEATHER);
  const [topTags, setTopTags] = useState([]);
  const [isLoadingTags, setIsLoadingTags] = useState(true);

  const tagsToRender = topTags.length > 0 ? topTags : DEFAULT_TAGS;

  // 사용자의 현재 위치를 기반으로 OpenWeatherMap API에서 날씨 정보를 가져옴.
  useEffect(() => {
    let isActive = true;

    const updateWeatherByCurrentLocation = async (latitude, longitude) => {
      try {
        const response = await axios.get(getWeatherApiUrl(latitude, longitude));
        const weatherMain = response.data?.weather?.[0]?.main;
        const cloudiness = response.data?.clouds?.all ?? 0;
        const cityName = response.data?.name || '현재 위치';
        const { condition, emoji } = getWeatherInfo(weatherMain, cloudiness);

        if (!isActive) return;

        setWeather({
          location: cityName,
          condition,
          emoji,
        });
      } catch (error) {
        console.error('날씨 정보 불러오기 실패:', error);

        if (isActive) {
          setWeather(WEATHER_ERROR_FALLBACK);
        }
      }
    };

    // API 키가 없거나 위치 정보 접근이 불가능한 경우, 기본 날씨 정보를 보여줌.
    if (!OPENWEATHER_API_KEY) {
      console.error('OpenWeatherMap API 키가 설정되지 않았습니다.');
      setWeather(WEATHER_ERROR_FALLBACK);

      return () => {
        isActive = false;
      };
    }

    if (!navigator.geolocation) {
      console.error('현재 브라우저에서는 위치 정보 기능을 지원하지 않습니다.');
      setWeather(WEATHER_ERROR_FALLBACK);

      return () => {
        isActive = false;
      };
    }

    // 사용자의 현재 위치를 가져와서 날씨 정보를 업데이트
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        updateWeatherByCurrentLocation(coords.latitude, coords.longitude);
      },
      (error) => {
        console.error('위치 정보 접근 실패:', error);

        if (isActive) {
          setWeather({
            location: '위치 차단됨',
            condition: '맑음',
            emoji: '☀️',
          });
        }
      }
    );

    return () => {
      isActive = false;
    };
  }, []);

  // 최근 대나무숲 게시글의 태그를 분석하여 상위 3개의 공감 키워드를 보여줌.
  useEffect(() => {
    const postsRef = collection(db, 'secret_forest_list');
    const recentPostsQuery = query(
      postsRef,
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(
      recentPostsQuery,
      (querySnapshot) => {
        setTopTags(extractTopTags(querySnapshot));
        setIsLoadingTags(false);
      },
      (error) => {
        console.error('실시간 공감 키워드 분석 실패:', error);
        setIsLoadingTags(false);
      }
    );

    return unsubscribe;
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pt-10 pb-12 px-4">
      {/* 메인 배너: 서비스의 핵심 메시지와 맞춤 위로 페이지 진입 버튼 */}
      <section className="w-full bg-[#3D46AA] rounded-2xl p-10 md:p-14 flex flex-col items-start justify-center gap-4 shadow-sm">
        <h1 className="text-3xl font-bold text-white leading-tight">
          지친 하루의 끝,
          <br />
          당신만을 위한 작은 쉼표.
        </h1>

        <p className="text-base text-gray-200">
          누구에게도 말 못한 고민 이곳에선 안전하게 내려놓으셔도 됩니다.
        </p>

        <button
          type="button"
          onClick={() => navigate('/consolation')}
          className="mt-2 px-6 py-2.5 bg-white text-[#3D46AA] rounded-full font-semibold text-sm hover:bg-gray-100 transition-all shadow-sm cursor-pointer"
        >
          정서 케어 서비스 받기 &rarr;
        </button>
      </section>

      {/* 현재 날씨와 대나무숲 기반 공감 키워드 영역 */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="w-full bg-[#4D5EF6] text-white rounded-2xl p-8 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-sm opacity-80">{weather.location}</p>
            <h2 className="text-3xl font-bold capitalize">
              {weather.condition}
            </h2>
          </div>

          <div className="text-5xl flex flex-col items-center">
            <span role="img" aria-label={weather.condition}>
              {weather.emoji}
            </span>
            {['비', '가벼운 비'].includes(weather.condition) && (
              <span className="text-xs mt-1 opacity-80">
                ///
              </span>
            )}
          </div>
        </div>

        <div className="w-full bg-white rounded-2xl p-8 flex flex-col justify-center gap-4 shadow-sm">
          <h3 className="text-sm font-bold text-red-500">
            실시간 공감 키워드
          </h3>

          <div className="flex flex-wrap gap-2.5">
            {isLoadingTags ? (
              <p className="text-xs text-gray-400">
                대나무숲 트렌드 분석 중...
              </p>
            ) : (
              tagsToRender.map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-1.5 bg-[#EFEFEF] text-xs text-gray-600 rounded-full font-medium"
                >
                  {tag}
                </span>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 주요 기능 카드: 홈에서 핵심 서비스로 이동 */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        {FEATURE_CARDS.map(({ title, description, path }) => (
          <button
            key={path}
            type="button"
            onClick={() => navigate(path)}
            className="bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col items-center justify-center h-36 gap-2 border-none"
          >
            <h4 className="font-bold text-gray-800 text-base">{title}</h4>
            <p className="text-xs text-gray-400">{description}</p>
          </button>
        ))}
      </section>
    </div>
  );
};

export default Home;