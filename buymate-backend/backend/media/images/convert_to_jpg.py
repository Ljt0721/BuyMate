import os
from PIL import Image

def convert_png_to_jpg(folder_path):
    for filename in os.listdir(folder_path):
        if filename.lower().endswith('.png'):
            file_path = os.path.join(folder_path, filename)
            try:
                with Image.open(file_path) as img:
                    # PNG 转 JPG 要去掉透明通道
                    rgb_img = img.convert('RGB')

                    # 保存为 .jpg，文件名相同但后缀改为 .jpg
                    new_filename = os.path.splitext(filename)[0] + '.jpg'
                    new_path = os.path.join(folder_path, new_filename)

                    rgb_img.save(new_path, 'JPEG')
                    print(f"转换成功: {filename} -> {new_filename}")

                # 删除原始 .png 文件
                os.remove(file_path)
                print(f"已删除原文件: {filename}")

            except Exception as e:
                print(f"处理失败: {filename}，错误原因: {e}")
        else:
            print(f"跳过（非PNG）: {filename}")

# 示例用法
if __name__ == "__main__":
    folder = '.'  # ← 修改为你的文件夹路径
    convert_png_to_jpg(folder)