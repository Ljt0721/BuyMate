import asyncio
import edge_tts

def save_to_mp3(text, filepath):

    async def _run():
        communicate = edge_tts.Communicate(
            text=text,
            voice="zh-CN-XiaoxiaoNeural",
            rate="+0%"
        )
        await communicate.save(filepath)

    asyncio.run(_run())
