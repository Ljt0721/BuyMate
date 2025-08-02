// src/pages/PostQuestionnaire.tsx
import { useNavigate } from 'react-router-dom';

export default function PostQuestionnaire() {
    const nav = useNavigate();

    const finish = () => {
        sessionStorage.setItem('exp:postDone', '1');
        sessionStorage.setItem('exp:postAnswers', JSON.stringify({ q1: 'answer1' })); // 示例
        nav('/');
    };

    return (
        <div style={{ padding: 40 }}>
            <h2>后测量表</h2>
            <p>这里放后测量表内容……</p>
            <button onClick={finish}>完成并返回</button>
        </div>
    );
}