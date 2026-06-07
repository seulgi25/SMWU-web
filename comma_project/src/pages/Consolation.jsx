//마음 상태 진단 (맞춤 위로) 페이지
//'마음 상태 진단 // 현재의 기분과 상황을 솔직하게 체크해 주세요. '라는 문구가 Header.jsx 아래에 위치해 있습니다. 이 문구는 '로그인'은 크고 굵은 파란색으로, '다시 마음에 편안한 쉼표를 찍어보세요.'는 회색 글씨로('로그인' 단어보다 작게) 디자인되어 있습니다.
//흰색 둥근 박스 안에는 내면의 감정과 현실의 상황을 클릭할 수 있는 버튼 칩이 있습니다.
//내면의 감정 버튼 칩에는 '우울함', '지침/번아웃', '불안', '막막함', '화남' 버튼이 있씁니다.
//현실의 상황 버튼 칩에는 '시험 및 학업', '인간관계', '진로 고민', '면접', '팀플 문제' 버튼이 있습니다.
//각 버튼 칩은 클릭할 수 있으며 내면의 감정 버튼 한개와 현실의 상황 버튼 한개를 클릭할 수 있습니다.
//버튼의 색상은 평소에는 '#D9D9D9'에 검정색 글씨였다가 버튼을 클릭하면 '#1D2EE5' 배경에 흰색 글씨로 바뀌도록 설정되어 있습니다.
//'내면의 감정' 문구 바로 아래에 '내면의 감정' 버튼 칩들이, '현실의 상황' 문구 바로 아래에 '현실의 상황' 버튼 칩들이 각각 일정 간격을 두고 나란히 위치합니다.
//흰색 둥근 박스의 가장 아래에는 '정서 케어 서비스 결과 보기' 버튼이 있습니다. 이 버튼의 색상은 '#3D46AA' 배경에 흰색 글씨로 설정되어 있습니다.
//'정서 케어 서비스 결과 보기' 버튼을 누르면 './pages/Consolation_result'로 이동하도록 설정되어 있습니다.
//모든 디자인은 Tailwind CSS로 구현됩니다.
// Consolation.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Consolation = () => {
    const navigate = useNavigate();

    const [selectedEmotion, setSelectedEmotion] = useState(null);
    const [selectedSituation, setSelectedSituation] = useState(null);

    const emotions = ['우울함', '지침 / 번아웃', '불안', '막막함', '화남', '외로움', '무기력', '조급함'];
    const situations = ['시험 및 학업', '인간관계', '진로 고민', '면접', '팀플 문제', '연애/이별', '경제적 어려움', '가족 갈등'];

    const handleResultClick = () => {
        if (!selectedEmotion || !selectedSituation) {
            alert("감정과 상황을 모두 선택해주세요.");
            return;
        }
        // 🌟 선택된 감정과 상황 데이터를 state에 담아 결과 페이지로 전달합니다.
        navigate('/consolation_result', { 
            state: { emotion: selectedEmotion, situation: selectedSituation } 
        });
    };

    return (
        // 🌟 상하 여백 모바일에 맞게 조절
        <div className="w-full max-w-5xl mx-auto pt-10 md:pt-16 pb-12 px-4 md:px-6">
            
            <div className="text-left mb-6 md:mb-8 px-1 md:px-2">
                <h1 className="text-3xl md:text-4xl font-bold text-[#1D2EE5] mb-1 md:mb-2">마음 상태 진단</h1>
                <p className="text-gray-500 text-sm md:text-lg">현재의 기분과 상황을 솔직하게 체크해 주세요.</p>
            </div>

            {/* 🌟 메인 하얀 박스 여백 조절 (p-10 -> p-6) */}
            <div className="bg-white rounded-2xl p-6 md:p-14 shadow-sm w-full border border-gray-100">
                
                <div className="mb-8 md:mb-12">
                    <h2 className="text-lg md:text-xl font-bold text-black mb-4 md:mb-6 flex items-center">
                        <span className="w-1.5 h-1.5 bg-black rounded-full mr-2 md:mr-3"></span>
                        내면의 감정
                    </h2>
                    {/* 🌟 모바일에서는 pl-4(들여쓰기)를 없애고 gap을 줄여 버튼이 많이 들어가게 함 */}
                    <div className="flex flex-wrap gap-2 md:gap-4 md:pl-4">
                        {emotions.map((emotion) => (
                            <button
                                key={emotion}
                                onClick={() => setSelectedEmotion(emotion)}
                                // 🌟 버튼 패딩 및 글씨 크기 다이어트
                                className={`px-3.5 py-2 md:px-6 md:py-3 rounded-lg md:rounded-xl font-bold text-sm md:text-base transition-all ${
                                    selectedEmotion === emotion 
                                    ? 'bg-[#1D2EE5] text-white shadow-sm' 
                                    : 'bg-[#E3E3E3] text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                {emotion}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mb-10 md:mb-14">
                    <h2 className="text-lg md:text-xl font-bold text-black mb-4 md:mb-6 flex items-center">
                        <span className="w-1.5 h-1.5 bg-black rounded-full mr-2 md:mr-3"></span>
                        현실의 상황
                    </h2>
                    <div className="flex flex-wrap gap-2 md:gap-4 md:pl-4">
                        {situations.map((situation) => (
                            <button
                                key={situation}
                                onClick={() => setSelectedSituation(situation)}
                                className={`px-3.5 py-2 md:px-6 md:py-3 rounded-lg md:rounded-xl font-bold text-sm md:text-base transition-all ${
                                    selectedSituation === situation 
                                    ? 'bg-[#1D2EE5] text-white shadow-sm' 
                                    : 'bg-[#E3E3E3] text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                {situation}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 🌟 결과 보기 버튼 다이어트 */}
                <button 
                    onClick={handleResultClick}
                    className="w-full py-3.5 md:py-4 bg-[#3D46AA] text-white rounded-xl font-bold text-base md:text-xl hover:bg-opacity-90 transition-all shadow-sm"
                >
                    정서 케어 서비스 결과 보기
                </button>
                
            </div>
        </div>
    );
};

export default Consolation;