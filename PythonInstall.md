# Python 安装教程

## 安装视频指导

Mac 安装：[视频链接](https://www.bilibili.com/video/BV1rkwpe8ESS?vd_source=bb49e3b344032077fd23f649283a3594)
Windows 安装：[视频链接](https://www.bilibili.com/video/BV141gPzeEVK?vd_source=bb49e3b344032077fd23f649283a3594)

## 一、确认是否已安装 Python

在终端（macOS）或命令提示符（Windows）中输入：

```bash
python --version
```

或

```bash
python3 --version
```

如果显示版本号，如 `Python 3.12.1`，说明已安装；若显示 `command not found` 或 `'python' 不是内部或外部命令`，请继续以下步骤。

## 二、macOS 安装教程

### 方式一：使用 Homebrew

1. 打开终端 Terminal

2. 安装 Homebrew（若尚未安装）：

   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

3. 安装 Python：

   ```bash
   brew install python
   ```

4. 验证安装：

   ```bash
   python3 --version
   ```

### 方式二：通过官网下载

1. 访问官网：[https://www.python.org/downloads/macos/](https://www.python.org/downloads/macos/)
2. 下载最新版本的 macOS 安装包（`.pkg` 文件）
3. 双击安装包并按提示完成安装
4. 打开终端，验证安装：

   ```bash
   python3 --version
   ```

## 三、Windows 安装教程

1. 打开浏览器，访问官网：[https://www.python.org/downloads/windows/](https://www.python.org/downloads/windows/)
2. 点击 **Download Python 3.x.x**
3. 下载后双击运行安装器，**注意勾选如下选项**：

   * “Add Python to PATH”
   * “Install for all users”（可选）
4. 点击 “Install Now”，等待安装完成
5. 打开命令提示符（Win + R 输入 `cmd`），输入：

   ```cmd
   python --version
   ```

   若输出版本号，说明安装成功！

## 四、安装 pip 和虚拟环境工具（已包含在官方安装包中）

验证 pip：

```bash
pip --version
```
