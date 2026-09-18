import json
import re

transcript_path = "/Users/azhiembetov/.gemini/antigravity-ide/brain/1d6e8f2c-e6eb-457b-9848-29be402fd6d9/.system_generated/logs/transcript_full.jsonl"

def process_diff(diff_text, target_file):
    lines = diff_text.split('\n')
    restored_lines = []
    
    in_diff = False
    for line in lines:
        if line.startswith('@@'):
            in_diff = True
            continue
        if in_diff:
            if line.startswith('-'):
                restored_lines.append(line[1:])
            elif line.startswith(' '):
                restored_lines.append(line[1:])
            
    if restored_lines:
        with open(target_file, 'w') as f:
            f.write('\n'.join(restored_lines) + '\n')
        print(f"Restored {target_file}")

with open(transcript_path, 'r') as f:
    for line in f:
        data = json.loads(line)
        if data.get('type') == 'USER_INPUT':
            content = data.get('content', '')
            if 'The following changes were made by the USER to:' in content:
                blocks = re.split(r'The following changes were made by the USER to: (.*?). If relevant', content)
                for i in range(1, len(blocks), 2):
                    file_path = blocks[i].strip()
                    diff_block = blocks[i+1]
                    
                    match = re.search(r'\[diff_block_start\](.*?)\[diff_block_end\]', diff_block, re.DOTALL)
                    if match:
                        diff_text = match.group(1).strip('\n')
                        process_diff(diff_text, file_path)

