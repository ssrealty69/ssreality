import sys

file_path = 'src/components/qa/QAContentEditor.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Rename interfaces and props
content = content.replace('BlogContentEditorProps', 'QAContentEditorProps')
content = content.replace('BlogContentEditor(', 'QAContentEditor(')
content = content.replace('export function QAContentEditor({ value, onChange, placeholder = \'Write your blog post here...\' }: QAContentEditorProps) {', 'export function QAContentEditor({ value, onChange, placeholder = \'Write your answer here...\', isAdmin = false }: QAContentEditorProps) {')
content = content.replace('interface QAContentEditorProps {\n  value: string;\n  onChange: (value: string) => void;\n  placeholder?: string;\n}', 'interface QAContentEditorProps {\n  value: string;\n  onChange: (value: string) => void;\n  placeholder?: string;\n  isAdmin?: boolean;\n}')

# 2. Add lucide react icon 'MousePointerClick' for the button insertion
content = content.replace('Minus, Check', 'Minus, Check, MousePointerClick')

# 3. Add Custom Button Insertion logic before return (
custom_btn_logic = '''
  const handleInsertButton = () => {
    if (showHtml) return;
    const btnText = prompt('Enter text for the button (e.g. View 3BHK Flats):');
    if (!btnText) return;
    const btnUrl = prompt('Enter URL for the button (e.g. /properties/123):');
    if (!btnUrl) return;

    const btnHtml = `<div class="my-6 text-center"><a href="${btnUrl}" target="_blank" class="inline-block px-6 py-3 bg-[#C9A227] text-white font-bold rounded-lg shadow-md hover:bg-[#B8860B] transition-colors">${btnText}</a></div><p><br></p>`;
    document.execCommand('insertHTML', false, btnHtml);
    triggerChange();
  };
'''
content = content.replace('  return (\n    <div className="w-full border', custom_btn_logic + '\n  return (\n    <div className="w-full border')

# 4. Hide advanced toolbar items if not isAdmin
content = content.replace('{/* WordPress-style Paragraph & Headings Dropdown */}', '{isAdmin && (\n        <>\n        {/* WordPress-style Paragraph & Headings Dropdown */}')
content = content.replace('{/* Text Formats */}', '</>\n      )}\n      {/* Text Formats */}')

# 5. Hide colors and fonts if not admin
content = content.replace('{/* Color Palette (Dropdown list trigger) */}', '{isAdmin && (\n        <>\n        {/* Color Palette (Dropdown list trigger) */}')
content = content.replace('{/* Alignment */}', '</>\n      )}\n      {/* Alignment */}')

# 6. Hide alignment if not admin
content = content.replace('{/* Alignment */}', '{isAdmin && (\n        <>\n        {/* Alignment */}')
content = content.replace('{/* Lists & Pointers Consolidated Dropdown */}', '</>\n      )}\n      {/* Lists & Pointers Consolidated Dropdown */}')

# 7. Hide image and line, add Button inserter for admin
content = content.replace('<button \n          type="button" \n          onMouseDown={(e) => e.preventDefault()}\n          onClick={handleImageUploadClick}', '{isAdmin && (\n        <>\n        <button \n          type="button" \n          onMouseDown={(e) => e.preventDefault()}\n          onClick={handleImageUploadClick}')

content = content.replace('<button \n          type="button" \n          onMouseDown={(e) => e.preventDefault()}\n          onClick={handleQuoteToggle}', '</>\n      )}\n      {isAdmin && (\n        <button \n          type="button" \n          onMouseDown={(e) => e.preventDefault()}\n          onClick={handleInsertButton}\n          className="p-1.5 hover:bg-gray-200 rounded transition-colors text-gray-700 font-bold flex-shrink-0 flex items-center gap-1 text-xs"\n          title="Insert CTA Button"\n        >\n          <MousePointerClick size={16} />\n          Button\n        </button>\n      )}\n      <button \n          type="button" \n          onMouseDown={(e) => e.preventDefault()}\n          onClick={handleQuoteToggle}')

content = content.replace('{/* Visual / HTML Toggle */}', '{isAdmin && (\n        <>\n        {/* Visual / HTML Toggle */}')
content = content.replace('</button>\n\n      </div>', '</button>\n        </>\n      )}\n      </div>')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
