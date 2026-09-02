import os
import re

components_dir = "components"
dirs_to_scan = ["app", "components"]

# Create a map of component names to their relative paths within `components/`
comp_map = {}
for root, dirs, files in os.walk(components_dir):
    for file in files:
        if file.endswith((".tsx", ".ts", ".jsx", ".js")):
            filepath = os.path.join(root, file)
            # Remove "components/" from start and extension from end
            rel_path = os.path.relpath(filepath, components_dir)
            name_without_ext = os.path.splitext(rel_path)[0]
            basename = os.path.basename(name_without_ext)
            
            # Save it. If multiple with same basename exist, we might have a conflict, but usually they are unique.
            comp_map[basename] = name_without_ext

import_pattern = re.compile(r"(import\s+.*?from\s+['\"])@/components/([^/]+)(['\"])")

for d in dirs_to_scan:
    for root, dirs, files in os.walk(d):
        for file in files:
            if file.endswith((".ts", ".tsx", ".js", ".jsx")):
                filepath = os.path.join(root, file)
                with open(filepath, "r", encoding="utf-8") as f:
                    content = f.read()
                
                # We need a function to replace only if the base component doesn't exist directly in components/
                def replacer(match):
                    prefix = match.group(1)
                    comp_name = match.group(2)
                    suffix = match.group(3)
                    
                    # If it actually exists directly, leave it
                    if os.path.exists(os.path.join(components_dir, comp_name + ".tsx")) or \
                       os.path.exists(os.path.join(components_dir, comp_name + ".ts")):
                        return match.group(0)
                    
                    # If it's in our map (nested), replace it
                    if comp_name in comp_map:
                        new_path = comp_map[comp_name]
                        # Ensure we don't accidentally replace it with backslashes on windows
                        new_path = new_path.replace("\\", "/")
                        return f"{prefix}@/components/{new_path}{suffix}"
                    
                    # Fallback to original
                    return match.group(0)

                new_content = import_pattern.sub(replacer, content)
                
                if new_content != content:
                    print(f"Fixed imports in {filepath}")
                    with open(filepath, "w", encoding="utf-8") as f:
                        f.write(new_content)
