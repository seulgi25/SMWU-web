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
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Consolation_result = () => {
    const navigate = useNavigate();

    const handleDiagnosisAgain = () => {
        navigate('/consolation');
    };

    const handleMusicPlay = () => {
        window.open('https://www.youtube.com/results?search_query=루시+개화', '_blank');
    };

    return (
        <div className="w-full max-w-6xl mx-auto pt-16 pb-12 px-4">
            
            {/* 상단 문구 영역 */}
            <div className="text-left mb-6 px-2">
                <h1 className="text-4xl font-bold text-[#1D2EE5] mb-2">정서 케어 서비스 결과</h1>
                <p className="text-gray-500 text-lg">쉼표가 분석 완료한 결과입니다.</p>
            </div>

            {/* 메인 흰색 둥근 박스 */}
            <div className="bg-white rounded-2xl p-10 shadow-sm w-full flex flex-col gap-10">
                
                {/* 상단 2단 분리 영역 (음악,글귀 / 대나무숲) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    
                    {/* 왼쪽 단: 추천 음악 & 추천 글귀 */}
                    <div className="flex flex-col gap-10">
                        {/* 추천 음악 */}
                        <div>
                            <h2 className="text-lg font-bold text-[#1D2EE5] mb-3 flex items-center">
                                <span className="w-1.5 h-1.5 bg-[#1D2EE5] rounded-full mr-2"></span>추천 음악
                            </h2>
                            {/* 글씨와 버튼을 한 줄(가로)로 배치 */}
                            <div className="flex items-center gap-4">
                                <p className="text-xl font-bold text-black">루시(LUCY) - 개화</p>
                                <button 
                                    onClick={handleMusicPlay}
                                    className="bg-[#3D46AA] text-white px-4 py-2 rounded-lg font-bold hover:bg-opacity-90 transition-all text-sm"
                                >
                                    음악 들으러 가기
                                </button>
                            </div>
                        </div>

                        {/* 추천 글귀 */}
                        <div>
                            <h2 className="text-lg font-bold text-[#1D2EE5] mb-3 flex items-center">
                                <span className="w-1.5 h-1.5 bg-[#1D2EE5] rounded-full mr-2"></span>추천 글귀
                            </h2>
                            <p className="text-xl font-bold text-black break-keep">
                                자신의 감정을 말로 표현하는데 서투른 사람도 있는 법이야.
                            </p>
                        </div>
                    </div>

                    {/* 오른쪽 단: 익명 대나무숲 */}
                    <div>
                        <h2 className="text-lg font-bold text-[#1D2EE5] mb-3 flex items-center">
                            <span className="w-1.5 h-1.5 bg-[#1D2EE5] rounded-full mr-2"></span>익명 대나무숲
                        </h2>
                        <div className="flex flex-col gap-3">
                            <button className="text-center px-4 py-3.5 bg-white border border-gray-300 rounded-sm font-bold text-black hover:bg-gray-50 transition-all shadow-sm">
                                "팀플 발표 당일 조원이 잠수탈 때 대처법"
                            </button>
                            <button className="text-center px-4 py-3.5 bg-white border border-gray-300 rounded-sm font-bold text-black hover:bg-gray-50 transition-all shadow-sm">
                                "나 혼자만 부족해 보일 때"
                            </button>
                            <button className="text-center px-4 py-3.5 bg-white border border-gray-300 rounded-sm font-bold text-black hover:bg-gray-50 transition-all shadow-sm">
                                "팀플 나만 힘들어?"
                            </button>
                        </div>
                    </div>

                </div>

                {/* 하단 영역: 힐링 공간 */}
                <div>
                    <h2 className="text-lg font-bold text-[#1D2EE5] mb-3 flex items-center">
                        <span className="w-1.5 h-1.5 bg-[#1D2EE5] rounded-full mr-2"></span>힐링 공간
                    </h2>
                    {/* 지도와 장소 리스트를 딱 붙여서 하나의 박스로 만듦 */}
                    <div className="flex flex-col md:flex-row w-full rounded-md overflow-hidden shadow-sm h-auto md:h-64">
                        
                        {/* 왼쪽: 지도 API 영역 (회색 배경) */}
                        <div className="flex-1 bg-[#E3E5E5] flex items-center justify-center text-black font-bold h-64 md:h-auto">
                            지도 및 추천 장소 보여주기
                        </div>
                        
                        {/* 오른쪽: 장소 추천 리스트 (보라색 배경) */}
                        <div className="w-full md:w-1/3 bg-[#9299E5] p-8 flex flex-col justify-center gap-5 text-white">
                            <div className="flex items-center gap-3 font-medium text-base">
                                <span className="w-1 h-1 bg-white rounded-full"></span>성정동 파스텔 다락방 북카페
                            </div>
                            <div className="flex items-center gap-3 font-medium text-base">
                                <span className="w-1 h-1 bg-white rounded-full"></span>카페 이숲
                            </div>
                            <div className="flex items-center gap-3 font-medium text-base">
                                <span className="w-1 h-1 bg-white rounded-full"></span>두정도서관
                            </div>
                        </div>

                    </div>
                </div>

            </div>

            {/* 제일 하단: 다시 진단하기 버튼 (왼쪽 정렬, 크기 축소) */}
            <div className="mt-8 flex justify-start px-2">
                <button
                    onClick={handleDiagnosisAgain}
                    className="px-8 py-3.5 bg-[#3D46AA] text-white rounded-xl font-bold text-lg hover:bg-opacity-90 transition-all shadow-sm"
                >
                    다시 진단하기
                </button>
            </div>
            
        </div>
    );
};

export default Consolation_result;