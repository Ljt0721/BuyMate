// import { useState } from 'react';
// import { Button } from '@/components/ui/button';

// const ageOptions = ['18-25', '26-35', '36-45', '46+'];
// const genderOptions = ['男', '女', '非二元', '不愿透露'];
// const educationOptions = ['高中及以下', '本科', '硕士', '博士'];
// const incomeOptions = ['＜3000元', '3000-6000元', '6000-10000元', '＞10000元'];
// const shoppingOptions = ['小红书', '抖音', '快手', '淘宝', '京东', '哔哩哔哩', '其他'];
// const frequencyOptions = ['从不', '每月少于1次', '每月1-3次', '每周1-2次', '每周多次'];

// const ibsQuestions = [
//   '我买东西之前都会仔细考虑',
//   '我只买我自己打算买的东西',
//   '如果我买东西，通常都是我自愿去买的',
//   '我买的大部分东西都是提前计划好的',
//   '我只买我自己需要的东西',
//   '我不喜欢仅仅买东西',
//   '买之前我喜欢比较不同牌子',
//   '在买之前我都会仔细考虑是否真的需要',
//   '我习惯“当场”买东西',
//   '我经常不假思索地买东西',
//   '我很难不买我发现的好东西',
//   '我有时无法抑制想买东西的感觉',
//   '我有时买完东西会感到内疚',
//   '我不是那种对看到的商品“一见钟情”的人',
//   '如果我看到我想买的东西，我会变得非常兴奋',
//   '每当我经过商店时，我总能看到一些好东西',
//   '我发现我很难拒绝便宜货',
//   '如果我看到新的东西，我就想买下来',
//   '我买东西有点鲁莽',
//   '我有时买东西是因为我喜欢买东西，而不是因为我需要它们',
// ];

// export default function PreQuestionnairePage() {
//   const [form, setForm] = useState({
//     age: '',
//     gender: '',
//     education: '',
//     income: '',
//     shopping_preferences: [],
//     live_shopping_frequency: '',
//     ibs_answers: Array(20).fill(0),
//   });

//   const handleIbsChange = (index: number, value: number) => {
//     const updated = [...form.ibs_answers];
//     updated[index] = value;
//     setForm({ ...form, ibs_answers: updated });
//   };

//   const toggleShoppingPref = (item: string) => {
//     const prefs = form.shopping_preferences.includes(item)
//       ? form.shopping_preferences.filter(i => i !== item)
//       : [...form.shopping_preferences, item];
//     setForm({ ...form, shopping_preferences: prefs });
//   };

//   return (
//     <div className="max-w-3xl mx-auto p-6 space-y-8">
//       <h1 className="text-2xl font-bold">填写前置问卷</h1>

//       {/* 单选项 */}
//       {[['年龄', 'age', ageOptions], ['性别', 'gender', genderOptions], ['教育程度', 'education', educationOptions], ['月收入', 'income', incomeOptions], ['直播购物频率', 'live_shopping_frequency', frequencyOptions]].map(([label, key, options]) => (
//         <div key={key}>
//           <h2 className="font-semibold mb-2">{label}</h2>
//           <div className="flex flex-wrap gap-4">
//             {(options as string[]).map(opt => (
//               <Button
//                 key={opt}
//                 variant={form[key as keyof typeof form] === opt ? 'default' : 'outline'}
//                 onClick={() => setForm({ ...form, [key]: opt })}
//               >
//                 {opt}
//               </Button>
//             ))}
//           </div>
//         </div>
//       ))}

//       {/* 多选购物渠道 */}
//       <div>
//         <h2 className="font-semibold mb-2">购物渠道偏好（可多选）</h2>
//         <div className="flex flex-wrap gap-4">
//           {shoppingOptions.map(opt => (
//             <Button
//               key={opt}
//               variant={form.shopping_preferences.includes(opt) ? 'default' : 'outline'}
//               onClick={() => toggleShoppingPref(opt)}
//             >
//               {opt}
//             </Button>
//           ))}
//         </div>
//       </div>

//       {/* IBS 选择题 */}
//       <div className="space-y-6">
//         <h2 className="text-xl font-bold">消费行为调查（1-7 分制）</h2>
//         {ibsQuestions.map((q, idx) => (
//           <div key={idx}>
//             <p className="mb-2">{q}</p>
//             <div className="flex gap-3">
//               {Array.from({ length: 7 }, (_, i) => i + 1).map(val => (
//                 <div
//                   key={val}
//                   className={`w-6 h-6 rounded-full border flex items-center justify-center cursor-pointer ${
//                     form.ibs_answers[idx] === val ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'
//                   }`}
//                   onClick={() => handleIbsChange(idx, val)}
//                 >
//                   {val}
//                 </div>
//               ))}
//             </div>
//           </div>
//         ))}
//       </div>

//       <Button className="mt-6">提交问卷</Button>
//     </div>
//   );
// }

