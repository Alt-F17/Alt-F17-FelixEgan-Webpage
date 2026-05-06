import ast
import json
import os
import re


def parse_questions(path):
    with open(path, 'r', encoding='utf-8') as f:
        source = f.read()
    mod = ast.parse(source)
    questions = []
    for node in mod.body:
        if isinstance(node, ast.FunctionDef) and node.name.startswith('question_'):
            doc = ast.get_docstring(node)
            if not doc:
                continue
            lines = doc.split('\n')
            question_parts = []
            choices = []
            for line in lines:
                stripped = line.strip()
                # detect choice lines starting with A), B), etc.
                match = re.match(r'^([A-Z])\)\s*(.*)', stripped)
                if match:
                    choices.append(match.group(2))
                else:
                    if not choices and stripped:
                        question_parts.append(stripped)
            if choices:
                question_text = "\n".join(question_parts)
                # escape newlines in choices for JSON
                escaped_choices = [ch.replace("\n", "\\n") for ch in choices]
                questions.append({
                    "code": question_text,
                    "choices": escaped_choices,
                    "correct": "X"
                })
    return questions


def main():
    # project root contains this script
    repo_root = os.path.dirname(os.path.abspath(__file__))
    questions_file = os.path.join(repo_root, 'questions.py')
    concept_file = os.path.join(repo_root, 'src', 'data', 'conceptTests.json')

    if not os.path.exists(questions_file):
        print(f"questions.py not found at {questions_file}")
        return
    if not os.path.exists(concept_file):
        print(f"conceptTests.json not found at {concept_file}")
        return

    new_entries = parse_questions(questions_file)

    # load existing data
    with open(concept_file, 'r+', encoding='utf-8') as f:
        try:
            data = json.load(f)
        except json.JSONDecodeError:
            data = []
        # append new entries
        data.extend(new_entries)
        f.seek(0)
        json.dump(data, f, indent=2)
        f.truncate()

    print(f"Appended {len(new_entries)} questions to conceptTests.json")


if __name__ == '__main__':
    main()
