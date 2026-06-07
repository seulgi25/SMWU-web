//Mypage_setting은 계정 및 보안 설정을 할 수 있는 페이지입니다.
//'계정 및 보안 설정 // 비밀번호 변경 및 활동 닉네임 변경' 문구가 Header.jsx 아래에 위치합니다.
//'계정 및 보안 설정'은 파란색의 크고 굵은 글씨로, '비밀번호 변경 및 활동 닉네임 변경'은 회색의 작은 글씨로 작성합니다.
//흰색의 둥근 네모 박스에는 이미지, 닉네임, 비밀번호 변경을 할 수 있습니다.
//작고 검정 글씨로 이미지 설정이 있고, 그 아래에 이미지 버튼을 누르면 이미지를 설정할 수 있습니다. 그리고 그 사진은 Mypage 이미지 칸에서 볼 수 있습니다.
//그 아래에는 작고 검정 글씨로 닉네임 변경 설정이 쓰여있고 placeholder가 '변경할 닉네임을 입력해주세요.'인 폼이 있습니다.
//그 아래에는 작고 검정 글씨로 '현재 비밀번호 입력'이 쓰여있고 placeholder가 '현재 비밀번호를 입력해주세요.'인 폼이 있습니다.
//그 아래에는 작고 검정 글씨로 '보안 비밀번호 변경'이 쓰여있고 placeholder가 '새로운 비밀번호를 입력해주세요.'인 폼이 있습니다.
//이 데이터들은 API를 통해 저장되고 만약 현재 비밀번호가 틀리다면 '현재 비밀번호가 틀립니다. 다시 입력해주세요.'라는 alert창이 뜹니다.
//API를 통해 저장되어야하지만 일단은 임시로 localStorage에 저장되도록 합니다.
//그 아래에는 '변경 내용 저장하기' 버튼이 존재합니다. 버튼은 파란색 배경에 흰색 굵은 글씨로 되어있습니다.
//여기에서 수정한 데이터들은 바로 반영되어 확인할 수 있도록합니다.
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// 🌟 Firebase Auth 연동
import { auth, db } from '../firebase';
import { onAuthStateChanged, updateProfile, updatePassword } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';

const MypageSetting = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    
    // 변경할 입력값 관리
    const [newNickname, setNewNickname] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState(''); // 비밀번호 확인용
    const [passwordError, setPasswordError] = useState(''); // 에러 메시지용

    const [profileImage, setProfileImage] = useState(null); // 화면에 보여줄 이미지 미리보기
    const fileInputRef = useRef(null); // 숨겨진 파일 입력창을 조종할 리모컨

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                setNewNickname(currentUser.displayName || '');
                setProfileImage(currentUser.photoURL || null); // 기존 사진 세팅
            } else {
                alert("로그인이 필요합니다.");
                navigate('/login');
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    // 이미지 파일 선택 시 미리보기로 변환해주는 함수
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result); // 이미지를 글자(Base64)로 변환해서 저장
            };
            reader.readAsDataURL(file);
        }
    };

    // 변경 내용 저장 함수
    const handleSave = async () => {
        if (!user) return;

        setPasswordError(''); // 에러 메시지 초기화

        // 🌟 [수정된 검증 로직] 앞뒤 공백을 제거한(trim) 진짜 글자 수가 0보다 클 때만 비밀번호 변경을 시도합니다.
        const isPasswordInputExist = newPassword.trim().length > 0 || confirmPassword.trim().length > 0;

        if (isPasswordInputExist) {
            if (newPassword !== confirmPassword) {
                setPasswordError('비밀번호가 일치하지 않습니다.');
                return; // 일치하지 않으면 함수 종료
            }
            if (newPassword.length < 6) {
                setPasswordError('비밀번호는 최소 6자리 이상이어야 합니다.');
                return;
            }
        }

        try {
            let profileUpdates = {};
            let firestoreUpdates = {};

            // 닉네임이 변경되었다면
            if (newNickname.trim() !== '' && newNickname !== user.displayName) {
                profileUpdates.displayName = newNickname;
                firestoreUpdates.nickname = newNickname;
            }

            // 이미지가 변경되었다면
            if (profileImage !== user.photoURL) {
                profileUpdates.photoURL = profileImage;
                firestoreUpdates.profileImage = profileImage;
            }

            // 1. 프로필(닉네임/사진) 업데이트
            if (Object.keys(profileUpdates).length > 0) {
                await updateProfile(user, profileUpdates);
                await updateDoc(doc(db, "users", user.uid), firestoreUpdates);
            }

            // 2. 비밀번호 업데이트 (진짜 입력값이 존재할 때만 실행)
            if (isPasswordInputExist && newPassword.trim() !== '') {
                await updatePassword(user, newPassword);
            }

            alert('계정 정보가 성공적으로 변경되었습니다.');
            navigate('/mypage'); 

        } catch (error) {
            console.error("계정 업데이트 실패:", error);
            if (error.code === 'auth/requires-recent-login') {
                alert("보안을 위해 다시 로그인한 후 비밀번호를 변경해 주세요.");
                navigate('/login');
            } else if (error.code === 'auth/payload-too-large') {
                alert("이미지 용량이 너무 큽니다. 더 작은 사진을 선택해주세요.");
            } else {
                alert("정보 변경 중 오류가 발생했습니다. 비밀번호 입력란에 공백이 없는지 확인해 주세요.");
            }
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto pt-16 pb-20 px-4">
            
            <button 
                onClick={() => navigate('/mypage')}
                className="flex items-center gap-2 text-gray-500 hover:text-black font-bold mb-8 transition-colors"
            >
                &larr; 마이페이지로 돌아가기
            </button>

            <div className="text-left mb-10 px-2">
                <h1 className="text-4xl font-bold text-[#1D2EE5] mb-2">계정 설정</h1>
                <p className="text-gray-500 text-lg">나의 닉네임, 프로필 사진 및 패스워드를 변경할 수 있습니다.</p>
            </div>

            <div className="bg-white rounded-2xl p-10 shadow-sm border border-gray-200 flex flex-col gap-8">
                
                {/* 프로필 이미지 변경 영역 */}
                <div className="flex flex-col items-center gap-4 border-b border-gray-100 pb-8">
                    <div className="w-28 h-28 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold text-3xl overflow-hidden border border-gray-300">
                        {profileImage ? (
                            <img src={profileImage} alt="프로필" className="w-full h-full object-cover" />
                        ) : (
                            <span>{newNickname ? newNickname.charAt(0) : 'img'}</span>
                        )}
                    </div>
                    
                    <input 
                        type="file" 
                        accept="image/*" 
                        ref={fileInputRef} 
                        onChange={handleImageChange} 
                        className="hidden" 
                    />
                    
                    <button 
                        onClick={() => fileInputRef.current.click()}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors"
                    >
                        프로필 이미지 변경
                    </button>
                </div>

                <div className="flex flex-col gap-3">
                    <label className="text-black font-bold text-lg">새 닉네임</label>
                    <input 
                        type="text" 
                        value={newNickname}
                        onChange={(e) => setNewNickname(e.target.value)}
                        placeholder="변경할 닉네임을 입력하세요"
                        className="w-full bg-gray-50 border border-gray-300 rounded-lg px-5 py-4 text-base focus:outline-none focus:ring-1 focus:ring-[#3D46AA]"
                    />
                </div>

                <div className="flex flex-col gap-3">
                    <label className="text-black font-bold text-lg">새 패스워드</label>
                    <input 
                        type="password" 
                        value={newPassword}
                        onChange={(e) => {
                            setNewPassword(e.target.value);
                            if(e.target.value === '') setPasswordError(''); // 지우면 에러메시지 즉시 삭제
                        }}
                        placeholder="변경할 패스워드를 입력하세요 (변경하지 않으려면 비워두세요)"
                        className="w-full bg-gray-50 border border-gray-300 rounded-lg px-5 py-4 text-base focus:outline-none focus:ring-1 focus:ring-[#3D46AA]"
                    />
                </div>

                {/* 새 패스워드 재확인 영역 */}
                <div className="flex flex-col gap-1">
                    <label className="text-black font-bold text-lg mb-2">새 패스워드 확인</label>
                    <input 
                        type="password" 
                        value={confirmPassword}
                        onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            if(e.target.value === '') setPasswordError(''); // 지우면 에러메시지 즉시 삭제
                        }}
                        placeholder="위에서 입력한 패스워드를 다시 한 번 입력하세요"
                        className={`w-full bg-gray-50 border rounded-lg px-5 py-4 text-base focus:outline-none focus:ring-1 ${
                            passwordError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#3D46AA]'
                        }`}
                    />
                    {passwordError && (
                        <p className="text-red-500 text-sm font-bold mt-1 ml-1">{passwordError}</p>
                    )}
                </div>

                <div className="pt-6">
                    <button 
                        onClick={handleSave}
                        className="w-full bg-[#3D46AA] text-white px-6 py-4 rounded-xl font-bold text-lg hover:bg-opacity-90 transition-all shadow-sm"
                    >
                        변경 내용 저장하기
                    </button>
                </div>
            </div>

        </div>
    );
};

export default MypageSetting;