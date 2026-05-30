// src/components/Footer.jsx
//Footer.jsx는 웹사이트의 하단에 위치하는 컴포넌트입니다.
//Footer jsx의 공간을 작게 잡아서 로고와 슬로건, 프로젝트 및 저작권 정보, 학술적 면책 조항을 포함하도록 구성했습니다.
//Footer 컴포넌트는 항상 화면의 하단에 고정합니다.
//Footer.jsx의 전체 배경색은 흰색으로 설정한다. Footer.jsx는 화면의 하단에 고정한다.

const Footer = () => {
  return (
    // py-8(넓은 여백) 대신 py-4로 높이를 줄이고, 전체 텍스트 크기를 보편적인 푸터 스펙인 text-xs로 고정했습니다.
    <footer className="w-full bg-[#FFFFFF] border-t border-gray-200/60 py-4 px-6 text-center text-gray-400">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        
        {/* 로고와 슬로건 (p태그로 변경하여 불필요한 상하 여백 제거) */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-blue-600/80 tracking-wider">쉼표,</span>
          <span className="text-gray-300">|</span>
          <p className="text-gray-500 m-0">소프트웨어학부 컴퓨터과학전공 | 웹시스템설계 최종 결과물</p>
        </div>

        {/* 프로젝트 및 저작권 정보 */}
        <p className="font-medium text-gray-400/90 m-0">
          © 2026 Comma Project (2516589 정슬기). All rights reserved.
        </p>

        {/* 학술적 면책 조항 (가장 작은 글씨로 깔끔하게 한 줄 처리) */}
        <p className="text-[10px] text-gray-400/50 max-w-md md:text-right m-0 font-light leading-tight">
          본 서비스는 대학생 정서 케어 구현 과제물이며 의학적 진단을 제공하지 않습니다. (OpenWeatherMap API 활용)
        </p>

      </div>
    </footer>
  );
}

export default Footer;