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
import Secret_forest_list from './pages/Secret_forest_list';
import SecretForestWrite from './pages/Secret_forest_write';
import SecretForestDetails from './pages/Secret_forest_details';
import SecretNoteList from './pages/Secret_note_list';
import SecretNoteWrite from './pages/Secret_note_write';
import Alarm from './pages/Alarm';
import Mypage from './pages/Mypage'
import MypageSetting from './pages/Mypage_setting';
  
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
            <Route path="/secret_forest" element={<Secret_forest_list />} />
            <Route path="/secret_forest_write" element={<SecretForestWrite />} />
            <Route path="/secret_forest/:id" element={<SecretForestDetails />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/secret_note" element={<SecretNoteList />} />
            <Route path="/secret_note_write" element={<SecretNoteWrite />} />
            <Route path="/alarm" element={<Alarm />} />
            <Route path="/mypage" element={<Mypage />} />
            <Route path="/mypage_setting" element={<MypageSetting />} />
          </Routes>
        </main>

        {/* 하단 푸터 바 고정 */}
        <Footer />
        
      </div>
    </BrowserRouter>
  );
}

export default App;
