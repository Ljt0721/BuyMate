import styles from './ResultPage.module.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../config'; // 确保你有一个 config 文件包含 BACKEND_BASE_URL

const groupsMap: Record<number, string> = {
    0: 'A组：无干预组',
    1: 'B组：真人干预组',
    2: 'C组：文字干预组',
    3: 'D组：语音干预组',
};

const productNames = [
    '商品1', '商品2', '商品3', '商品4',
    '商品5', '商品6', '商品7', '商品8'
];

interface GroupResult {
    type: number;
    items: number[];
}

export default function ResultPage() {
    const nav = useNavigate();
    const [userId] = useState(() => sessionStorage.getItem('exp:userId') || '');
    const [groupedResults, setGroupedResults] = useState<GroupResult[]>([]);

    useEffect(() => {
        if (!userId) return;

        fetch(`${config.BACKEND_BASE_URL}/experiment_api/experiment/result/?subject_id=${userId}`)
            .then(res => res.json())
            .then(data => {
                setGroupedResults(data);
            })
            .catch(err => {
                console.error('获取实验结果失败:', err);
            });
    }, [userId]);

    const groupTypes = ['A', 'B', 'C', 'D'];

    return (
        <div>
            <div style={{ padding: '2vh 0 0 2vw' }}>
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
            </div>
            <div className={styles.resultContainer}>
                {groupTypes.map((type) => {
                    const group = groupedResults.find(g => g.type.toString() === type);
                    const items = group ? group.items : [];
                    console.log();
                    return (
                        <div key={type} className={styles.groupCard}>
                            <div className={styles.groupTitle}>{groupsMap[type.charCodeAt(0) - 'A'.charCodeAt(0)]}</div>
                            <div className={styles.groupContent}>
                                <div className={styles.groupLabel}>你选择购买了以下商品：</div>
                                <div className={styles.productGrid}>
                                    {items.map((id, i) => (
                                        <div key={i} className={styles.productItem}>
                                            <img
                                                src={`${config.BACKEND_BASE_URL}/media/images/${id}-1.jpg`}
                                                alt={`商品${id}`}
                                                className={styles.productImage}
                                            />
                                            <div className={styles.productName}>{productNames[id - 1] || `商品${id}`}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}