import pandas as pd
import json
from pathlib import Path


def convert_trade_data_to_json(input_path):
    # 1. 处理路径
    input_file = Path(input_path)
    # 生成输出路径：同目录，同名但后缀为 .json
    output_file = input_file.with_suffix('.json')

    print(f"正在读取文件: {input_file}")

    try:
        # 2. 读取 Excel 的 Sheet1
        # 使用 str(input_file) 是因为 pandas 有时对 Path 对象支持的引擎有限
        df = pd.read_excel(str(input_file), sheet_name='Data', engine='openpyxl')

        # 3. 处理特殊数据类型（如日期或空值）
        # 将日期转换为字符串，防止 JSON 序列化失败
        for col in df.select_dtypes(include=['datetime']).columns:
            df[col] = df[col].dt.strftime('%Y-%m-%d')

        # 4. 转换为列表字典格式 (Records)
        # 这种格式在 Cursor 中最容易被 AI 理解和进行数据检索
        data = df.to_dict(orient='records')

        # 5. 写入文件
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=4)

        print(f"转换成功！")
        print(f"输出位置: {output_file}")

    except Exception as e:
        print(f"处理失败，错误原因: {e}")


# 执行转换
file_path = r"E:\Sun.Jacky\大学\大二下\大数据可视化\作业三\一带一路-各国宏观贸易统计.xlsx"
convert_trade_data_to_json(file_path)