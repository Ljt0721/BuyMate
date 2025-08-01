# Buymate Dev

## Backend

### Backend Setup

```bash
cd buymate-backend
python -m venv venv

source venv/bin/activate  # macOS/Linux
venv\Scripts\activate.bat  # Windows

pip install -r requirements.txt

python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```

### Backend dev

后端两个模块分别用于实验和问卷。数据库稍后确定所有信息格式后建立。  
后端所有完成的 API 需要在 API 文档 buymate-backend/API.md 中写明对应的 URL 和调用格式。  
后端添加新的包后需要更新 requirements.txt  

```bash
pip freeze > requirements.txt
```

AI相关的内容放入 buymate-backend/backend/experiment/ai_utils.py 中供其他文件调用。在所有函数前写明参数类型和返回格式。  

将商品图片，测试视频，以及视频提取的主播说话内容放到 buymate-backend/backend/media 对应的文件夹中。  

## Frontend

### Frontend Setup

首先安装 nvm，参考[链接](https://blog.csdn.net/weixin_57844432/article/details/127788884)

```bash
cd buymate-frontend/buymate-ai
nvm install 18.18.0
nvm use
npm install
npm run dev
```

### Frontend dev

前端目前设计两个页面，分别是实验和问卷。  

#### 实验页面

实验页面中央播放实验视频。设计侧边栏用于主试输入测试信息。  

侧边栏调用后端 API 获取测试对应的视频，主播说话内容以及商品信息。  
实验过程中前端调用后端 API 获取对主播说话内容的实时 AI 转译并且展示。  
实验结束后调用后端 API 向后端报告实验信息，受试人姓名以及数据。  

#### 问卷页面

问卷页面给出受试者问卷提示以及选择题的选择功能。问卷内容保存在前端中直接展示。  
问卷结束后调用后端 API 报告受试人姓名以及答案。

## Git 使用

项目较为简单不再单开分支。提交时写明提交内容即可，格式不限。  

## AI展示流程

tag 模型，转译模型

1. -> tag 模型：if模型识别到了关键词/话术类型 tag模型给出识别到的关键词以及话术类型 else pass
2. -> tag 模型识别到了，相同的话术内容 -> 转译模型 给出一个劝导不要消费的内容
3. 回给前端 两部分，关键词和话术类型 + 劝导内容

tag 模型 system prompt 要有五大类话术的类型+描述+示例词汇， 指导 给出最明显的两个类别/关键词
转译模型 主播说的话+你识别出的类别，要求模型移除此类话术重新表达或者劝导

{
    tag:list
    keyword: list
    content: string
}

弹幕内容：

AI 识别到了关键词 keyboard list，属于tag类别的劝诱
content

D组只念content

1. 给出文内容 -〉 声音 的ai
2. 带时间戳的 网页 代码 输入音频，输出文字，

开发 一套材料 视频，图片，带时间戳的文字内容，问卷内容

视频 -> 音频 -> 先画音轨，取一个阈值，低于阈值认为说完 -> 划分（音频文件名+对应的时间）字典 -> （音频文件 - 文字）loop + 时间 -> json

{
    timestamp
    content
}
