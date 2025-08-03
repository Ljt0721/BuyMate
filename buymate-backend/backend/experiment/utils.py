import asyncio
import edge_tts

def save_to_mp3(text, time):
    filename = f"{time}-output.mp3"

    async def _run():
        communicate = edge_tts.Communicate(
            text=text,
            voice="zh-CN-XiaoxiaoNeural",
            rate="+0%"
        )
        await communicate.save(filename)

    asyncio.run(_run())
