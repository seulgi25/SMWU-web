//components/Header.jsx를 Home.jsx에서 불러와서 App.jsx에서 Header 컴포넌트를 사용하도록 수정했습니다. Home.jsx는 현재 비어있지만, 나중에 홈 페이지의 내용을 추가할 수 있습니다.
//이 Home.jsx는 이 프로젝트의 홈 화면을 나타냅니다.
//Header와 Footer는 각각 화면의 맨 위와 아래에 고정된 위치에 있습니다.
//Header와 Footer를 제외하고 전체 배경화면의 색상은 '#F8F7EC'입니다.
//먼저 Header 아래에 '#3D46AA' 색으로 1360 x 341로 배너를 만듭니다.
//그 배너 안에는 흰색 글씨로 '지친 하루의 끝, // 당신만을 위한 작은 쉼표.' 라는 문구가 들어가고 그것보다 크기가 작게 '누구에게도 말 못한 고민 이곳에선 안전하게 내려놓으셔도 됩니다.'라는 문구가 들어갑니다. 그 후 '정서 케어 서비스 받기->'라는 버튼이 있고 그 버튼을 누르면 Consolation.jsx로 이동할 수 있도록 합니다.
//모든 디자인은 tailwindscss를 사용합니다.
//Header.jsx는 화면의 상단에 고정하고, Footer.jsx는 화면의 하단에 고정합니다. Home.jsx의 배경색은 '#F8F7EC'로 설정합니다.
//Hedaer.jsx와 Footer.jsx의 배경색은 흰색으로 설정합니다. Home.jsx의 배경색은 '#F8F7EC'로 설정합니다.
//날씨 및 공감 키워드는 한 줄로 나열한다. 날씨는 왼쪽에 위치한다. 공감 키워드는 오른쪽에 위치한다. 날씨와 공감 키워드 사이에는 일정 간격이 존재한다.
//날씨는 '천안시 서북구'라는 위치 정보와 '비 (Rain)'이라는 날씨 정보로 구성한다. 날씨 정보 옆에는 구름과 빗방울 아이콘이 연출된다.
//공감 키워드는 '#인간관계', '#학업스트레스', '#면접'이라는 3가지 키워드로 구성한다. 공감 키워드는 각각 회색 배경에 둥근 모서리를 가진 태그 형태로 디자인한다.
//날씨는 '#4D5EF6' 배경에 흰색 글씨로 구성한다. 공감 키워드는 흰색 배경에 회색 글씨로 구성한다. 날씨와 공감 키워드 카드는 모두 둥근 모서리를 가진 카드 형태로 디자인한다.
//날씨와 공감 키워드가 한 줄로 나열되게 하고 두 요소는 둥근 모서리를 가진 카드 형태로 디자인한다. 날씨는 '#4D5EF6' 배경에 흰색 글씨로 구성한다. 공감 키워드는 흰색 배경에 회색 글씨로 구성한다.
//공감 키워드는 '#인간관계', '#학업스트레스', '#면접'이라는 3가지 키워드로 구성한다. 공감 키워드는 각각 회색 배경에 둥근 모서리를 가진 태그 형태로
//3가지 핵심 기능은 가로로 1열로 배치한다. 각 기능은 '맞춤 위로 진단', '익명 대나무숲', '비밀 일기장'이라는 이름과 함께 간단한 설명이 들어간 카드 형태로 디자인한다. 각 카드는 클릭할 수 있도록 하며, 클릭 시 각각 '/consolation', '/secret_forest', '/secret_note' 경로로 이동하도록 한다.
//Home.jsx의 배경색은 '#F8F7EC'로 설정한다. Home.jsx는 Header와 Footer 사이에 위치한다.
//'맞춤 위로 진단', '익명 대나무숲' 비밀일기장' 카드를 각각 누르면 'Consolation.jsx', 'Secret_forest.jsx', 'Secret_note.jsx'로 이동하도록 설정한다. Home.jsx의 배경색은 '#F8F7EC'로 설정한다. Home.jsx는 Header와 Footer 사이에 위치한다.
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    // 사진 속 레이아웃처럼 화면 전체 폭을 유연하게 감싸고, space-y-8로 세로 간격을 넓히기.
    <div className="w-full max-w-7xl mx-auto space-y-8 pt-10 pb-12 px-4">
      
      {/* [1] 메인 배너 영역: 둥근 모서리와 은은한 그림자만 사용 (테두리 선 아예 없음) */}
      <div className="w-full bg-[#3D46AA] rounded-2xl p-10 md:p-14 flex flex-col items-start justify-center gap-4 shadow-sm">
        <h1 className="text-3xl font-bold text-white leading-tight">
          지친 하루의 끝,<br />당신만을 위한 작은 쉼표.
        </h1>
        <p className="text-base text-gray-200">
          누구에게도 말 못한 고민 이곳에선 안전하게 내려놓으셔도 됩니다.
        </p>
        <button 
          onClick={() => navigate("/consolation")}
          className="mt-2 px-6 py-2.5 bg-white text-[#3D46AA] rounded-full font-semibold text-sm hover:bg-gray-100 transition-all shadow-sm cursor-pointer"
        >
          정서 케어 서비스 받기 &rarr;
        </button>
      </div>

      {/* [2] 중간 단: 날씨 카드와 실시간 키워드를 가로로 '한 줄에 배치'하고 사이 간격 넓히기. */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 왼쪽: 날씨 카드 (#4D5EF6 배경) */}
        <div className="w-full bg-[#4D5EF6] text-white rounded-2xl p-8 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-sm opacity-80">천안시 서북구</p>
            <h2 className="text-3xl font-bold">비 (Rain)</h2>
          </div>
          <div className="text-5xl flex flex-col items-center">
            <h1>🌧️</h1>
            <span className="text-[10px] mt-1 tracking-widest opacity-70 font-mono">////</span>
          </div>
        </div>

        {/* 오른쪽: 실시간 공감 키워드 카드 (흰색 배경, 둥근 모서리, 알약 모양 태그 배치) */}
        <div className="w-full bg-white rounded-2xl p-8 flex flex-col justify-center gap-4 shadow-sm">
          <h3 className="text-sm font-bold text-red-500">실시간 공감 키워드</h3>
          <div className="flex flex-wrap gap-2.5">
            <span className="px-4 py-1.5 bg-[#EFEFEF] text-xs text-gray-600 rounded-full font-medium">#인간관계</span>
            <span className="px-4 py-1.5 bg-[#EFEFEF] text-xs text-gray-600 rounded-full font-medium">#학업스트레스</span>
            <span className="px-4 py-1.5 bg-[#EFEFEF] text-xs text-gray-600 rounded-full font-medium">#면접</span>
          </div>
        </div>

      </div>

      {/* [3] 하단 단: 3가지 핵심 기능 카드를 가로로 '한 줄에 3개 배치'하고 gap-6으로 띄우기. */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        
        {/* 카드 1: 맞춤 위로 진단 (클릭 시 /consolation 이동) */}
        <div 
          onClick={() => navigate("/consolation")}
          className="bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col items-center justify-center h-36 gap-2"
        >
          <h4 className="font-bold text-gray-800 text-base">맞춤 위로 진단</h4>
          <p className="text-xs text-gray-400">현재 감정과 상황을 고려한 정서 케어 서비스</p>
        </div>

        {/* 카드 2: 익명 대나무숲 (클릭 시 /secret_forest 이동) */}
        <div 
          onClick={() => navigate("/secret_forest")}
          className="bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col items-center justify-center h-36 gap-2"
        >
          <h4 className="font-bold text-gray-800 text-base">익명 대나무숲</h4>
          <p className="text-xs text-gray-400">정량적 수치 없는 온전한 연대</p>
        </div>

        {/* 카드 3: 비밀 일기장 (클릭 시 /secret_note 이동) */}
        <div 
          onClick={() => navigate("/secret_note")}
          className="bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col items-center justify-center h-36 gap-2"
        >
          <h4 className="font-bold text-gray-800 text-base">비밀 일기장</h4>
          <p className="text-xs text-gray-400">나만 보는 시크릿 기록</p>
        </div>

      </div>

    </div>
  );
};

export default Home;