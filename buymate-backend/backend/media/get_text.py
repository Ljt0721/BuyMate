import os
import whisperx
from moviepy import VideoFileClip
import json
from openai import OpenAI
import re

def extract_audio(video_path, audio_path):
    video = VideoFileClip(video_path)
    video.audio.write_audiofile(audio_path, fps=16000)

def transcribe_with_timestamp(audio_path, model, align_model, align_metadata, device):
    result = model.transcribe(audio_path)
    aligned_result = whisperx.align(result["segments"], align_model, align_metadata, audio_path, device)
    word_segments = aligned_result["word_segments"]
    sentence_segments = split_into_sentences(word_segments, pause_threshold=0.1)
    return sentence_segments

def split_into_sentences(words, pause_threshold=0.4):
    sentences = []
    current_sentence = []
    start_time = words[0]['start']

    for i in range(1, len(words)):
        pause = words[i]['start'] - words[i - 1]['start']
        if pause > pause_threshold:
            end_time = words[i - 1]['end']
            text = ''.join([w['word'] for w in current_sentence])
            sentences.append({
                "start": start_time,
                "end": end_time,
                "text": text.strip()
            })
            current_sentence = []
            current_sentence.append(words[i - 1])
            start_time = words[i]['start']
        else:
            current_sentence.append(words[i - 1])

    current_sentence.append(words[-1])
    if current_sentence:
        end_time = current_sentence[-1]['end']
        text = ''.join([w['word'] for w in current_sentence])
        sentences.append({
            "start": start_time,
            "end": end_time,
            "text": text.strip()
        })

    return sentences

def polish_with_ai(sentences):
    messages = [
        {
            "role": "system",
            "content": (
                "你是一个文字拼接助手，用户会发给你带有时间戳的文字内容，但是这些文字内容被划分的太过零碎了，我希望你能够拼接文字内容，保留拼接最开始的时间戳作为整段文字的时间戳。注意我希望得到按句划分的内容，不要拼接的太过厉害。每句的长度在10到30个字之间。"
                "用户发送给你的文件会是一个JSON列表，其中每一个对象有start、end、text三个字段，start和end是时间戳，text是文字内容。"
                "你要返回的是一个相同格式的JSON，不需要包含end字段，只有start和text即可，注意需要是拼接好的text。也就是说你返回的每个text应该在10到30个字之间。"
            )
        },
        {
            "role": "user",
            "content": (
                f"{json.dumps(sentences, ensure_ascii=False)}"
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

        try:
            if content.strip().startswith("```json"):
                content = content.strip()[7:-3].strip()
            parsed = json.loads(content)
            if not isinstance(parsed, list):
                raise ValueError("解析结果不是列表")
            return parsed
        except json.JSONDecodeError as e:
            print("JSON 解析错误：", e)
            return None

    except Exception as e:
        print(f"处理请求时出错: {e}")
        return None
    
def process_video(video_path, output_dir, model, align_model, align_metadata, device):
    base = os.path.splitext(os.path.basename(video_path))[0]
    audio_path = os.path.join(output_dir, base + ".wav")
    txt_path = os.path.join(output_dir, base + "_transcript.json")

    extract_audio(video_path, audio_path)
    # Get word segments with timestamps
    segments = transcribe_with_timestamp(audio_path, model, align_model, align_metadata, device)

    # Polish segments using AI
    segments = polish_with_ai(segments)

    if segments is None:
        print(f"AI处理失败，跳过视频: {video_path}")
        return

    with open(txt_path, 'w', encoding='utf-8') as f:
        json.dump(segments, f, ensure_ascii=False, indent=4)

def batch_process(video_folder, output_dir):
    os.makedirs(output_dir, exist_ok=True)
    device = "cpu"
    model = whisperx.load_model("large-v3", device, compute_type="float32", language="zh")

    # Load alignment model for timestamp refinement
    align_model, align_metadata = whisperx.load_align_model(language_code="zh", device=device)

    for filename in os.listdir(video_folder):
        if filename.endswith(".mp4"):
            video_path = os.path.join(video_folder, filename)
            print(f"Processing: {video_path}")
            process_video(video_path, output_dir, model, align_model, align_metadata, device)

video_folder = "./videos"
output_dir = "./json_outputs"
batch_process(video_folder, output_dir)