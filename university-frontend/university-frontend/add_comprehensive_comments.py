import os
import re

base_dirs = [
    r'd:\New Project\university-frontend\university-frontend\src\pages',
    r'd:\New Project\university-frontend\university-frontend\src\components'
]

skip_files = [
    r'd:\New Project\university-frontend\university-frontend\src\pages\auth\Login.jsx',
    r'd:\New Project\university-frontend\university-frontend\src\pages\auth\Register.jsx',
    r'd:\New Project\university-frontend\university-frontend\src\components\layout\Navbar.jsx'
]

def generate_comment(func_name):
    func_name = func_name.strip()
    words = re.sub('([A-Z])', r' \1', func_name).strip().lower()
    
    if func_name.startswith('handle'):
        if 'submit' in words: return f"// Handle form submission"
        if 'change' in words: return f"// Handle input changes"
        if 'edit' in words: return f"// Handle edit action"
        if 'delete' in words: return f"// Handle delete action"
        if 'show' in words: return f"// Show modal or component"
        if 'close' in words: return f"// Close modal or component"
        return f"// Handle {words[7:]} action"
    elif func_name.startswith('fetch') or func_name.startswith('load') or func_name.startswith('get'):
        return f"// Fetch data from server"
    elif func_name.startswith('open'):
        return f"// Open {words[5:]} dialog"
    elif func_name.startswith('set'):
        return f"// Update {words[4:]} state"
    else:
        return f"// Execute {words} function"

def add_comments_to_component(filepath):
    if filepath in skip_files:
        return
        
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    lines = content.split('\n')
    new_lines = []
    
    for i, line in enumerate(lines):
        # Match ANY arrow function assignment: const myFunc = (...) => {
        match = re.match(r'^(\s*)const\s+([A-Za-z0-9_]+)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[A-Za-z0-9_]+)\s*=>\s*\{', line)
        if match:
            indent = match.group(1)
            func_name = match.group(2)
            
            # Skip uppercase components (e.g. const Semesters = () => {)
            if func_name[0].isupper():
                new_lines.append(line)
                continue
                
            comment = generate_comment(func_name)
            
            # Check if previous line is already a comment
            has_comment = False
            if i > 0 and lines[i-1].strip().startswith('//'):
                has_comment = True
                
            if not has_comment and comment:
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

print("Comprehensive comments added to component functions.")
