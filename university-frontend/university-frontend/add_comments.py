import os
import re

services_dir = r'd:\New Project\university-frontend\university-frontend\src\services'

def add_comments_to_service(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    lines = content.split('\n')
    new_lines = []
    
    for line in lines:
        match = re.match(r'export const (get|create|update|delete|search|login|register)([A-Z]\w*)?\s*=', line)
        if match:
            action = match.group(1)
            subject = match.group(2) if match.group(2) else ''
            
            # Formulate a natural comment
            if action == 'get' and 'All' in subject:
                comment = f"// Fetch all {subject.replace('All', '').lower()} records"
            elif action == 'get':
                comment = f"// Fetch a specific {subject.lower()} by ID"
            elif action == 'create':
                comment = f"// Create a new {subject.lower()} record"
            elif action == 'update':
                comment = f"// Update an existing {subject.lower()} record"
            elif action == 'delete':
                comment = f"// Delete a {subject.lower()} record"
            elif action == 'search':
                comment = f"// Search {subject.lower()} records"
            elif action == 'login':
                comment = f"// Authenticate user login"
            elif action == 'register':
                comment = f"// Register a new user"
            else:
                comment = f"// Execute API call for {action}{subject}"
                
            new_lines.append('')
            new_lines.append(comment)
            new_lines.append(line)
        else:
            new_lines.append(line)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write('\n'.join(new_lines).strip() + '\n')

for file in os.listdir(services_dir):
    if file.endswith('.js'):
        add_comments_to_service(os.path.join(services_dir, file))

print("Comments added to service functions.")
