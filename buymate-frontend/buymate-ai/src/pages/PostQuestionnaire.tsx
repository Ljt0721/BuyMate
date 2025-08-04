// src/pages/PostQuestionnaire.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Questionnaire.module.css';

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

const acceptabilityQuestions = [
    '我认为我会经常使用这个系统。',
    '我觉得这个系统不必要地复杂，有很多设计多余的地方。',
    '我觉得这个系统很容易使用。',
    '我认为如果没有技术人员的帮助，我会很难使用这个系统。',
    '我觉得这个系统的各项功能整合得很好。',
    '我觉得这个系统存在太多不一致的地方。',
    '我认为大多数人很快就能学会使用这个系统。',
    '我觉得这个系统使用起来非常繁琐。',
    '我在使用这个系统时感到很有信心。',
    '在开始使用这个系统之前，我需要先学习很多东西。',
];

const ueqQuestions = [
    ['令人不快的', '令人愉快的'],
    ['费解的', '易懂的'],
    ['富创造力的', '平淡无奇的'],
    ['易学的', '难学的'],
    ['有价值的', '低劣的'],
    ['乏味的', '带劲的'],
    ['无趣的', '有趣的'],
    ['无法预测的', '可预见的'],
    ['快的', '慢的'],
    ['独创的', '俗套的'],
    ['妨碍的', '支持性的'],
    ['好的', '差的'],
    ['复杂的', '简单的'],
    ['令人厌恶的', '招人喜爱的'],
    ['传统的', '新颖的'],
    ['不合意的', '合意的'],
    ['可靠的', '靠不住的'],
    ['令人兴奋的', '令人昏昏欲睡的'],
    ['符合预期的', '不合期望的'],
    ['低效的', '高效的'],
    ['一目了然的', '令人眼花缭乱的'],
    ['不实用的', '实用的'],
    ['井然有序的', '杂乱无章的'],
    ['吸引人的', '无吸引力的'],
    ['引起好感的', '令人反感的'],
    ['保守的', '创新的'],
];

export default function PostQuestionnaire() {
    const nav = useNavigate();

    const [userId] = useState(() => sessionStorage.getItem('exp:userId') || '');
    const [ibsAnswers, setIbsAnswers] = useState<number[]>(Array(20).fill(0));
    const [accept, setAccept] = useState<number[]>(Array(10).fill(0));
    const [ueq, setUeq] = useState<number[]>(Array(26).fill(0));

    const updateIbsAnswer = (index: number, value: number) => {
        const newAnswers = [...ibsAnswers];
        newAnswers[index] = value;
        setIbsAnswers(newAnswers);
    };

    const updateAcceptAnswer = (index: number, value: number) => {
        const newAnswers = [...accept];
        newAnswers[index] = value;
        setAccept(newAnswers);
    };

    const updateUeqAnswer = (index: number, value: number) => {
        const newAnswers = [...ueq];
        newAnswers[index] = value;
        setUeq(newAnswers);
    };

    const finish = () => {
        if (!userId) return alert('缺少用户 ID');
        if (ibsAnswers.some(a => a < 1 || a > 7)) return alert('请完成所有 IBS 题目');
        if (accept.some(a => a < 1 || a > 5)) return alert('请完成所有系统接受度题目');
        if (ueq.some(a => a < 1 || a > 7)) return alert('请完成所有 UEQ 题目');
        nav('/');
    };

    return (
        <div className={styles.page}>
            <h1>后测量表</h1>

            <section>
                <h2>一，IBS 量表</h2>
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

            <section>
                <h2>二，系统接受度与用户满意度量表</h2>
                {acceptabilityQuestions.map((q, i) => {
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
                                            className={accept[i] === n ? styles.selected : ''}
                                            onClick={() => updateAcceptAnswer(i, n)}
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

            <section>
                <h2>三，UEQ 量表</h2>
                <p className={styles.description}>
                    请告诉我们你的看法。
                    <br />
                    请填写以下问卷来评价该产品。问卷由 26 对语义相反的形容词组成，每组词分别描述产品的某方面属性。每对反义词之间划分为 7 个评分等级，每个等级由一个圆圈表示。请根据产品与形容词的相符程度评判该产品，在你认为最适合表达你的主观感受的圆圈处打勾。
                    <br /><br />
                    例如：吸引人的 ○ √ ○ ○ ○ ○ ○ 无吸引力的
                    <br />
                    在此圆圈处打勾代表你倾向认为该产品有较大吸引力。
                    <br /><br />
                    请尽量凭直觉回答，不必过多考虑。这样才能最有效地告诉我们你的第一印象。
                    <br />
                    有时你可能对某一项的评价不完全确定，或者觉得两个形容词都不太适合用来描述该产品，即使出现这些情况也请务必选择一个选项。答案并无对错之分。我们关心的是你的个人看法！
                </p>
                {ueqQuestions.map((q, i) => {
                    const [leftWord, rightWord] = q;
                    return (
                        <div key={i} className={styles.questionRow}>
                            <div className={styles.selectRow}>
                                <span className={styles.selectLabel}>{leftWord}</span>
                                <div className={styles.scale}>
                                    {[1, 2, 3, 4, 5, 6, 7].map(n => (
                                        <button
                                            key={n}
                                            className={ueq[i] === n ? styles.selected : ''}
                                            onClick={() => updateUeqAnswer(i, n)}
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