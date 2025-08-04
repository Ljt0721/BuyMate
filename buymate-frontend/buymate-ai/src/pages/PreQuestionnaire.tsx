// src/pages/PreQuestionnaire.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Questionnaire.module.css';
import config from '../config';

const ageOptions = ['18-25', '26-35', '36-45', '46+'];
const genderOptions = ['男', '女', '非二元', '不愿透露'];
const educationOptions = ['高中及以下', '本科', '硕士', '博士'];
const incomeOptions = ['＜3000元', '3000-6000元', '6000-10000元', '＞10000元'];
const channelOptions = ['小红书', '抖音', '快手', '淘宝', '京东', '哔哩哔哩', '其他'];
const frequencyOptions = ['从不', '每月少于1次', '每月1-3次', '每周1-2次', '每周多次'];

const ibsQuestions = [
    '我买东西之前都会仔细考虑',
    '我只买我自己打算买的东西',
    '如果我买东西，通常都是我自愿去买的',
    '我买的大部分东西都是提前计划好的',
    '我只买我自己需要的东西',
    '我不喜欢仅仅买东西',
    '买之前我喜欢比较不同牌子',
    '在买之前我都会仔细考虑是否真的需要',
    '我习惯“当场”买东西',
    '我经常不假思索地买东西',
    '我很难不买我发现的好东西',
    '我有时无法抑制想买东西的感觉',
    '我有时买完东西会感到内疚',
    '我不是那种对看到的商品“一见钟情”的人',
    '如果我看到我想买的东西，我会变得非常兴奋',
    '每当我经过商店时，我总能看到一些好东西',
    '我发现我很难拒绝便宜货',
    '如果我看到新的东西，我就想买下来',
    '我买东西有点鲁莽',
    '我有时买东西是因为我喜欢买东西，而不是因为我需要它们',
];

export default function PreQuestionnaire() {
    const nav = useNavigate();

    const [userId] = useState(() => sessionStorage.getItem('exp:userId') || '');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const [education, setEducation] = useState('');
    const [income, setIncome] = useState('');
    const [channels, setChannels] = useState<string[]>([]);
    const [frequency, setFrequency] = useState('');
    const [ibsAnswers, setIbsAnswers] = useState<number[]>(Array(20).fill(0));

    const toggleChannel = (channel: string) => {
        setChannels(prev =>
            prev.includes(channel) ? prev.filter(c => c !== channel) : [...prev, channel]
        );
    };

    const updateIbsAnswer = (index: number, value: number) => {
        const newAnswers = [...ibsAnswers];
        newAnswers[index] = value;
        setIbsAnswers(newAnswers);
    };

    const finish = async () => {
        if (!userId) return alert('缺少用户 ID');
        if (![age, gender, education, income, frequency].every(Boolean)) return alert('请填写完整');
        if (channels.length === 0) return alert('请选择至少一个购物渠道');
        if (ibsAnswers.some(a => a < 1 || a > 7)) return alert('请完成所有 IBS 题目');

        const payload = {
            id: userId,
            age,
            gender,
            education,
            income,
            shopping_preferences: channels,
            live_shopping_frequency: frequency,
            ibs_answers: ibsAnswers,
        };

        try {
            const res = await fetch(`${config.BACKEND_BASE_URL}/questionnaire_api/submit-pre-questionnaire/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = await res.json();

            if (res.ok && result.success) {
                sessionStorage.setItem('exp:preDone', '1');
                sessionStorage.setItem('exp:preAnswers', JSON.stringify(payload));
                nav('/');
            } else {
                alert(`提交失败：${result.error || '未知错误'}`);
            }
        } catch (err) {
            console.error('提交出错:', err);
            alert('提交失败，请检查网络连接');
        }
    };

    return (
        <div className={styles.page}>
            <h1>前测问卷</h1>

            <section>
                <h2>人口学信息</h2>

                <label>年龄</label>
                <select value={age} onChange={e => setAge(e.target.value)}>
                    <option value="">请选择</option>
                    {ageOptions.map(opt => <option key={opt}>{opt}</option>)}
                </select>

                <label>性别</label>
                <select value={gender} onChange={e => setGender(e.target.value)}>
                    <option value="">请选择</option>
                    {genderOptions.map(opt => <option key={opt}>{opt}</option>)}
                </select>

                <label>教育程度</label>
                <select value={education} onChange={e => setEducation(e.target.value)}>
                    <option value="">请选择</option>
                    {educationOptions.map(opt => <option key={opt}>{opt}</option>)}
                </select>

                <label>月可支配收入</label>
                <select value={income} onChange={e => setIncome(e.target.value)}>
                    <option value="">请选择</option>
                    {incomeOptions.map(opt => <option key={opt}>{opt}</option>)}
                </select>

                <label className={styles.checkboxGroupLabel}>购物渠道偏好</label>
                <div className={styles.checkboxGroupRow}>
                    {channelOptions.map(opt => (
                        <label key={opt} className={styles.checkboxItem}>
                            <input
                                type="checkbox"
                                checked={channels.includes(opt)}
                                onChange={() => toggleChannel(opt)}
                            />
                            {opt}
                        </label>
                    ))}
                </div>


                <label>直播购物频率</label>
                <select value={frequency} onChange={e => setFrequency(e.target.value)}>
                    <option value="">请选择</option>
                    {frequencyOptions.map(opt => <option key={opt}>{opt}</option>)}
                </select>
            </section>

            <section>
                <h2>IBS 量表</h2>
                {ibsQuestions.map((q, i) => {
                    const [leftWord, rightWord] = ["不同意", "同意"];
                    return (
                        <div key={i} className={styles.questionRow}>
                            <div>{q}</div>
                            <div className={styles.selectRow}>
                                <span className={styles.selectLabel}>{leftWord}</span>
                                <div className={styles.scale}>
                                    {[1, 2, 3, 4, 5, 6, 7].map(n => (
                                        <button
                                            key={n}
                                            className={ibsAnswers[i] === n ? styles.selected : ''}
                                            onClick={() => updateIbsAnswer(i, n)}
                                        >
                                            {""}
                                        </button>
                                    ))}
                                </div>
                                <span className={styles.selectLabel}>{rightWord}</span>
                            </div>
                        </div>
                    );
                })}
            </section>

            <button className={styles.submitBtn} onClick={finish}>
                提交
            </button>
        </div>
    );
}