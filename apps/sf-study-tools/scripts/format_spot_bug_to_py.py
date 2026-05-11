import json
from pprint import pformat
from pathlib import Path

def main():
    # Paths
    json_path = Path(__file__).parent / 'src' / 'data' / 'spotBugProblems.json'
    py_path = json_path.with_suffix('.py')

    # Load JSON data
    with json_path.open('r', encoding='utf-8') as jf:
        data = json.load(jf)

    # Format as Python literal
    formatted = pformat(data, width=120)

    # Write to .py file
    with py_path.open('w', encoding='utf-8') as pf:
        pf.write('# Auto-generated from spotBugProblems.json\n')
        pf.write('spotBugProblems = ')  
        pf.write(formatted)  
        pf.write('\n')

if __name__ == '__main__':
    main()
