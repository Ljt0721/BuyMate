# sk-f7e82c6b70be4fa8bfd51d4971b90abb  api
import os
import re
import json
from typing import Optional, Tuple, List
from openai import OpenAI

default_tag = """
话术分类一：绝对化描述诱导
1. 最高级副词表达：
最、绝对、完全、彻底、无敌、顶尖、巅峰、极致、完美、无可挑剔
2. 极端形容与承诺：
100%、史上第一、全球唯一、永不、永远、必定、毫无疑问、毫无瑕疵、彻底解决、终极、
无效退款、假一赔命、立竿见影、包治百病、一用就白、终身保修、永不反弹
3. 夸张比较与排他描述：
吊打一切、碾压同行、秒杀全网、完胜、无敌手、行业颠覆、革命性、划时代、空前绝后、
仅此一家、独家专利、全网首发、绝无仅有、别无分号、独家渠道、内部特供

话术分类二：情感操控诱导
1. 强烈积极或消极情绪：
爆炸好用、惊艳、绝了、神仙单品、爱了爱了、宝藏、yyds、封神、绝绝子、吹爆、
千万别买、踩雷、垃圾、坑爹、血亏、智商税、黑心、骗局、暴雷、一生黑
2. 强感叹词与身体反应：
天呐、OMG、太绝了、救命、离谱、疯了吧、跪了、炸裂、逆天、
笑死、哭晕、气炸、爽翻、惊艳到哭、吓尿、美哭、香迷糊、疼到裂开、酸到掉牙
3. 情绪化价值评判：
超值、血赚、白菜价、良心、性价比之王、买到赚到、不买后悔、超划算、闭眼入

话术分类三：紧迫性驱动诱导
1. 时间紧迫提示：
最后5分钟、倒计时10秒、零点涨价、限时24小时、今晚截止、错过等一年、手慢无
2. 数量稀缺暗示：
只剩3件、限量1000单、售罄不补、绝版珍藏、最后一批、库存告急、抢完下架
3. 行动指令与刺激：
快抢、速拍、马上付款、立即下单、抓紧、拼手速、冲啊、赶紧、别犹豫、立刻
4. 丧失机会恐吓：
错过无、后悔一年、再无此价、下架不补、最后一次、历史最低、再不买没了
5. 即时抢购反馈：
已抢光、爆单中、秒没、疯抢、系统卡顿、订单激增、即将售罄、库存预警

话术分类四：群体认同诱导
1. 群体从众表达：
所有宝妈都在买、精致女孩必备、聪明人都选、内行人才懂、懂货的秒拍、老粉都知道
2. 强化归属感称呼：
我们、咱们、大家、你们、他们、她们、粉丝们、宝宝们、亲们、家人们
3. 以名人或专家背书：
专家推荐、明星同款、网红爆款、贵妇级、高端人群首选、学霸必备、达人强推
4. 销量与口碑压迫：
10万人已购、销量冠军、回购率90%、全网断货、5000+好评、零差评、爆卖100万件
5. 排他与身份认同：
不是所有人能抢到、只有老粉懂、真爱的才下单、识货的赶紧、不买不是XX人

话术分类五：伪逻辑与概念误导诱导
1. 强拉因果：
用了就白、穿上显瘦、一喷去味、吃一周瘦10斤、三天祛痘、秒变冷白皮、一夜回春
2. 伪科学术语包装：
纳米技术、量子能量、负离子、磁疗、基因修复、干细胞、黑科技、航天材料
3. 模糊信息来源：
专家说好、实验证明、数据显示、大多数人反馈、据说、听说、网传、老客户都说
4. 跳跃性结论：
所以必须买、因此超值、显然划算、毫无疑问、自然选择、肯定没错、毋庸置疑
5. 混淆逻辑概念：
买就是赚、不买亏了、省钱=赚钱、贵有贵的道理、便宜没好货、一分钱一分货
"""


def get_tag(tags: str = default_tag, speech: str = "") -> Optional[Tuple[str, str]]:
    messages = [
        {
            "role": "system",
            "content": (
                "你是一个识别直播话术类型的专家，能够分析主播的话术内容并提取关键词。"
                "你要根据下面给定的话术分类和关键词类别，分析主播的话术内容，"
                "识别出话术类型和关键词类别以及对应的关键词。\n"
                f"给定的话术分类和关键词如下：{tags}\n"
                "你最后要返回的 JSON 格式如下：\n"
                "{\n"
                '    "tag": "话术类型",\n'
                '    "keyword": "关键词"\n'
                "}\n"
                "注意：tag 返回一个话术类型；话术类型只能是‘绝对化描述诱导’，‘情感操控诱导’，"
                "‘紧迫性驱动诱导’，‘群体认同诱导’，‘伪逻辑与概念误导诱导’中的一个。\n"
                "keyword 允许匹配语义特别相近的关键词。如果你找到了某个 tag，那么你一定要返回至少一个关键词。注意keyword不要过长，保持在5个字以内。注意keyword不能仅包含数字。\n"
                "如果没有找到任何话术类型和关键词，请返回空的 tag 和 keyword。\n"
            )
        },
        {
            "role": "user",
            "content": (
                f"分析主播的话术：{speech}\n"
                "严格按照规定的 JSON 格式返回结果。"
            )
        }
    ]

    client = OpenAI(
        api_key=os.getenv("DASHSCOPE_API_KEY", "sk-f7e82c6b70be4fa8bfd51d4971b90abb"),
        base_url="https://dashscope.aliyuncs.com/compatible-mode/v1"
    )

    try:
        response = client.chat.completions.create(
            model="deepseek-v3",
            messages=messages,
            temperature=0.3,
            response_format={"type": "json_object"}
        )

        content = response.choices[0].message.content
        if not content or not isinstance(content, str):
            raise ValueError("响应内容为空或格式异常")

        json_match = re.search(r'\{[\s\S]*\}', content)
        if not json_match:
            raise ValueError("未找到合法 JSON 结构")

        parsed = json.loads(json_match.group())

        tag = parsed.get("tag", "").strip()
        keyword = parsed.get("keyword", "").strip()

        return (tag, keyword) if tag and keyword else ("", "")

    except Exception as e:
        print(f"[get_tag error] {e}")
        return None

def get_translation(tag: str, keyword: str, speech: str) -> Optional[str]:
    messages = [
        {
            "role": "system",
            "content": (
                "你是一个直播防劝诱助手，负责将主播话术中可能存在的消费诱导内容转译为更理性、具有辨别力的表达。\n\n"
                "你的目标不是评判主播的话术，而是用‘主播口吻’补充理性建议，引导用户结合实际做出判断。\n\n"
                "请根据提供的劝诱类型、关键词和话术，完成以下要求：\n"
                "1. 输出内容要以‘主播说’等句式开头，延续主播语境；\n"
                "2. 在指出主播说法的同时加入辨析，例如‘有点夸张’‘看个人需求’‘并不适合所有人’等；\n"
                "3. 建议部分要自然融入，不强行说教；\n"
                "4. 最终内容口吻真实自然、结构清晰，控制在 **25 个字以内**；\n"
                "5. 严禁直接复述原话术，不能仅是关键词替换，必须包含新的判断或建议；\n"
                "6. 可以在最后加入劝导合理购物的建议。"
                )
        },              
        {
            "role": "user",
            "content": (
                f"识别到的劝诱类型是：{tag}，关键词是：{keyword}。\n"
                f"请对以下主播话术进行转译，去除其中的劝诱意图：\n"
                f"{speech}\n"
                "请严格返回如下 JSON 格式：\n"
                "{\n"
                '  "suggested_speech": "转译后的内容"\n'
                "}"
            )
        }
    ]

    client = OpenAI(
        api_key=os.getenv("DASHSCOPE_API_KEY", "sk-f7e82c6b70be4fa8bfd51d4971b90abb"),
        base_url="https://dashscope.aliyuncs.com/compatible-mode/v1"
    )

    try:
        response = client.chat.completions.create(
            model="deepseek-v3",
            messages=messages,
            temperature=0.9,
            response_format={"type": "json_object"}
        )

        content = response.choices[0].message.content
        if not content or not isinstance(content, str):
            raise ValueError("响应内容为空或格式非法")

        json_match = re.search(r'\{[\s\S]*\}', content)
        if not json_match:
            raise ValueError("未找到合法 JSON 结构")

        result = json.loads(json_match.group())

        suggested = result.get("suggested_speech", "").strip()
        if not suggested:
            raise ValueError("未返回有效转译内容")

        return suggested

    except Exception as e:
        print(f"[get_translation error] {e}")
        return None
