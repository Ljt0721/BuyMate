# Buymate Setup

## Backend Setup

首先安装python，在MacOS或Windows上安装 python 的指导在 [PythonInstall.pdf](PythonInstall.pdf)

安装 python 后，从云盘下载实验所需视频资源[云盘链接](https://pan.quark.cn/s/a9c07f40cb01)，将**下载后的所有视频**从原文件夹中转移到 `buymate-backend/backend/media/videos`，注意**只转移视频文件到目标文件夹中，不要将下载的视频文件夹放入目标文件夹**

视频转移完成后，从主文件夹Buymate中打开终端，在终端中逐个运行下面的命令。注意运行所有命令后，**在实验过程中保持该终端开启**

```bash
cd buymate-backend
python -m venv venv

source venv/bin/activate  # macOS/Linux
venv\Scripts\activate.bat  # Windows

pip install -r requirements.txt

cd backend
python manage.py makemigrations
python manage.py migrate
python manage.py import_products
python manage.py runserver
```

## Frontend Setup

首先安装 nvm，参考[链接](https://blog.csdn.net/weixin_57844432/article/details/127788884)

安装完成后，在主文件夹Buymate中打开终端，逐个运行下面的命令，之后打开在浏览器中打开[链接](http://localhost:5173/)即可访问实验页面。**在实验过程中保持该终端开启**

```bash
cd buymate-frontend/buymate-ai
nvm install 18.18.0
nvm use
npm install
npm run dev
```

## After Experiment

实验完成后，分别在前端终端和后端终端中运行 Ctrl+C（Windows）或Command+C（MacOS）结束运行即可。
结束运行后，找到 [数据库文件](buymate-backend/backend/db.sqlite3) 提交
