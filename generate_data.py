import csv
import random
from datetime import datetime, timedelta

products = ["Lumina Laptop", "Sonic Wireless Buds", "Zenith Smartwatch", "Pulse Fitband", "Aero Tablet"]
months = [
    "2023-01", "2023-02", "2023-03", "2023-04", 
    "2023-05", "2023-06", "2023-07", "2023-08",
    "2023-09", "2023-10", "2023-11", "2023-12"
]
regions = ["North", "South", "East", "West"]

data = []
for month in months:
    for product in products:
        units_sold = random.randint(50, 500)
        revenue_per_unit = random.randint(100, 1500)
        cost_per_unit = random.randint(80, 1200)
        
        revenue = units_sold * revenue_per_unit
        total_cost = units_sold * cost_per_unit
        
        profit = max(0, revenue - total_cost)
        loss = max(0, total_cost - revenue)
        
        data.append({
            "Month": month,
            "Product_Name": product,
            "Units_Sold": units_sold,
            "Revenue": revenue,
            "Cost": total_cost,
            "Profit": profit,
            "Loss": loss,
            "Region": random.choice(regions)
        })

file_path = "c:/Users/owais/OneDrive/Pictures/Desktop/business model/comprehensive_business_data.csv"

with open(file_path, 'w', newline='') as csvfile:
    fieldnames = ["Month", "Product_Name", "Units_Sold", "Revenue", "Cost", "Profit", "Loss", "Region"]
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    writer.writeheader()
    for row in data:
        writer.writerow(row)

print(f"Generated data at {file_path}")
