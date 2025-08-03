// src/pages/ExperimentPage.tsx
import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ExperimentPage.module.css';
import config from '../config';

const GROUP_DESC: Record<string, string> = {
    A: '无干预组',
    B: '真人干预组',
    C: '文字干预组',
    D: '语音干预组',
};

export default function ExperimentPage() {
    const nav = useNavigate();

    /* ---------- 基础信息 ---------- */
    const userId  = sessionStorage.getItem('exp:userId');
    const group   = sessionStorage.getItem('exp:group') || 'A';

    if (!userId) { nav('/'); return null; }

    /* ---------- 状态 ---------- */
    const [expId, setExpId]   = useState(1);          // 1-32
    const [startTs, setStart] = useState(0);          // 开始时间戳
    const [timeUsed, setTime] = useState(0);          // 耗时 ms
    const videoRef = useRef<HTMLVideoElement>(null);

    /* ---------- 计时器 ---------- */
    useEffect(() => {
        if (!startTs) return;
        const t = setInterval(() => setTime(Date.now() - startTs), 100);
        return () => clearInterval(t);
    }, [startTs]);

    /* ---------- 动作 ---------- */
    const startExp = () => {
        if (!videoRef.current) return;
        videoRef.current.play();
        setStart(Date.now());
    };

    const stopExp = () => {
        if (videoRef.current) videoRef.current.pause();
        setTime(Date.now() - startTs);
        setStart(0);
    };

    const record = (buy: boolean) => {
        if (!startTs) return alert('请先完成实验');
        sessionStorage.setItem('exp:choice', String(buy));
        sessionStorage.setItem('exp:choiceTime', String(timeUsed));
        sessionStorage.setItem('exp:expId', String(expId));
        nav('/post-questionnaire');   // 去后问卷
    };

    return (
        <div className={styles.page}>
            {/* 左上角 */}
            <div className={styles.topBar}>
                <button onClick={() => nav('/')} className={styles.back}>返回</button>
                <span className={styles.groupInfo}>{group}组：{GROUP_DESC[group]}</span>
            </div>

            {/* 中间内容 */}
            <div className={styles.main}>
                {/* 左侧控制 */}
                <div className={styles.leftPanel}>
                    <div className={styles.ctrl}>
                        <label>实验编号</label>
                        <select value={expId} onChange={e => setExpId(Number(e.target.value))}>
                            {Array.from({ length: 32 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>{i + 1}</option>
                            ))}
                        </select>
                    </div>

                    <button className={styles.btn} onClick={startExp}>开始实验</button>
                    <button className={styles.btn} onClick={stopExp}>结束实验</button>

                    <div className={styles.timer}>
                        用时：{(timeUsed / 1000).toFixed(2)} 秒
                    </div>
                </div>

                {/* 中间媒体 */}
                <div className={styles.media}>
                    {/* 手机壳占位图 */}
                    <img
                        className={styles.phone}
                        src={`${config.BACKEND_BASE_URL}/media/images/phone.png`}
                        alt="phone"
                    />
                    {/* 视频 */}
                    <video
                        ref={videoRef}
                        className={styles.video}
                        src={`${config.BACKEND_BASE_URL}/media/videos/${expId}.mp4`}
                        controls
                        preload="metadata"
                    />
                </div>
            </div>

            {/* 右下角 */}
            <div className={styles.bottomBtns}>
                <button className={styles.buy} onClick={() => record(true)}>购买此商品</button>
                <button className={styles.nobuy} onClick={() => record(false)}>不购买此商品</button>
            </div>
        </div>
    );
}