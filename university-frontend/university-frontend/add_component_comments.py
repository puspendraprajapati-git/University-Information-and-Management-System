import os
import re

base_dirs = [
    r'd:\New Project\university-frontend\university-frontend\src\pages',
    r'd:\New Project\university-frontend\university-frontend\src\components'
]

# Skip files we already perfectly modified manually
skip_files = [
    r'd:\New Project\university-frontend\university-frontend\src\pages\auth\Login.jsx',
    r'd:\New Project\university-frontend\university-frontend\src\pages\auth\Register.jsx',
    r'd:\New Project\university-frontend\university-frontend\src\components\layout\Navbar.jsx'
]

def generate_comment(func_name):
    func_name = func_name.strip()
    if func_name.startswith('handle'):
        action = func_name[6:]
        # Format CamelCase to words
        words = re.sub('([A-Z])', r' \1', action).strip().lower()
        if 'submit' in words:
            return f"// Handle form submission"
        elif 'change' in words:
            return f"// Handle input changes"
        elif 'edit' in words:
            return f"// Handle edit action for {words.replace('edit', '').strip()}"
        elif 'delete' in words:
            return f"// Handle delete action for {words.replace('delete', '').strip()}"
        elif 'show' in words:
            return f"// Show {words.replace('show', '').strip()}"
        elif 'close' in words:
            return f"// Close {words.replace('close', '').strip()}"
        else:
            return f"// Handle {words} action"
    elif func_name.startswith('fetch') or func_name.startswith('load') or func_name.startswith('get'):
        return f"// Fetch latest data from server"
    return None

def add_comments_to_component(filepath):
    if filepath in skip_files:
        return
        
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    lines = content.split('\n')
    new_lines = []
    
    for i, line in enumerate(lines):
        # Look for typical react function definitions:
        # const handleSomething = ...
        # const fetchSomething = ...
        match = re.match(r'^(\s*)const\s+(handle[A-Za-z0-9_]+|fetch[A-Za-z0-9_]+|load[A-Za-z0-9_]+|get[A-Za-z0-9_]+)\s*=', line)
        if match:
            indent = match.group(1)
            func_name = match.group(2)
            comment = generate_comment(func_name)
            
            # Check if there is already a comment in the previous line to avoid duplicates
            if comment:
                # Basic check, if previous line wasn't already a comment
                if i > 0 and not lines[i-1].strip().startswith('//'):
                    # Fix formatting for empty edit/delete
                    if comment.endswith('for '):
                        comment = comment[:-4]
                    new_lines.append(f"{indent}{comment}")
            new_lines.append(line)
        else:
            new_lines.append(line)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write('\n'.join(new_lines).rstrip() + '\n')

for base_dir in base_dirs:
    for root, dirs, files in os.walk(base_dir):
        for file in files:
            if file.endswith('.jsx') or file.endswith('.js'):
                add_comments_to_component(os.path.join(root, file))

print("Comments added to component functions.")
