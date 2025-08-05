import asyncio
import edge_tts
import os
import time

def save_to_mp3(text, filepath):
    async def _run():
        communicate = edge_tts.Communicate(
            text=text,
            voice="zh-CN-XiaoxiaoNeural",
            rate="+0%"
        )
        await communicate.save(filepath)

    try:
        asyncio.run(_run())
    except RuntimeError:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            task = loop.create_task(_run())
            loop.run_until_complete(task)
        else:
            loop.run_until_complete(_run())

    timeout = 10
    waited = 0
    while not os.path.exists(filepath) and waited < timeout:
        time.sleep(0.1)
        waited += 0.1

    if not os.path.exists(filepath):
        raise FileNotFoundError(f"保存音频失败：未生成文件 {filepath}")
