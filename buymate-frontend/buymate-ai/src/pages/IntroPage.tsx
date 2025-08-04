import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../config';

export default function IntroPage() {
    const nav = useNavigate();

    /* ---------- 全局字段 ---------- */
    const [userId, setUserId] = useState(() => sessionStorage.getItem('exp:userId') || '');
    const [preDone]  = useState(() => sessionStorage.getItem('exp:preDone')  === '1');
    const [postDone] = useState(() => sessionStorage.getItem('exp:postDone') === '1');

    /* ---------- User ID 弹窗 ---------- */
    const [showIdModal, setShowIdModal] = useState(false);
    const [tmpId, setTmpId] = useState(userId);

    const saveId = () => {
        if (!tmpId.trim()) return alert('请输入用户 ID');
        setUserId(tmpId);
        sessionStorage.setItem('exp:userId', tmpId);
        setShowIdModal(false);
    };

    /* ---------- 跳转到问卷 ---------- */
    const goPre  = () => nav('/pre-questionnaire');
    const goPost = () => nav('/post-questionnaire');

    /* ---------- 进入实验 ---------- */
    const startExp = (group: 'A' | 'B' | 'C' | 'D') => {
        if (!userId)   return alert('请先输入用户 ID');
        if (!preDone)  return alert('请先完成前测量表');
        sessionStorage.setItem('exp:group', group);
        nav('/experiment');
    };

    /* ---------- 数据集导出 ---------- */
    const exportData = async () => {
        if (!userId)   return alert('缺少用户 ID');
        if (!preDone)  return alert('请先完成前测量表');
        if (!postDone) return alert('请先完成后测量表');
        if (!sessionStorage.getItem('exp:choice'))
            return alert('请先完成实验决策');

        const payload = {
            user_id:      userId,
            group:        sessionStorage.getItem('exp:group'),
            pre_answers:  sessionStorage.getItem('exp:preAnswers'),
            post_answers: sessionStorage.getItem('exp:postAnswers'),
            choice:       sessionStorage.getItem('exp:choice') === 'true',
            choice_time:  Number(sessionStorage.getItem('exp:choiceTime')),
        };

        const res = await fetch(`${config.BACKEND_BASE_URL}/experiment_api/data/export/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (res.ok) {
            alert('数据已导出，感谢参与！');
            sessionStorage.clear();
            nav('/');
        } else {
            alert('导出失败，请稍后重试');
        }
    };

    /* ---------- 渲染 ---------- */
    return (
        <div
            style={{
                width: '100vw',
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                fontFamily: 'system-ui, sans-serif',
                overflow: 'hidden',
            }}
        >
            {/* ---------- 顶部 ---------- */}
            <header
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '2vh 4vw',
                    gap: '2vw',
                    flexWrap: 'wrap',
                }}
            >
                <button
                    style={{
                        fontSize: 'clamp(2vw, 2vw, 2vw)',
                        padding: '1vh 3vw',
                        borderRadius: '100vh',
                        border: 'none',
                        background: '#2b7711',
                        color: '#fff',
                        cursor: 'pointer',
                    }}
                    onClick={() => setShowIdModal(true)}
                >
                    User ID: {userId || '点击输入'}
                </button>

                <div style={{ display: 'flex', gap: '2vw', flexWrap: 'wrap' }}>
                    <button
                        style={{
                            fontSize: 'clamp(2vw, 2vw, 2vw)',
                            padding: '1vh 3vw',
                            borderRadius: '100vh',
                            border: 'none',
                            color: preDone ? '#888' : '#000',
                            background: '#f9f9f9',
                            cursor: 'pointer',
                        }}
                        onClick={goPre}
                    >
                        前测量表
                    </button>
                    <button
                        style={{
                            fontSize: 'clamp(2vw, 2vw, 2vw)',
                            padding: '1vh 3vw',
                            borderRadius: '100vh',
                            border: 'none',
                            color: postDone ? '#888' : '#000',
                            background: '#f9f9f9',
                            cursor: 'pointer',
                            marginRight: '4vw',
                        }}
                        onClick={goPost}
                    >
                        后测量表
                    </button>
                </div>
            </header>

            {/* ---------- 中间按钮 ---------- */}
            <main
                style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2vmin',
                }}
            >
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gridTemplateRows: 'repeat(2, 1fr)',
                        gap: '6vmin',
                        width: '130vmin',
                        height: '50vmin',
                    }}
                >
                    {(['A', 'B', 'C', 'D'] as const).map((g) => (
                        <button
                            key={g}
                            style={{
                                width: '100%',
                                height: '100%',
                                fontSize: 'clamp(3vw, 3vw, 3vw)',
                                borderRadius: '3vmin',
                                background: '#f9f9f9',
                                border: '0.5vmin solid #2b7711',
                                color: '#2b7711',
                                cursor: 'pointer',
                                transition: 'background .2s',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = '#d0d0d0')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = '#f9f9f9')}
                            onClick={() => startExp(g)}
                        >
                            {g}组实验
                        </button>
                    ))}
                </div>
            </main>

            {/* ---------- 底部 ---------- */}
            <footer
                style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    padding: '2vh 4vw',
                }}
            >
                <button
                    style={{
                        fontSize: 'clamp(2vw, 2vw, 2vw)',
                        padding: '1vh 3vw',
                        borderRadius: '100vh',
                        border: 'none',
                        background: '#2b7711',
                        color: '#fff',
                        cursor: 'pointer',
                    }}
                    onClick={exportData}
                >
                    数据集导出
                </button>
            </footer>

            {/* ---------- 弹窗 ---------- */}
            {showIdModal && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,.65)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 999,
                    }}
                    onClick={() => setShowIdModal(false)}
                >
                    <div
                        style={{
                            background: '#2a2a2a',
                            padding: '3vh 5vw',
                            borderRadius: '1.2vh',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            color: '#fff',
                            width: '50vmin',
                            height: '25vmin',
                            gap: '2vh',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 style={{ margin: 0, fontSize: 'clamp(2vw, 2vw, 2vw)' }}>
                            请输入用户 ID
                        </h3>
                        <input
                            value={tmpId}
                            onChange={(e) => setTmpId(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && saveId()}
                            style={{
                                fontSize: 'clamp(2vw, 2vw, 2vw)',
                                padding: '1vh 2vw',
                                borderRadius: '0.8vh',
                                border: 'none',
                                width: '100%',
                            }}
                        />
                        <div style={{ display: 'flex', gap: '2vw' }}>
                            <button
                                style={{
                                    fontSize: 'clamp(2vw, 2vw, 2vw)',
                                    padding: '1vh 2vw',
                                    borderRadius: '0.8vh',
                                    border: 'none',
                                    cursor: 'pointer',
                                }}
                                onClick={saveId}
                            >
                                确定
                            </button>
                            <button
                                style={{
                                    fontSize: 'clamp(2vw, 2vw, 2vw)',
                                    padding: '1vh 2vw',
                                    borderRadius: '0.8vh',
                                    border: 'none',
                                    cursor: 'pointer',
                                }}
                                onClick={() => setShowIdModal(false)}
                            >
                                取消
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}