import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ExperimentPage.module.css';
import config from '../config';

export default function ExperimentPage() {
    const userId = sessionStorage.getItem('exp:userId');
    const group  = sessionStorage.getItem('exp:group');
    const nav    = useNavigate();

    // 如果直接从 /experiment 进入，没有 userId 就踢回先导页
    if (!userId) { nav('/'); return null; }

    const [buy, setBuy] = useState<boolean | null>(null);

    // 提交结果到后端
    const submit = async (choice: boolean) => {
        setBuy(choice);
        const payload = {
            user_id: userId,
            group,
            pre_score: sessionStorage.getItem('exp:pre'),
            post_score: sessionStorage.getItem('exp:post'),
            buy: choice,
            ts: new Date().toISOString()
        };
        await fetch(`${config.BACKEND_BASE_URL}${config.API_PREFIX}/result/`, {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify(payload)
        });
        alert('实验完成，感谢参与！');
        sessionStorage.clear();
        nav('/');
    };

    return (
        <div className={styles.pageCenter}>
            <h3>您好，用户 {userId} — 分组 {group}</h3>

            <video
                src={`${config.BACKEND_BASE_URL}/media/videos/10.mp4`}
                controls
                width={640}
                style={{margin:'0 auto',display:'block'}}
            />

            <div style={{marginTop:32}}>
                <button onClick={() => submit(true)}  disabled={buy!==null}>购买此商品</button>
                <button onClick={() => submit(false)} disabled={buy!==null} style={{marginLeft:16}}>
                    不购买此商品
                </button>
            </div>
        </div>
    );
}