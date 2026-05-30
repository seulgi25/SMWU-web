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
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Consolation = () => {
    const navigate = useNavigate();

    // 사용자가 선택한 감정과 상황을 기억하는 State (기본값은 아무것도 선택하지 않은 null)
    const [selectedEmotion, setSelectedEmotion] = useState(null);
    const [selectedSituation, setSelectedSituation] = useState(null);

    // 버튼 목록 데이터
    const emotions = ['우울함', '지침 / 번아웃', '불안', '막막함', '화남', '외로움', '무기력', '조급함'];
    const situations = ['시험 및 학업', '인간관계', '진로 고민', '면접', '팀플 문제', '연애/이별', '경제적 어려움', '가족 갈등'];

    // 결과 보기 버튼 클릭 시 실행되는 함수
    const handleResultClick = () => {
        //둘 다 선택할 시에만 넘어갈 수 있음
        if (!selectedEmotion || !selectedSituation) {
            alert("감정과 상황을 모두 선택해주세요.");
            return;
        }
        navigate('/consolation_result');
    };

    return (
        // [수정 1] 넓은 폭(max-w-5xl)을 사용하여 두 번째 사진처럼 큼직한 폼 박스를 만듭니다.
        <div className="w-full max-w-5xl mx-auto pt-16 pb-12 px-4">
            
            {/* 상단 문구 영역: 박스 바깥(위)에 위치시키고 왼쪽 정렬합니다. */}
            <div className="text-left mb-8 px-2">
                <h1 className="text-4xl font-bold text-[#1D2EE5] mb-2">마음 상태 진단</h1>
                <p className="text-gray-500 text-lg">현재의 기분과 상황을 솔직하게 체크해 주세요.</p>
            </div>

            {/* 메인 흰색 폼 박스 */}
            <div className="bg-white rounded-2xl p-10 md:p-14 shadow-sm w-full">
                
                {/* 1. 내면의 감정 섹션 */}
                <div className="mb-12">
                    <h2 className="text-xl font-bold text-black mb-6 flex items-center">
                        <span className="w-1.5 h-1.5 bg-black rounded-full mr-3"></span>
                        내면의 감정
                    </h2>
                    <div className="flex flex-wrap gap-4 pl-4">
                        {emotions.map((emotion) => (
                            <button
                                key={emotion}
                                onClick={() => setSelectedEmotion(emotion)}
                                // [수정 2] 선택된 버튼(selectedEmotion과 같을 때)은 파란색, 아니면 회색으로 바뀝니다.
                                className={`px-6 py-3 rounded-xl font-bold text-base transition-all ${
                                    selectedEmotion === emotion 
                                    ? 'bg-[#1D2EE5] text-white' 
                                    : 'bg-[#E3E3E3] text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                {emotion}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 2. 현실의 상황 섹션 */}
                <div className="mb-14">
                    <h2 className="text-xl font-bold text-black mb-6 flex items-center">
                        <span className="w-1.5 h-1.5 bg-black rounded-full mr-3"></span>
                        현실의 상황
                    </h2>
                    <div className="flex flex-wrap gap-4 pl-4">
                        {situations.map((situation) => (
                            <button
                                key={situation}
                                onClick={() => setSelectedSituation(situation)}
                                className={`px-6 py-3 rounded-xl font-bold text-base transition-all ${
                                    selectedSituation === situation 
                                    ? 'bg-[#1D2EE5] text-white' 
                                    : 'bg-[#E3E3E3] text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                {situation}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 3. 결과 보기 버튼 */}
                <button 
                    onClick={handleResultClick}
                    className="w-full py-4 bg-[#3D46AA] text-white rounded-xl font-bold text-xl hover:bg-opacity-90 transition-all"
                >
                    정서 케어 서비스 결과 보기
                </button>
                
            </div>
        </div>
    );
};

export default Consolation;