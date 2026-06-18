/**
 * Consolation.jsx
 *
 * 정서 케어 서비스의 마음 상태 진단 페이지입니다.
 * 사용자는 현재 감정과 현실 상황을 각각 하나씩 선택하고,
 * 선택한 값을 결과 페이지로 전달할 수 있습니다.
 *
 * - 감정 선택: 현재 내면 상태 선택
 * - 상황 선택: 사용자가 처한 현실 상황 선택
 * - 결과 보기: 선택한 감정/상황을 Consolation_result 페이지로 전달
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 감정 선택 버튼 목록
const EMOTION_OPTIONS = [
  '우울함',
  '지침 / 번아웃',
  '불안',
  '막막함',
  '화남',
  '외로움',
  '무기력',
  '조급함',
];

// 상황 선택 버튼 목록
const SITUATION_OPTIONS = [
  '시험 및 학업',
  '인간관계',
  '진로 고민',
  '면접',
  '팀플 문제',
  '연애/이별',
  '경제적 어려움',
  '가족 갈등',
];

// 선택 여부에 따른 버튼 칩 스타일 반환
const getChipClassName = (isSelected) =>
  `px-3.5 py-2 md:px-6 md:py-3 rounded-lg md:rounded-xl font-bold text-sm md:text-base transition-all ${
    isSelected
      ? 'bg-[#1D2EE5] text-white shadow-sm'
      : 'bg-[#E3E3E3] text-gray-700 hover:bg-gray-300'
  }`;

const Consolation = () => {
  const navigate = useNavigate();

  // 사용자가 선택한 감정과 상황 상태 관리
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [selectedSituation, setSelectedSituation] = useState('');

  // 감정/상황 선택 여부 확인 후 결과 페이지로 이동
  const handleResultClick = () => {
    if (!selectedEmotion || !selectedSituation) {
      alert('감정과 상황을 모두 선택해주세요.');
      return;
    }

    // React Router state로 선택한 감정과 상황 전달
    navigate('/consolation_result', {
      state: {
        emotion: selectedEmotion,
        situation: selectedSituation,
      },
    });
  };

  // 감정/상황 버튼 칩 렌더링
  const renderOptionChips = (options, selectedValue, onSelect) => {
    return options.map((option) => {
      const isSelected = selectedValue === option;

      return (
        <button
          key={option}
          type="button"
          onClick={() => onSelect(option)}
          aria-pressed={isSelected}
          className={getChipClassName(isSelected)}
        >
          {option}
        </button>
      );
    });
  };

  return (
    <main className="w-full max-w-5xl mx-auto pt-10 md:pt-16 pb-12 px-4 md:px-6">
      {/* 페이지 제목 영역 */}
      <section className="text-left mb-6 md:mb-8 px-1 md:px-2">
        <h1 className="text-3xl md:text-4xl font-bold text-[#1D2EE5] mb-1 md:mb-2">
          마음 상태 진단
        </h1>
        <p className="text-gray-500 text-sm md:text-lg">
          현재의 기분과 상황을 솔직하게 체크해 주세요.
        </p>
      </section>

      <section className="bg-white rounded-2xl p-6 md:p-14 shadow-sm w-full border border-gray-100">
        {/* 내면의 감정 선택 영역 */}
        <div className="mb-8 md:mb-12">
          <h2 className="text-lg md:text-xl font-bold text-black mb-4 md:mb-6 flex items-center">
            <span className="w-1.5 h-1.5 bg-black rounded-full mr-2 md:mr-3" />
            내면의 감정
          </h2>

          <div className="flex flex-wrap gap-2 md:gap-4 md:pl-4">
            {renderOptionChips(
              EMOTION_OPTIONS,
              selectedEmotion,
              setSelectedEmotion
            )}
          </div>
        </div>

        {/* 현실의 상황 선택 영역 */}
        <div className="mb-10 md:mb-14">
          <h2 className="text-lg md:text-xl font-bold text-black mb-4 md:mb-6 flex items-center">
            <span className="w-1.5 h-1.5 bg-black rounded-full mr-2 md:mr-3" />
            현실의 상황
          </h2>

          <div className="flex flex-wrap gap-2 md:gap-4 md:pl-4">
            {renderOptionChips(
              SITUATION_OPTIONS,
              selectedSituation,
              setSelectedSituation
            )}
          </div>
        </div>

        {/* 결과 페이지 이동 버튼 */}
        <button
          type="button"
          onClick={handleResultClick}
          className="w-full py-3.5 md:py-4 bg-[#3D46AA] text-white rounded-xl font-bold text-base md:text-xl hover:bg-[#3D46AA]/90 transition-all shadow-sm"
        >
          정서 케어 서비스 결과 보기
        </button>
      </section>
    </main>
  );
};

export default Consolation;