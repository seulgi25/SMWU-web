//이 페이지는 알람이 온 것을 보여주는 페이지입니다. 알람이 오면 알람이 온 것을 보여주고, 알람을 클릭하면 해당 알람의 상세 페이지로 이동합니다. 알람이 없으면 "알람이 없습니다."라는 메시지를 보여줍니다.
//'마음 소식 알림 센터 // 나의 흔적에 다른 사용자들이 전해온 따스한 정서 교감 내역' 문구가 header.jsx 바로 아래에 위치합니다.
//'마음 소식 알림 센터'는 파란색의 크고 굵은 글씨로, '나의 흔적에 다른 사용자들이 전해온 따스한 정서 교감 내역'는 회색의 작은 글씨로 디자인되어 있습니다.
//만약 쓴 글에 댓글이 달리면 '다른 사용자의 온기가 닿았습니다! 댓글을 확인하세요.'라는 알람이 옵니다.
//만약 다른 사용자가 자신의 글에 안아주기 버튼을 누르면 그 글의 최초 1회에 한해서만 안아주기를 선물했다는 알림이 옵니다. 알림 내용은 '다른 사용자의 온기가 닿았습니다! 누군가 당신의 글에 [안아주기]를 선물했습니다.'입니다.
//알람이 여러 개일 때는 최신 알람이 가장 위에 오도록 정렬되어 있습니다.
//안아주기를 선물했다는 알림을 누르면 배경색깔이 연한 빨간색 계열로 3초간 그라데이션으로 변했다가 다시 원래대로 돌아오는 애니메이션이 실행됩니다. 댓글이 달렸다는 알림을 누르면 해당 댓글이 달린 글의 상세 페이지로 이동합니다.
//모든 디자인은 tailwindcss를 사용하여 구현됩니다.
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Alarm = () => {
    const navigate = useNavigate();
    
    const [isWarm, setIsWarm] = useState(false);
    const [alarms, setAlarms] = useState([]);

    // 화면이 켜질 때 로컬 스토리지에서 알람 데이터를 불러옵니다.
    useEffect(() => {
        const savedAlarms = JSON.parse(localStorage.getItem('alarms')) || [];
        setAlarms(savedAlarms);
    }, []);

    // 알람 클릭 시 작동하는 함수
    const handleAlarmClick = (alarm) => {
        if (alarm.type === 'hug') {
            setIsWarm(true);
            setTimeout(() => {
                setIsWarm(false);
            }, 3000);
        } else if (alarm.type === 'comment' && alarm.postId) {
            navigate(`/secret_forest/${alarm.postId}`);
        }
    };

    return (
        <div className={`min-h-screen transition-colors duration-1000 ${isWarm ? 'bg-[#FADCD9]' : 'bg-transparent'}`}>
            <div className="w-full max-w-5xl mx-auto pt-16 pb-12 px-4">
                
                <div className="text-left mb-10 px-2">
                    <h1 className="text-4xl font-bold text-[#1D2EE5] mb-2">마음 소식 알림 센터</h1>
                    <p className="text-gray-500 text-lg">나의 흔적에 다른 사용자들이 전해온 따스한 정서 교감 내역</p>
                </div>

                <div className="flex flex-col gap-4">
                    {alarms.length === 0 ? (
                        <div className="bg-gray-50 rounded-lg p-10 flex justify-center items-center border border-gray-200">
                            <p className="text-gray-500 font-bold text-lg">알람이 없습니다.</p>
                        </div>
                    ) : (
                        alarms.map((alarm) => (
                            <button
                                key={alarm.id}
                                onClick={() => handleAlarmClick(alarm)}
                                className="text-left w-full px-6 py-5 bg-white border border-gray-300 rounded-sm hover:bg-gray-50 transition-all shadow-sm"
                            >
                                <p className="text-base font-bold text-gray-800 mb-2">
                                    {alarm.message}
                                </p>
                                <p className="text-sm text-gray-400 font-medium">
                                    {alarm.time}
                                </p>
                            </button>
                        ))
                    )}
                </div>

            </div>
        </div>
    );
};

export default Alarm;