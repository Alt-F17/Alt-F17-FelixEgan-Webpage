import os
import csv
import glob
import sys
import json
import hashlib

# Enable ANSI escape sequences on Windows
if os.name == 'nt':
    os.system('')

# ANSI Colors
RESET = '\033[0m'
BOLD = '\033[1m'
CYAN = '\033[96m'
GREEN = '\033[92m'
YELLOW = '\033[93m'
RED = '\033[91m'
DIM = '\033[2m'

STATE_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'deduplication_state.json')

def load_state():
    if os.path.exists(STATE_FILE):
        try:
            with open(STATE_FILE, 'r') as f:
                return json.load(f)
        except:
            return {'resolutions': {}}
    return {'resolutions': {}}

def save_state(state):
    with open(STATE_FILE, 'w') as f:
        json.dump(state, f, indent=4)

def get_row_hash(row):
    # Sort keys to ensure stable hash
    # Cast keys to string because csv.DictReader can produce `None` key for trailing commas
    clean_row = {str(k): v for k, v in row.items() if k != '_source_file'}
    s = json.dumps(clean_row, sort_keys=True)
    return hashlib.md5(s.encode('utf-8')).hexdigest()

if os.name == 'nt':
    import msvcrt
    
    def get_user_choice(options, title):
        selected = 0
        while True:
            os.system('cls')
            print(title + "\n")
            print(f"{CYAN}Use UP/DOWN arrows to highlight, ENTER to select:{RESET}\n")
            for i, opt in enumerate(options):
                if i == selected:
                    print(f"{BOLD}{YELLOW}  ► {opt}{RESET}")
                else:
                    print(f"{DIM}    {opt}{RESET}")
                
            try:
                key = ord(msvcrt.getch())
                if key == 224:
                    key = ord(msvcrt.getch())
                    if key == 72: # Up
                        selected = max(0, selected - 1)
                    elif key == 80: # Down
                        selected = min(len(options) - 1, selected + 1)
                elif key == 13: # Enter
                    return selected
                elif key == 3: # Ctrl+C inside getch!
                    raise KeyboardInterrupt
            except (KeyboardInterrupt, EOFError):
                raise
else:
    def get_user_choice(options, title):
        os.system('clear')
        print(title + "\n")
        print(f"{CYAN}Type a number and press ENTER to select:{RESET}\n")
        for i, opt in enumerate(options):
            print(f" [{i+1}] {opt}")
        while True:
            try:
                choice = int(input(f"\nSelect an option (1-{len(options)}): ")) - 1
                if 0 <= choice < len(options):
                    return choice
            except ValueError:
                pass
            except (KeyboardInterrupt, EOFError):
                raise

def is_duplicate(r1, r2):
    def check(key, val1, val2):
        if not val1 or not val2: return False
        v1, v2 = val1.strip().lower(), val2.strip().lower()
        if v1 in ['n/a', 'none', '-'] or v2 in ['n/a', 'none', '-']: return False
        return v1 == v2
    
    if check('PhoneNumber', r1.get('PhoneNumber', ''), r2.get('PhoneNumber', '')): return True
    if check('Email', r1.get('Email', ''), r2.get('Email', '')): return True
    if check('Address', r1.get('Address', ''), r2.get('Address', '')): return True
    
    if check('FirstName', r1.get('FirstName', ''), r2.get('FirstName', '')):
        ln1 = r1.get('LastName', '').strip().lower()
        ln2 = r2.get('LastName', '').strip().lower()
        if ln1 and ln2 and ln1 == ln2:
            return True

    return False

def generate_comparison_table(lead1, lead2, headers, current_idx, total_dupes):
    lines = []
    lines.append(f"{BOLD}{RED}⚠️  DUPLICATE DETECTED! [{current_idx}/{total_dupes}]{RESET}")
    lines.append(f"{DIM}{'-' * 110}{RESET}")
    
    file1 = lead1.get('_source_file', 'Unknown')
    file2 = lead2.get('_source_file', 'Unknown')
    
    lines.append(f"{BOLD}{'Field':<15} | {'Existing [' + file1 + ']':<44} | {'New [' + file2 + ']':<44}{RESET}")
    lines.append(f"{DIM}{'-' * 110}{RESET}")
    
    for k in headers:
        if k in ['_source_file', '']: continue
        
        v1 = lead1.get(k, '')
        v2 = lead2.get(k, '')
        if isinstance(v1, list): v1 = ", ".join(str(i) for i in v1)
        if isinstance(v2, list): v2 = ", ".join(str(i) for i in v2)
        v1, v2 = str(v1).strip(), str(v2).strip()
        
        if v1.lower() == 'n/a': v1 = ""
        if v2.lower() == 'n/a': v2 = ""
        
        # We want to see EVERYTHING. Even empty ones, unless BOTH are empty.
        if not v1 and not v2: continue
        
        # Default colors
        color1 = GREEN if v1 else DIM
        color2 = GREEN if v2 else DIM
        
        # Same values
        if v1 == v2 and v1:
            color1 = GREEN
            color2 = GREEN
        # Only one has value
        elif (v1 and not v2) or (v2 and not v1):
            color1 = YELLOW if v1 else DIM
            color2 = YELLOW if v2 else DIM
        # Conflicting values
        else:
            color1 = YELLOW
            color2 = YELLOW
        
        import textwrap
        v1_lines = textwrap.wrap(v1, width=44) or [""]
        v2_lines = textwrap.wrap(v2, width=44) or [""]
        max_lines = max(len(v1_lines), len(v2_lines))
        
        for i in range(max_lines):
            disp_k = k if i == 0 else ""
            disp1 = v1_lines[i] if i < len(v1_lines) else ""
            disp2 = v2_lines[i] if i < len(v2_lines) else ""
            lines.append(f"{BOLD}{disp_k:<15}{RESET} | {color1}{disp1:<44}{RESET} | {color2}{disp2:<44}{RESET}")
        
    lines.append(f"{DIM}{'-' * 110}{RESET}")
    return "\n".join(lines)


def process_leads():
    directory = os.path.dirname(os.path.abspath(__file__))
    batch_files = glob.glob(os.path.join(directory, 'leads_batch*.csv'))
    
    if not batch_files:
        print("No 'leads_batch*.csv' files found in the directory.")
        return

    state_data = load_state()
    resolutions = state_data.get('resolutions', {})
    
    all_leads = []
    headers = []
    
    print(f"{CYAN}Loading {len(batch_files)} batch files...{RESET}")
    for file in batch_files:
        filename = os.path.basename(file)
        with open(file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            if not headers:
                headers = list(reader.fieldnames or [])
            else:
                for h in (reader.fieldnames or []):
                    if h not in headers:
                        headers.append(h)
                        
            for row in reader:
                if None in row:
                    del row[None]
                row['_source_file'] = filename
                all_leads.append(row)

    print(f"{CYAN}Total leads loaded: {len(all_leads)}{RESET}")
    
    # Pre-calculate duplicates so we can show [X/Y] 
    print("Pre-calculating duplicates to track progress...")
    duplicate_pairs = []
    sim_unique_leads = []
    for i, current_lead in enumerate(all_leads):
        found_dup = False
        for j, existing_lead in enumerate(sim_unique_leads):
            if is_duplicate(current_lead, existing_lead):
                pair_hash = get_row_hash(current_lead) + "-" + get_row_hash(existing_lead)
                # Only count it as an unresolved duplicate if it's NOT in our state cache
                if pair_hash not in resolutions:
                    duplicate_pairs.append((current_lead, existing_lead))
                found_dup = True
                break
        if not found_dup:
            sim_unique_leads.append(current_lead)
            
    total_dupes = len(duplicate_pairs)
    print(f"Pending unresolved duplicates: {total_dupes}")
    
    if total_dupes == 0:
        print(f"\n{BOLD}{GREEN}No new interactive duplicates found! All records are unique or already processed.{RESET}")
        
    unique_leads = []
    dupes_resolved = 0
    
    for i, current_lead in enumerate(all_leads):
        is_dup_of_existing = False
        
        for j, existing_lead in enumerate(unique_leads):
            if is_duplicate(current_lead, existing_lead):
                pair_hash = get_row_hash(current_lead) + "-" + get_row_hash(existing_lead)
                
                # Check for cached resolution
                if pair_hash in resolutions:
                    res = resolutions[pair_hash]
                    choice = res['choice']
                    if choice == 0: # Keep Existing
                        is_dup_of_existing = True
                        break
                    elif choice == 1: # Replace with New
                        unique_leads[j] = current_lead
                        is_dup_of_existing = True
                        break
                    elif choice == 2: # Keep Both
                        pass # Continues loop, acts as unique
                    elif choice == 3: # UNIFIED
                        unified_data = res['unified_data']
                        unified_lead = {k: v for k, v in unified_data.items()}
                        unique_leads[j] = unified_lead
                        is_dup_of_existing = True
                        break
                        
                    continue # Try next pair if Keep Both

                dupes_resolved += 1
                while True:
                    title = generate_comparison_table(existing_lead, current_lead, headers, dupes_resolved, total_dupes)
                    
                    opt1 = "Keep Existing (Discard New)"
                    opt2 = "Keep New      (Discard Existing)"
                    opt3 = "Keep Both     (Not a duplicate)"
                    opt4 = "UNIFY         (Merge info & choose save destination)"
                    
                    options = [opt1, opt2, opt3, opt4]
                    if len(resolutions) > 0:
                        options.append(f"{YELLOW}UNDO & RESTART (Undo your last saved decision){RESET}")
                    
                    choice = get_user_choice(options, title)
                    
                    if len(resolutions) > 0 and choice == 4:
                        # UNDO logic
                        last_key = list(resolutions.keys())[-1]
                        del resolutions[last_key]
                        state_data['resolutions'] = resolutions
                        save_state(state_data)
                        print(f"\n{BOLD}{YELLOW}Undo successful! Restarting loop to let you decide again...{RESET}")
                        return True # Return a flag to restart main logic
                    
                    if choice == 0:
                        is_dup_of_existing = True
                        resolutions[pair_hash] = {'choice': 0}
                        break
                    elif choice == 1:
                        unique_leads[j] = current_lead
                        is_dup_of_existing = True
                        resolutions[pair_hash] = {'choice': 1}
                        break
                    elif choice == 2:
                        resolutions[pair_hash] = {'choice': 2}
                        break
                    elif choice == 3:
                        # UNIFY
                        unified_lead = {}
                        for col in headers:
                            if col == '_source_file': continue
                            val1 = existing_lead.get(col, "").strip()
                            val2 = current_lead.get(col, "").strip()
                            
                            if val1.lower() in ['', 'n/a', 'none'] and val2.lower() not in ['', 'n/a', 'none']:
                                unified_lead[col] = val2
                            elif val2.lower() in ['', 'n/a', 'none'] and val1.lower() not in ['', 'n/a', 'none']:
                                unified_lead[col] = val1
                            elif val1.lower() == val2.lower():
                                unified_lead[col] = val1
                            else:
                                if col == 'Tags' or ',' in val1 or ',' in val2:
                                    items = set([x.strip() for x in val1.split(',') if x.strip()] + 
                                                [x.strip() for x in val2.split(',') if x.strip()])
                                    unified_lead[col] = ", ".join(sorted(items))
                                else:
                                    unified_lead[col] = f"{val1} / {val2}"
                        
                        file_options = [os.path.basename(f) for f in batch_files] + [f"{RED}<-- RETURN TO DUPLICATE MENU{RESET}"]
                        
                        table_preview = generate_comparison_table(existing_lead, current_lead, headers, dupes_resolved, total_dupes)
                        save_prompt = f"{table_preview}\n{BOLD}{CYAN}Where should the UNIFIED lead be saved?{RESET}"
                        save_choice = get_user_choice(file_options, save_prompt)
                        
                        if save_choice == len(file_options) - 1:
                            continue  # Back
                            
                        unified_lead['_source_file'] = file_options[save_choice]
                        unique_leads[j] = unified_lead
                        is_dup_of_existing = True
                        resolutions[pair_hash] = {
                            'choice': 3,
                            'unified_data': unified_lead
                        }
                        break
                        
                # Immediately save state to disk after resolving
                state_data['resolutions'] = resolutions
                save_state(state_data)
                
                if is_dup_of_existing:
                    break
        
        if not is_dup_of_existing:
            unique_leads.append(current_lead)

    os.system('cls' if os.name == 'nt' else 'clear')
    print(f"\n{BOLD}{GREEN}Saving deduplicated records to new DEDUPE_* files...{RESET}")
    
    grouped_leads = {os.path.basename(f): [] for f in batch_files}
    for lead in unique_leads:
        src = lead.get('_source_file')
        if src in grouped_leads:
            lead_copy = {k: v for k, v in lead.items() if k != '_source_file'}
            grouped_leads[src].append(lead_copy)
            
    for filename, leads in grouped_leads.items():
        dedupe_filename = f"DEDUPE_{filename}"
        filepath = os.path.join(directory, dedupe_filename)
        with open(filepath, 'w', encoding='utf-8', newline='') as f:
            if headers:
                headers_clean = [h for h in headers if h != '_source_file']
                writer = csv.DictWriter(f, fieldnames=headers_clean)
                writer.writeheader()
                writer.writerows(leads)
        
    print(f"{BOLD}{GREEN}\u2714 Finished processing! Kept {len(unique_leads)} unique leads total.{RESET}\n")
    return False

def main():
    while True:
        if not process_leads():
            break

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n{BOLD}{YELLOW}Process gracefully interrupted by user. Saved progress will be loaded next run.{RESET}\n")
        sys.exit(0)
