import './App.css';
import './index.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from "./pages/Home";
import Header from "./components/Header";
import Footer from './components/Footer';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Consolation from './pages/Consolation';
import Consolation_result from './pages/Consolation_result';

function App() {
  return (
    // [중요 1] 프로젝트 전체에 라우터 환경을 켜줍니다.
    <BrowserRouter>
      {/* 화면 전체 레이아웃 (배경색 설정 및 푸터 하단 고정을 위한 Flex박스 적용) */}
      <div className="flex flex-col min-h-screen bg-[#F8F7EC]">
        
        {/* 상단 헤더 바 고정 */}
        <Header />

        {/* [중요 2] 본문 영역이 남는 공간을 다 차지하여 푸터를 바닥으로 밀어내도록 flex-1 설정 */}
        <main className="flex-1 w-full p-6">
          <Routes>
            {/* 기본 주소('/')일 때 Home 컴포넌트를 보여주도록 주소를 매핑합니다 */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            {/* 버튼을 눌렀을 때 흰 화면 방지용 예비 경로 세팅 */}
            <Route path="/consolation" element={<Consolation />} />
            <Route path="/consolation_result" element={<Consolation_result />} />
            <Route path="/secret_forest" element={<Home />} />
            <Route path="/secret_note" element={<Home />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </main>

        {/* 하단 푸터 바 고정 */}
        <Footer />
        
      </div>
    </BrowserRouter>
  );
}

export default App;
