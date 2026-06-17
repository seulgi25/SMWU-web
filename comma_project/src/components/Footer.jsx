/**
 * Footer.jsx
 *
 * 쉼표 웹서비스의 공통 하단 Footer 컴포넌트입니다.
 * 서비스명, 프로젝트 정보, 저작권 문구, 학술적 면책 문구를 표시합니다.
 */

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="w-full shrink-0 bg-[#FFFFFF] border-t border-gray-200/60 py-4 px-6 text-center text-gray-400"
      aria-label="사이트 하단 정보"
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        {/* 서비스명과 과제 정보를 함께 표시 */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-blue-600/80 tracking-wider">
            쉼표,
          </span>
          <span className="text-gray-300">|</span>
          <p className="text-gray-500 m-0">
            소프트웨어학부 컴퓨터과학전공 | 웹시스템설계 최종 결과물
          </p>
        </div>

        {/* 프로젝트 저작권 정보 */}
        <p className="font-medium text-gray-400/90 m-0">
          © {currentYear} Comma Project (2516589 정슬기). All rights reserved.
        </p>

        {/* 정서 케어 서비스의 한계를 안내하는 학술적 면책 문구 */}
        <p className="text-[10px] text-gray-400/50 max-w-md md:text-right m-0 font-light leading-tight">
          본 서비스는 대학생 정서 케어 구현 과제물이며 의학적 진단을 제공하지 않습니다. (OpenWeatherMap API 활용)
        </p>
      </div>
    </footer>
  );
};

export default Footer;