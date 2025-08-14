import sqlite3
import pandas as pd
import json
import argparse
import os

# 解析命令行参数
parser = argparse.ArgumentParser(description="批量导出指定用户的数据到 Excel")
parser.add_argument("--user_ids", type=int, nargs="+", required=True, help="用户 ID 列表")
args = parser.parse_args()
user_ids = args.user_ids

def decode_unicode_value(val):
    """解码包含 Unicode 转义的字符串或 JSON 列表/字典"""
    if not isinstance(val, str):
        return val
    try:
        if val.strip().startswith("[") or val.strip().startswith("{"):
            return json.loads(val)
        if "\\u" in val:
            return json.loads(f'"{val}"')
    except Exception:
        pass
    return val

for user_id in user_ids:
    db_path = f"user{user_id}.sqlite3"
    if not os.path.exists(db_path):
        print(f"⚠ 数据库文件 {db_path} 不存在，跳过该用户")
        continue

    conn = sqlite3.connect(db_path)

    tables_with_filters = {
        "experiment_experimentinfo": f"subject_id == {user_id}",
        "questionnaire_post_questionnaire": f"id == {user_id}",
        "questionnaire_pre_questionnaire": f"id == {user_id}"
    }

    output_excel = f"{user_id}.xlsx"

    with pd.ExcelWriter(output_excel, engine="xlsxwriter") as writer:
        for table_name, condition in tables_with_filters.items():
            query = f"SELECT * FROM {table_name} WHERE {condition}"
            df = pd.read_sql_query(query, conn)

            for col in df.columns:
                df[col] = df[col].apply(decode_unicode_value)

            df.to_excel(writer, sheet_name=table_name[:31], index=False)
            print(f"已导出 {table_name}（user_id={user_id}，已解码 Unicode 和 JSON 列表）")

    conn.close()
    print(f"✅ 用户 {user_id} 的所有数据已导出到 {output_excel}")