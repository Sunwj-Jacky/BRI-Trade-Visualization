import pandas as pd
import json

# Read the Excel file
excel_file = "一带一路-各国宏观贸易统计.xlsx"
df = pd.read_excel(excel_file)

print("Excel columns:", df.columns.tolist())
print("Shape:", df.shape)
print("\nFirst few rows:")
print(df.head())
print("\nUnique countries:", df['国家'].unique() if '国家' in df.columns else "No '国家' column")
