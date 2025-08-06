# sk-f7e82c6b70be4fa8bfd51d4971b90abb  api
import os
import re
import json
from typing import Optional, Tuple, List
from openai import OpenAI

default_tag = '''
话术分类一：绝对化描述诱导：
关键词类别：
最高级副词；示例词汇：最、绝对、完全、彻底、无敌、顶尖、巅峰、极致、完美、无可挑剔；
极端形容词；示例词汇：100%、史上第一、全球唯一、永不、永远、必定、毫无疑问、毫无瑕疵、彻底解决、终极；
夸张比较；示例词汇：吊打一切、碾压同行、秒杀全网、完胜、无敌手、行业颠覆、革命性、划时代、空前绝后；
绝对承诺；示例词汇：无效退款、假一赔命、立竿见影、包治百病、一用就白、终身保修、永不反弹；
排他性表述；示例词汇：仅此一家、独家专利、全网首发、绝无仅有、别无分号、独家渠道、内部特供；
话术分类二：情感操控诱导：
关键词类别：
积极情感；示例词汇：爆炸好用、惊艳、绝了、神仙单品、爱了爱了、宝藏、yyds、封神、绝绝子、吹爆；
消极情感；示例词汇：千万别买、踩雷、垃圾、坑爹、血亏、智商税、黑心、骗局、暴雷、一生黑；
强烈感叹；示例词汇：天呐、OMG、太绝了、救命、离谱、疯了吧、绝了、跪了、炸裂、逆天；
身体反应；示例词汇：笑死、哭晕、气炸、爽翻、惊艳到哭、吓尿、美哭、香迷糊、疼到裂开、酸到掉牙；
价值评判；示例词汇：超值、血赚、白菜价、良心、性价比之王、买到赚到、不买后悔、超划算、闭眼入；
话术分类三：紧迫性驱动诱导：
关键词类别：
时间限制；示例词汇：最后5分钟、倒计时10秒、零点涨价、限时24小时、今晚截止、错过等一年、手慢无；
数量限制；示例词汇：只剩3件、限量1000单、售罄不补、绝版珍藏、最后一批、库存告急、抢完下架；
行动指令；示例词汇：快抢、速拍、马上付款、立即下单、抓紧、拼手速、冲啊、赶紧、别犹豫、立刻；
机会丧失；示例词汇：错过无、后悔一年、再无此价、下架不补、最后一次、历史最低、再不买没了；
即时反馈；示例词汇：已抢光、爆单中、秒没、疯抢、系统卡顿、订单激增、即将售罄、库存预警；
话术分类四：绝对化描述诱导：
关键词类别：
最高级副词；示例词汇：所有宝妈都在买、精致女孩必备、聪明人都选、内行人才懂、懂货的秒拍、老粉都知道；
极端形容词；示例词汇：我们、咱们、大家、你们、他们、她们、粉丝们、宝宝们、亲们、家人们；
夸张比较；示例词汇：专家推荐、明星同款、网红爆款、贵妇级、高端人群首选、学霸必备、达人强推；
绝对承诺；示例词汇：10万人已购、销量冠军、回购率90%、全网断货、5000+好评、零差评、爆卖100万件；
排他性表述；示例词汇：不是所有人能抢到、只有老粉懂、真爱的才下单、识货的赶紧、不买不是XX人；
关键词类别：
强拉因果；示例词汇：用了就白、穿上显瘦、一喷去味、吃一周瘦10斤、三天祛痘、秒变冷白皮、一夜回春；
伪科学术语；示例词汇：纳米技术、量子能量、负离子、磁疗、基因修复、干细胞、黑科技、航天材料；
模糊归因；示例词汇：专家说好、实验证明、数据显示、大多数人反馈、据说、听说、网传、老客户都说；
跳跃结论；示例词汇：所以必须买、因此超值、显然划算、毫无疑问、自然选择、肯定没错、毋庸置疑；
概念混淆；示例词汇：买就是赚、不买亏了、省钱=赚钱、贵有贵的道理、便宜没好货、一分钱一分货；
'''

def get_tag(tags: str = default_tag, speech: str = "") -> Optional[Tuple[List[str], List[str]]]:
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
                '    "tags": ["话术类型1 + 关键词类别1", "话术类型2 + 关键词类别2"],\n'
                '    "keywords": ["关键词1", "关键词2"]\n'
                "}\n"
                "注意：tags 最多返回两个话术类型；keywords 允许匹配语义相近的关键词。如果你找到了某个tag，那么你一定要返回至少一个关键词。\n"
                "如果没有找到任何话术类型和关键词，请返回空的 tags 和 keywords 列表。\n"
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

        tags_list = [t.strip() for t in parsed.get("tags", []) if t.strip()]
        tags_list = tags_list[:2]

        keywords_list = [k.strip() for k in parsed.get("keywords", []) if k.strip()] if "keywords" in parsed else []

        return tags_list, keywords_list

    except Exception as e:
        print(f"[get_tag error] {e}")
        return None

def get_translation(tag_result: List[str], keywords: List[str], speech: str) -> Optional[str]:
    messages = [
        {
            "role": "system",
            "content": (
                "你是一个直播过程中的防劝诱助手。根据给出的劝诱类型和关键词，"
                "你需要将主播可能诱导顾客消费的内容，转译成中性、不具有劝诱功能的内容，帮助顾客理性判断。"
                "具体要求包括：\n"
                "   - 去除诱导性、煽动性表达，用客观中立的语气改写；\n"
                "   - 引导用户从自身需求出发理性决策（如建议考虑适用性、实际需求、比价等）；\n"
                "   - 语言简洁自然，避免生硬说教。\n"
                "   - 注意尽量不要与原来的语句太过于相似。同时控制转译的长度，不要超过15个字，严格控制最后返回转译内容的长度。\n"
            )
        },
        {
            "role": "user",
            "content": (
                f"识别到的劝诱类型是：{tag_result}，关键词包括：{keywords}。\n"
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
