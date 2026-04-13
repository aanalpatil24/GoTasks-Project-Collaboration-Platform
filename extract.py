import os

with open('codebase.txt', 'r', encoding='utf-8') as file:
    content = file.read()

parts = content.split('================================================================================')

for i in range(1, len(parts), 2):
    if 'FILE:' in parts[i]:
        filepath = parts[i].replace('FILE:', '').strip()
        filecontent = parts[i+1].strip() + '\n'

        # Safely get the directory name
        dir_name = os.path.dirname(filepath)
        
        # Only try to create the folder if a folder path actually exists
        if dir_name:
            os.makedirs(dir_name, exist_ok=True)
            
        with open(filepath, 'w', encoding='utf-8') as outfile:
            outfile.write(filecontent)
        print(f"Created: {filepath}")