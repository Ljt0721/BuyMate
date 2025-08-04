// src/pages/ExperimentPage.tsx
import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../config';

const GROUP_DESC: Record<string, string> = {
    A: '无干预组',
    B: '真人干预组',
    C: '文字干预组',
    D: '语音干预组',
};

export default function ExperimentPage() {
    const nav = useNavigate();
    const userId = sessionStorage.getItem('exp:userId');
    const group = sessionStorage.getItem('exp:group') || 'A';
    if (!userId) { nav('/'); return null; }

    /* ---------- 状态 ---------- */
    const [expId, setExpId] = useState(1);
    const [startTs, setStart] = useState(0);
    const [timeUsed, setTime] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);

    /* ---------- 计时器 ---------- */
    useEffect(() => {
        if (!startTs) return;
        const t = setInterval(() => setTime(Date.now() - startTs), 100);
        return () => clearInterval(t);
    }, [startTs]);

    /* ---------- 动作 ---------- */
    const startExp = () => { videoRef.current?.play(); setStart(Date.now()); };
    const stopExp  = () => { videoRef.current?.pause(); setTime(Date.now() - startTs); setStart(0); };
    const record   = async (buy: boolean) => {
        try {
            await fetch(`${config.BACKEND_BASE_URL}/api/record`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    expId,
                    group,
                    buy,
                    timeUsed,
                }),
            });
            alert('数据存储成功');
        } catch (e) {
            // 可选：出错时你想怎么处理，这里什么都不做就是“静默”
            console.error(e);
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
                color: '#fff',
                fontFamily: 'system-ui, sans-serif',
                overflow: 'hidden',
            }}
        >
            {/* ---------- 顶部 ---------- */}
            <header
                style={{
                    position: 'absolute',

                    display: 'flex',
                    alignItems: 'center',
                    gap: '2vmin',
                    padding: '2vmin 3vmin',
                    flexShrink: 0,
                }}
            >
                <button
                    style={{
                        width: '5vw',
                        height: '5vw',
                        borderRadius: '50%',
                        border: '0.1vw solid #07C160',
                        background: '#fff',
                        cursor: 'pointer',
                    }}
                    onClick={() => nav('/')}
                >
                    <img
                        src={`${config.BACKEND_BASE_URL}/media/images/back.png`}
                        alt="back"
                        style={{ width: '2vw', height: '2vw', pointerEvents: 'none' }}
                    />
                </button>
                <span
                    style={{
                        padding: '1vmin 3vmin',
                        background: '#f9f9f9',
                        color: '#3d9712',
                        border: '0.2vmin solid #3d9712',
                        borderRadius: '1.2vmin',
                        fontSize: '2.5vw',
                    }}
                >
          {group}组：{GROUP_DESC[group]}
        </span>
            </header>

            {/* ---------- 主体 ---------- */}
            <main
                style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2vmin',
                }}
            >
                {/* 左侧控制面板 */}
                <aside
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2vw',
                        marginRight: '5vw',
                        width: '15vw',
                        minWidth: 200,
                        transform: 'translate(-40vh, 0vh)'
                    }}
                >
                    <label style={{ fontSize: 'clamp(2vw, 2vw, 2vw)', color: '#000' }}>
                        实验编号
                    </label>
                    <select
                        value={expId}
                        onChange={(e) => setExpId(Number(e.target.value))}
                        style={{
                            fontSize: '2vw',
                            width: '15vw',
                            padding: '1vmin',
                            borderRadius: '1vmin',
                        }}
                    >
                        {Array.from({ length: 32 }, (_, i) => (
                            <option key={i + 1} value={i + 1}>{i + 1}</option>
                        ))}
                    </select>

                    <button
                        onClick={startExp}
                        style={{
                            fontSize: '2vw',
                            width: '15vw',
                            padding: '1.5vmin 0',
                            background: '#3d9712',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '1vmin',
                            cursor: 'pointer',
                        }}
                    >
                        开始实验
                    </button>
                    <button
                        onClick={stopExp}
                        style={{
                            fontSize: '2vw',
                            width: '15vw',
                            padding: '1.5vmin 0',
                            background: '#3d9712',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '1vmin',
                            cursor: 'pointer',
                        }}
                    >
                        结束实验
                    </button>

                    <div style={{ fontSize: '1vw', color: '#000' }}>
                        用时：{(timeUsed / 1000).toFixed(2)} 秒
                    </div>
                </aside>

                {/* ---------- 手机 + 视频 ---------- */}
                <div
                    style={{
                        position: 'absolute',
                        width: '50vh',
                        height: '95vh',
                    }}
                >
                    <video
                        ref={videoRef}
                        style={{
                            position: 'absolute',
                            width: '50vh',
                            height: '95vh',
                            borderRadius: '6vmin',
                            zIndex: 1,
                        }}
                        src={`${config.BACKEND_BASE_URL}/media/videos/${expId}.mp4`}
                        controls
                        preload="metadata"
                    />
                    <img
                        src={`${config.BACKEND_BASE_URL}/media/images/phone.png`}
                        alt="phone"
                        style={{
                            position: 'absolute',
                            inset: 0,
                            width: '70vh',
                            height: '103vh',
                            objectFit: 'contain',
                            zIndex: 2,
                            pointerEvents: 'none',
                            transform: 'translate(-9vh, -3vh)',
                        }}
                    />
                </div>
            </main>

            {/* ---------- 右下角按钮 ---------- */}
            <footer
                style={{
                    position: 'absolute',
                    bottom: '2vw',
                    right: '2vw',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2vw',
                }}
            >
                <button
                    onClick={() => record(true)}
                    style={{
                        fontSize: '2vw',
                        padding: '1.5vmin 4vmin',
                        borderRadius: '100vmin',
                        border: 'none',
                        background: '#2b7711',
                        color: '#f4f0ce',
                        cursor: 'pointer',
                    }}
                >
                    购买此商品
                </button>
                <button
                    onClick={() => record(false)}
                    style={{
                        fontSize: '2vw',
                        padding: '1.5vmin 4vmin',
                        borderRadius: '100vmin',
                        border: 'none',
                        background: '#2b7711',
                        color: '#f4f0ce',
                        cursor: 'pointer',
                    }}
                >
                    不购买此商品
                </button>
            </footer>
        </div>
    );
}