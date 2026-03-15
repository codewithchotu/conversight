import plistlib
import os

file_path = 'customer_behavior.csv'
temp_path = 'customer_behavior_clean.csv'

def extract_csv():
    if not os.path.exists(file_path):
        print(f"Error: {file_path} does not exist.")
        return

    with open(file_path, 'rb') as f:
        content = f.read()

    # Check if it's a bplist
    if content.startswith(b'bplist'):
        try:
            pl = plistlib.loads(content)
            # Typically in a webarchive/whatsapp bplist, the data is in WebMainResource -> WebResourceData
            if 'WebMainResource' in pl:
                resource_data = pl['WebMainResource'].get('WebResourceData')
                if resource_data:
                    data_bytes = resource_data
                else:
                    print("Error: WebResourceData not found in plist.")
                    return
            else:
                print("Error: WebMainResource not found in plist.")
                return
        except Exception as e:
            print(f"plistlib failed: {e}. Trying fallback binary extraction...")
            # Fallback: Find <pre> tag in binary
            data_bytes = content

        # Process the bytes (either from plist or raw fallback)
        try:
            full_text: str = data_bytes.decode('utf-8', errors='ignore')
            if '<pre' in full_text:
                start_tag_idx = full_text.find('<pre')
                # Find the end of the opening tag (e.g., <pre style="...">)
                tag_end_idx = full_text.find('>', start_tag_idx)
                if tag_end_idx != -1:
                    content_start_pos = tag_end_idx + 1
                    end_tag_idx = full_text.rfind('</pre>')
                    
                    if end_tag_idx != -1 and end_tag_idx > content_start_pos:
                        extracted_csv_text = full_text[content_start_pos:end_tag_idx]
                    else:
                        extracted_csv_text = full_text[content_start_pos:]
                else:
                    extracted_csv_text = full_text
            else:
                extracted_csv_text = full_text

            with open(temp_path, 'w', encoding='utf-8') as f_out:
                f_out.write(extracted_csv_text.strip())
            
            # Check if we actually got something useful
            if os.path.getsize(temp_path) > 100:
                os.replace(temp_path, file_path)
                print(f"Successfully fixed {file_path} using {'plist' if 'pl' in locals() else 'fallback'} method.")
            else:
                print("Error: Extracted data is too small or empty. Staying with original.")
        except Exception as e:
            print(f"Final extraction failed: {e}")
    else:
        print(f"{file_path} is not a bplist file. No extraction needed.")

if __name__ == "__main__":
    extract_csv()
