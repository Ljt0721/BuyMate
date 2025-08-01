# sk-f7e82c6b70be4fa8bfd51d4971b90abb  api
import os
import re
import json
import time
import logging
from typing import Optional, Dict, Any
from openai import OpenAI

#配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
default_tag = '''
话术分类一：绝对化描述诱导：
关键词类别：
类别1：最高级副词；示例词汇：最、绝对、完全、彻底、无敌、顶尖、巅峰、极致、完美、无可挑剔；学术依据：《桃花扇》极度程度副词计量研究。
类别2：极端形容词；示例词汇：100%、史上第一、全球唯一、永不、永远、必定、毫无疑问、毫无瑕疵、彻底解决、终极；学术依据：虚假陈述语言学（Shuy, 1998）。
类别3：夸张比较；示例词汇：吊打一切、碾压同行、秒杀全网、完胜、无敌手、行业颠覆、革命性、划时代、空前绝后；学术依据：程度副词演变研究。
类别4：绝对承诺；示例词汇：无效退款、假一赔命、立竿见影、包治百病、一用就白、终身保修、永不反弹；学术依据：广告法违规话术分析。
类别5：排他性表述；示例词汇：仅此一家、独家专利、全网首发、绝无仅有、别无分号、独家渠道、内部特供；学术依据：非黑即白逻辑缺陷。
话术分类二：情感操控诱导：
关键词类别：
类别1：积极情感；示例词汇：爆炸好用、惊艳、绝了、神仙单品、爱了爱了、宝藏、yyds、封神、绝绝子、吹爆；学术依据：情绪词汇与健康研究。
类别2：消极情感；示例词汇：千万别买、踩雷、垃圾、坑爹、血亏、智商税、黑心、骗局、暴雷、一生黑；学术依据：情绪密度计算方法。
类别3：强烈感叹；示例词汇：天呐、OMG、太绝了、救命、离谱、疯了吧、绝了、跪了、炸裂、逆天；学术依据：情感强度计算优化。
类别4：身体反应；示例词汇：笑死、哭晕、气炸、爽翻、惊艳到哭、吓尿、美哭、香迷糊、疼到裂开、酸到掉牙；学术依据：情绪词汇分类研究。
类别5：价值评判；示例词汇：超值、血赚、白菜价、良心、性价比之王、买到赚到、不买后悔、超划算、闭眼入；学术依据：观点词情感分析。
话术分类三：紧迫性驱动诱导：
关键词类别：
类别1：时间限制；示例词汇：最后5分钟、倒计时10秒、零点涨价、限时24小时、今晚截止、错过等一年、手慢无；学术依据：稀缺效应（Worchel et al., 1975）。
类别2：数量限制；示例词汇：只剩3件、限量1000单、售罄不补、绝版珍藏、最后一批、库存告急、抢完下架；学术依据：直播带货话术分析。
类别3：行动指令；示例词汇：快抢、速拍、马上付款、立即下单、抓紧、拼手速、冲啊、赶紧、别犹豫、立刻；学术依据：冲动消费模型（Rook, 1987）。
类别4：机会丧失；示例词汇：错过无、后悔一年、再无此价、下架不补、最后一次、历史最低、再不买没了；学术依据：非理性决策研究。
类别5：即时反馈；示例词汇：已抢光、爆单中、秒没、疯抢、系统卡顿、订单激增、即将售罄、库存预警；学术依据：群体行为心理学。
话术分类四：绝对化描述诱导：
关键词类别：
类别1：最高级副词；示例词汇：所有宝妈都在买、精致女孩必备、聪明人都选、内行人才懂、懂货的秒拍、老粉都知道；学术依据：从众心理（Asch, 1951）。
类别2：极端形容词；示例词汇：我们、咱们、大家、你们、他们、她们、粉丝们、宝宝们、亲们、家人们；学术依据：人称代词社会语言学。
类别3：夸张比较；示例词汇：专家推荐、明星同款、网红爆款、贵妇级、高端人群首选、学霸必备、达人强推；学术依据：社会认同理论。
类别4：绝对承诺；示例词汇：10万人已购、销量冠军、回购率90%、全网断货、5000+好评、零差评、爆卖100万件；学术依据：群体情绪演化研究。
类别5：排他性表述；示例词汇：不是所有人能抢到、只有老粉懂、真爱的才下单、识货的赶紧、不买不是XX人；学术依据：非黑即白逻辑缺陷。
关键词类别：
类别1：强拉因果；示例词汇：用了就白、穿上显瘦、一喷去味、吃一周瘦10斤、三天祛痘、秒变冷白皮、一夜回春；学术依据：强拉因果逻辑缺陷。
类别2：伪科学术语；示例词汇：纳米技术、量子能量、负离子、磁疗、基因修复、干细胞、黑科技、航天材料；学术依据：虚假宣传语言学。
类别3：模糊归因；示例词汇：专家说好、实验证明、数据显示、大多数人反馈、据说、听说、网传、老客户都说；学术依据：归因理论（Kelley, 1973）。
类别4：跳跃结论；示例词汇：所以必须买、因此超值、显然划算、毫无疑问、自然选择、肯定没错、毋庸置疑；学术依据：逻辑连接词误用研究。
类别5：概念混淆；示例词汇：买就是赚、不买亏了、省钱=赚钱、贵有贵的道理、便宜没好货、一分钱一分货；学术依据：非理性消费模型。
'''

class AIService:
    def __init__(self):
        self.client = OpenAI(
            api_key = os.getenv("DASHSCOPE_API_KEY", "sk-f7e82c6b70be4fa8bfd51d4971b90abb"),
            base_url = "https://dashscope.aliyuncs.com/compatible-mode/v1"
        )

        self.default_system_prompt = """你是一个反诱导消费的AI助手，请用简介、准确的中文回答用户的问题。保持回答的有用性和相关性。如果不确定答案，请诚实地说明。"""
    

    def get_tag(self, tag: str = default_tag, speech: str = "") -> Optional[Dict[str, Any]]:
        """
        获取关键词和类型话术
        
        Args:
            tag: 总类别表
            speech:主播的话
  
        
        Returns:
            包含关键词和话术的字典
        """
        try:
            logger.info(f"开始获取tag，话术长度： {len(speech)} 字符，现在时间: {time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}")

            #构建消息列表
            messages = [{"role": "system", "content": self.default_system_prompt},
                        {'role': 'user', 'content': f'''请根据以下话术分类和关键词，分析主播的话术：\n{tag}\n\n话术内容：{speech}
                         请返回如下JSON格式，不要包含多余文字：
                         {{
                            "tags": ["最明显的话术类型，若多个取两个，没有找到的话术类型不要加"],
                            "keywords": ["主播话术内容中的用来判断话术类型的关键词，没有找到关键词就别反悔keywords这个key"],
                         }},注意：关键词必须严格匹配，不得创造新词，如果没有匹配到就返回空'''
                        }]
            0
            response = self.client.chat.completions.create(
                model = "deepseek-v3",
                messages = messages,
                temperature = 0.3,#温和语气
                response_format = {"type":"json_object"}
            )
            content = response.choices[0].message.content

            # 提取 JSON
            json_match = re.search(r'\{[\s\S]*\}', content)
            if not json_match:
                raise ValueError("模型未返回合法 JSON 格式")

            parsed = json.loads(json_match.group())

            # 限制返回的标签最多两个
            parsed["tags"] = parsed.get("tags", [])[:2]

            if not parsed["tags"] or all(not tag.strip() for tag in parsed["tags"]):
                logger.info("未检测到有效话术类型")
                return None

            return parsed
            
        except Exception as e:
            logger.error(f"获取tag失败，错误信息：{e}")
        return {
            "tag": tag,
            "message": f"这是关于{tag}的相关信息。"
        }

    def get_translation(self, tag_result: Dict[str, Any], speech: str) -> Optional[Dict[str, str]]:
        """
        根据 get_tag 的结果生成一个50字以内的劝诱式话术内容

        Args:
            tag_result: get_tag 函数返回的字典，包括 tags 和 keywords 字段
            speech: 主播的话术内容

        Returns:
            包含 suggested_speech 的 JSON 字典
        """
        try:
            tags = tag_result.get("tags", [])
            keywords = tag_result.get("keywords", [])
            logger.info(f"开始生成劝诱式话术，标签: {tags}, 关键词: {keywords}")

            if not tags or not keywords:
                logger.warning("标签或关键词为空，无法生成劝诱话术")
                return None

            tag_str = "、".join(tags)
            keyword_str = "、".join(keywords)

            messages = [
                {"role": "system", "content": self.default_system_prompt},
                {"role": "user", "content": f'''请根据主播的话术，及以下“话术类型”和“关键词”，写一句具有典型劝诱特征的话术内容，50字以内，具有诱导性（比如紧迫、煽情、夸张），返回如下 JSON 格式：

{{
  "suggested_speech": "xxx"
}}

要求：
- 不超过50个字
- 劝诱用户不被直播话术影响
- 语气温和
-尽量多变一下，不要太单一
-考虑商品特性

话术类型：{tag_str}
关键词：{keyword_str}
话术内容：{speech}
'''
                }
            ]

            response = self.client.chat.completions.create(
                model="deepseek-v3",
                messages=messages,
                temperature=0.9,
                response_format={"type": "json_object"}
            )

            content = response.choices[0].message.content

            # 提取 JSON 块
            json_match = re.search(r'\{[\s\S]*\}', content)
            if not json_match:
                raise ValueError("模型未返回合法 JSON")

            result = json.loads(json_match.group())

            return {
                "suggested_speech": result.get("suggested_speech", "").strip()
            }

        except Exception as e:
            logger.error(f"生成诱导话术失败，错误信息：{e}")
            return {
                "suggested_speech": "生成失败"
            }
        except json.JSONDecodeError as e:
            logger.error(f"解析 JSON 失败，错误信息：{e}")
            return {
                "suggested_speech": "生成失败"
            }


if __name__ == "__main__":
    ai_service = AIService()
    tag_result = ai_service.get_tag(speech="我随便乱打的")
    if tag_result:
        translation_result = ai_service.get_translation(tag_result,speech="我随便乱打的")
        if translation_result:
            print("Translation Result:", translation_result)
            print("Tag Result:", tag_result)