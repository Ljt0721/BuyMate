# Python 3.11 安装教程

## 安装视频指导

Mac 安装：[视频链接](https://www.bilibili.com/video/BV1rkwpe8ESS?vd_source=bb49e3b344032077fd23f649283a3594)
Windows 安装：[视频链接](https://www.bilibili.com/video/BV141gPzeEVK?vd_source=bb49e3b344032077fd23f649283a3594)

## 一、确认是否已安装 Python 3.11

在终端（macOS）或命令提示符（Windows）中输入：

```bash
python3 --version
```

或

```bash
python --version
```

如果显示版本号且为 **Python 3.11.x**，说明已安装；否则请继续以下步骤。

## 二、macOS 安装 Python 3.11

### 方法一：使用 Homebrew

1. 打开终端 Terminal

2. 安装 Homebrew（若尚未安装）：

   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

3. 安装 Python 3.11：

   ```bash
   brew install python@3.11
   ```

4. 验证安装：

   ```bash
   python3 --version
   ```

### 方法二：通过官网下载

1. 访问官网：[https://www.python.org/downloads/release/python-3110/](https://www.python.org/downloads/release/python-3110/)
2. 下载适用于 macOS 的 `.pkg` 安装包
3. 双击安装包并按提示完成安装
4. 验证安装：

   ```bash
   python3 --version
   ```

## 三、Windows 安装 Python 3.11

1. 访问官网：[https://www.python.org/downloads/release/python-3110/](https://www.python.org/downloads/release/python-3110/)
2. 下载适用于 Windows 的安装程序（`.exe` 文件）
3. 双击运行安装器，**务必勾选**：

   * “Add Python to PATH”
4. 点击 “Install Now”，等待安装完成
5. 验证安装：

   ```cmd
   python --version
   ```

   若输出 **Python 3.11.x**，说明安装成功。

## 四、验证 pip

Python 3.11 自带 pip，可通过以下命令验证：

```bash
pip --version
```
