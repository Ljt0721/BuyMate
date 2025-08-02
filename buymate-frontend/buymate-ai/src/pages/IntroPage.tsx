import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './IntroPage.module.css';
import config from '../config';

export default function IntroPage() {
    const nav = useNavigate();

    /* ---------- 全局字段 ---------- */
    const [userId, setUserId] = useState(() => sessionStorage.getItem('exp:userId') || '');
    const [preDone]  = useState(() => sessionStorage.getItem('exp:preDone') === '1');
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
        if (!userId) return alert('请先输入用户 ID');
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
            user_id:       userId,
            group:         sessionStorage.getItem('exp:group'),
            pre_answers:   sessionStorage.getItem('exp:preAnswers'),
            post_answers:  sessionStorage.getItem('exp:postAnswers'),
            choice:        sessionStorage.getItem('exp:choice') === 'true',
            choice_time:   Number(sessionStorage.getItem('exp:choiceTime')), // ms
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
        <div className={styles.wrap}>
            {/* 左上角 User ID */}
            <div className={styles.topLeft} onClick={() => setShowIdModal(true)}>
                User ID: {userId || '点击输入'}
            </div>

            {/* 右上角问卷链接 */}
            <div className={styles.topRight}>
                <span className={preDone ? styles.done : ''}  onClick={goPre}>前测量表</span>
                <span className={postDone ? styles.done : ''} onClick={goPost}>后测量表</span>
            </div>

            {/* 中间 4 个按钮 */}
            <div className={styles.center}>
                {(['A', 'B', 'C', 'D'] as const).map(g => (
                    <button key={g} onClick={() => startExp(g)} className={styles.bigBtn}>
                        {g}组实验
                    </button>
                ))}
            </div>

            {/* 右下角导出按钮 */}
            <div className={styles.bottomRight}>
                <button onClick={exportData}>数据集导出</button>
            </div>

            {/* 弹窗 */}
            {showIdModal && (
                <div className={styles.modalMask}>
                    <div className={styles.modal}>
                        <h3>请输入用户 ID</h3>
                        <input
                            value={tmpId}
                            onChange={e => setTmpId(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && saveId()}
                        />
                        <div>
                            <button onClick={saveId}>确定</button>
                            <button onClick={() => setShowIdModal(false)}>取消</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}