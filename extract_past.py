import json

transcript_path = '/Users/azhiembetov/.gemini/antigravity-ide/brain/1d6e8f2c-e6eb-457b-9848-29be402fd6d9/.system_generated/logs/transcript_full.jsonl'
files_to_restore = {}

with open(transcript_path, 'r') as f:
    for line in f:
        try:
            data = json.loads(line)
        except:
            continue
            
        if data.get('type') == 'PLANNER_RESPONSE':
            tool_calls = data.get('tool_calls', [])
            for tc in tool_calls:
                name = tc.get('name')
                args = tc.get('args', {})
                if name == 'default_api:write_to_file':
                    target = args.get('TargetFile')
                    content = args.get('CodeContent')
                    if target and content:
                        files_to_restore[target] = content
                        
                elif name == 'default_api:multi_replace_file_content':
                    pass

for file, content in files_to_restore.items():
    if file.endswith('.html'):
        with open(file, 'w') as f:
            f.write(content)
        print(f"Restored from history: {file}")

