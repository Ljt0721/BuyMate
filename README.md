# Buymate Dev

## Backend

### Backend Setup

```bash
cd buymate-backend
python -m venv venv

source venv/bin/activate  # macOS/Linux
venv\Scripts\activate.bat  # Windows

pip install -r requirements.txt

# TODO: finish backend setup
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

```bash
# TODO: add frontend setup
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
