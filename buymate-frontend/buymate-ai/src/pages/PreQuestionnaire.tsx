// src/pages/PreQuestionnaire.tsx
import { useNavigate } from 'react-router-dom';

export default function PreQuestionnaire() {
    const nav = useNavigate();

    // 完成问卷后调用
    const finish = () => {
        sessionStorage.setItem('exp:preDone', '1');
        sessionStorage.setItem('exp:preAnswers', JSON.stringify({ q1: 'answer1' })); // 示例
        nav('/');
    };

    return (
        <div style={{ padding: 40 }}>
            <h2>前测量表</h2>
            <p>这里放前测量表内容……</p>
            <button onClick={finish}>完成并返回</button>
        </div>
    );
}