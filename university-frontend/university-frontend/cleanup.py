import os
import re

base_dir = r'd:\New Project\university-frontend\university-frontend\src'

# Files we already modified manually, so skip them
skip_files = [
    os.path.join(base_dir, 'pages', 'auth', 'Login.jsx'),
    os.path.join(base_dir, 'pages', 'auth', 'Register.jsx'),
    os.path.join(base_dir, 'components', 'layout', 'Navbar.jsx'),
    os.path.join(base_dir, 'context', 'AuthContext.jsx')
]

def clean_file(filepath):
    if filepath in skip_files:
        return

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Remove massive block comments (like /* |-----| ... */)
    # The regex looks for /* followed by any characters until */
    # but we want to be safe and mostly target the ones starting with /* | or /* ---
    content = re.sub(r'/\*[\s\|-]+.*?\*/', '', content, flags=re.DOTALL)
    
    # Alternatively, just remove any block comment that starts with /* and ends with */ 
    # if it's on its own line block. Actually, let's just remove all block comments.
    content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)

    # 2. Remove single line comments that are on their own line.
    # Matches a line that has optional whitespace, then //, then anything, then newline
    # We must ensure we don't accidentally remove actual code.
    lines = content.split('\n')
    cleaned_lines = []
    
    for line in lines:
        stripped = line.lstrip()
        # If it's a full-line comment, skip it
        if stripped.startswith('//'):
            # allow exceptions if we need, but for now we just skip
            continue
        # Also remove trailing empty lines to compress code
        cleaned_lines.append(line)

    # Rejoin lines
    new_content = '\n'.join(cleaned_lines)

    # 3. Remove multiple consecutive blank lines (collapse to max 1)
    new_content = re.sub(r'\n\s*\n\s*\n', '\n\n', new_content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)

for root, dirs, files in os.walk(base_dir):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.js'):
            filepath = os.path.join(root, file)
            clean_file(filepath)

print("Cleanup complete.")
