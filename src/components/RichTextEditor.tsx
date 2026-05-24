import { useRef, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

const TOOLBAR_BUTTONS = [
    { label: 'B', command: 'bold', title: 'Pogrubienie' },
    { label: 'I', command: 'italic', title: 'Kursywa', style: { fontStyle: 'italic' } },
    { label: 'U', command: 'underline', title: 'Podkreślenie', style: { textDecoration: 'underline' } },
];

const dividerStyle: React.CSSProperties = {
    width: '1px', height: '20px',
    background: 'var(--border-color)',
    margin: '0 4px',
};

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const savedRangeRef = useRef<Range | null>(null);

    // Modal state
    const [activeModal, setActiveModal] = useState<'image' | null>(null);
    const [uploading, setUploading] = useState(false);
    const [imageUrl, setImageUrl] = useState('');

    // Initialize editor content only once on mount, or when value changes externally
    // (not from user typing, to avoid cursor jump)
    useEffect(() => {
        const el = editorRef.current;
        if (!el) return;
        // Only update DOM if value actually differs from current DOM content
        // This prevents resetting cursor position on every keystroke
        if (el.innerHTML !== value) {
            el.innerHTML = value;
        }
    }, [value]);

    const saveSelection = () => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            savedRangeRef.current = selection.getRangeAt(0);
        }
    };

    const restoreSelection = () => {
        const range = savedRangeRef.current;
        if (range) {
            const selection = window.getSelection();
            if (selection) {
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }
    };

    const execCmd = (command: string) => {
        document.execCommand(command, false, undefined);
        editorRef.current?.focus();
        handleInput();
    };

    const insertHTML = (html: string) => {
        editorRef.current?.focus();
        restoreSelection();
        document.execCommand('insertHTML', false, html);
        handleInput();
    };

    const insertLink = () => {
        saveSelection();
        const url = prompt('Podaj pełny URL linku (np. https://...):');
        if (url && url.trim() !== '') {
            restoreSelection();
            
            // Format URL (jeśli nie ma http/https to dodaj)
            const finalUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`;
            
            document.execCommand('createLink', false, finalUrl);
            editorRef.current?.focus();
            handleInput();
        }
    };

    const insertHeading = (level: number) => {
        document.execCommand('formatBlock', false, `h${level}`);
        editorRef.current?.focus();
        handleInput();
    };

    // Image URL handler
    const handleInsertImageUrl = () => {
        if (!imageUrl || imageUrl.trim() === '') {
            setActiveModal(null);
            return;
        }

        const url = imageUrl.trim();
        setImageUrl('');
        setActiveModal(null);

        const imgHtml = `<img src="${url}" alt="Zdjęcie w newsie" style="max-width: 100%; border-radius: 8px; margin: 1.5rem 0; display: block;" /><p></p>`;
        insertHTML(imgHtml);
    };

    // Image upload handler
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert('Plik jest za duży (maksymalnie 5MB).');
            return;
        }

        setUploading(true);
        setActiveModal(null);

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `news-inline/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('uploads')
                .upload(fileName, file, { upsert: false });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(fileName);

            const imgHtml = `<img src="${publicUrl}" alt="Zdjęcie w newsie" style="max-width: 100%; border-radius: 8px; margin: 1.5rem 0; display: block;" /><p></p>`;
            insertHTML(imgHtml);
        } catch (err: any) {
            console.error(err);
            alert(`Błąd wczytywania zdjęcia: ${err.message || 'Nieznany błąd'}`);
        } finally {
            setUploading(false);
        }
    };

    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    return (
        <div style={{
            position: 'relative',
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            overflow: 'hidden',
        }}>
            {/* Toolbar */}
            <div style={{
                display: 'flex',
                gap: '4px',
                padding: '8px 12px',
                borderBottom: '1px solid var(--border-color)',
                background: 'var(--bg-secondary)',
                flexWrap: 'wrap',
                alignItems: 'center',
            }}>
                {TOOLBAR_BUTTONS.map(btn => (
                    <button
                        key={btn.command}
                        type="button"
                        title={btn.title}
                        onMouseDown={(e) => { e.preventDefault(); execCmd(btn.command); }}
                        className="editor-toolbar-btn"
                        style={btn.style}
                    >
                        {btn.label}
                    </button>
                ))}
                <div style={dividerStyle} />
                <button type="button" title="Nagłówek H2"
                    onMouseDown={(e) => { e.preventDefault(); insertHeading(2); }}
                    className="editor-toolbar-btn">H2</button>
                <button type="button" title="Nagłówek H3"
                    onMouseDown={(e) => { e.preventDefault(); insertHeading(3); }}
                    className="editor-toolbar-btn">H3</button>
                <div style={dividerStyle} />
                <button type="button" title="Lista punktowana"
                    onMouseDown={(e) => { e.preventDefault(); execCmd('insertUnorderedList'); }}
                    className="editor-toolbar-btn">• Lista</button>
                <button type="button" title="Dodaj link"
                    onMouseDown={(e) => { e.preventDefault(); insertLink(); }}
                    className="editor-toolbar-btn">🔗 Link</button>
                <button type="button" title="Usun link"
                    onMouseDown={(e) => { e.preventDefault(); execCmd('unlink'); }}
                    className="editor-toolbar-btn"
                    style={{ opacity: 0.8, fontSize: '0.75rem' }}>🔗✖ Usuń</button>
                <div style={dividerStyle} />
                <button type="button" title="Wstaw zdjęcie (z komputera lub link)"
                    onMouseDown={(e) => { e.preventDefault(); saveSelection(); setActiveModal('image'); }}
                    className="editor-toolbar-btn">📷 Zdjęcie</button>
            </div>

            {/* Editable area — NO dangerouslySetInnerHTML to prevent cursor reset */}
            <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={handleInput}
                data-placeholder={placeholder || 'Zacznij pisać tutaj...'}
                style={{
                    minHeight: '250px',
                    padding: '1rem',
                    color: 'var(--text-primary)',
                    fontSize: '1rem',
                    lineHeight: 1.7,
                    outline: 'none',
                    fontFamily: 'inherit',
                }}
            />

            {/* Hidden inputs & modals */}
            <input 
                type="file" 
                ref={fileInputRef} 
                accept="image/*" 
                onChange={handleImageUpload} 
                style={{ display: 'none' }} 
            />

            {activeModal === 'image' && (
                <div className="editor-modal">
                    <h3>Wstaw zdjęcie</h3>
                    <button 
                        type="button" 
                        onClick={() => { fileInputRef.current?.click(); }}
                        className="editor-upload-btn"
                    >
                        📁 Wybierz plik z komputera
                    </button>
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem', margin: '4px 0' }}>lub wklej link do zdjęcia:</div>
                    <input 
                        type="text" 
                        placeholder="https://domena.pl/zdjecie.jpg" 
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                    />
                    <div className="editor-modal-actions">
                        <button type="button" onClick={handleInsertImageUrl}>Wstaw</button>
                        <button type="button" onClick={() => { setActiveModal(null); setImageUrl(''); }}>Anuluj</button>
                    </div>
                </div>
            )}

            {uploading && (
                <div className="editor-modal" style={{ textAlign: 'center' }}>
                    <h3>Wgrywanie zdjęcia...</h3>
                    <div className="editor-loader" />
                </div>
            )}

            <style dangerouslySetInnerHTML={{ __html: `
                .editor-toolbar-btn {
                    padding: 4px 10px;
                    background: var(--bg-primary);
                    border: 1px solid var(--border-color);
                    border-radius: 4px;
                    color: var(--text-primary);
                    cursor: pointer;
                    font-size: 0.85rem;
                    font-weight: 700;
                    transition: all 0.15s;
                }
                .editor-toolbar-btn:hover {
                    background: var(--bg-secondary);
                    border-color: var(--text-secondary);
                }
                [contenteditable]:empty:before {
                    content: attr(data-placeholder);
                    color: var(--text-secondary);
                    opacity: 0.5;
                    pointer-events: none;
                    display: block;
                }
                [contenteditable] a { color: #60a5fa; text-decoration: underline; }
                [contenteditable] h2 { font-size: 1.4rem; font-weight: 700; margin: 1rem 0 0.5rem; }
                [contenteditable] h3 { font-size: 1.1rem; font-weight: 700; margin: 0.8rem 0 0.4rem; }
                [contenteditable] ul { padding-left: 1.5rem; margin: 0.5rem 0; }
                [contenteditable] li { margin: 0.2rem 0; }
                [contenteditable] img {
                    max-width: 100%;
                    border-radius: 8px;
                    margin: 1.5rem 0;
                    display: block;
                }
                .editor-modal {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    padding: 1.5rem;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.3);
                    z-index: 100;
                    width: 90%;
                    max-width: 400px;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                .editor-modal h3 {
                    margin: 0;
                    font-size: 1.1rem;
                    color: var(--text-primary);
                }
                .editor-modal p {
                    margin: 0;
                    font-size: 0.9rem;
                    color: var(--text-secondary);
                }
                .editor-modal input[type="text"] {
                    width: 100%;
                    padding: 8px 12px;
                    background: var(--bg-primary);
                    border: 1px solid var(--border-color);
                    border-radius: 6px;
                    color: var(--text-primary);
                    outline: none;
                }
                .editor-modal input[type="text"]:focus {
                    border-color: var(--text-primary);
                }
                .editor-modal-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 8px;
                }
                .editor-modal-actions button {
                    padding: 6px 12px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 0.85rem;
                }
                .editor-modal-actions button:first-child {
                    background: var(--text-primary);
                    color: var(--bg-primary);
                    border: none;
                }
                .editor-modal-actions button:last-child {
                    background: transparent;
                    border: 1px solid var(--border-color);
                    color: var(--text-primary);
                }
                .editor-upload-btn {
                    padding: 10px;
                    background: var(--bg-primary);
                    border: 1px dashed var(--border-color);
                    border-radius: 8px;
                    color: var(--text-primary);
                    cursor: pointer;
                    font-weight: 600;
                    text-align: center;
                    transition: all 0.2s;
                }
                .editor-upload-btn:hover {
                    background: var(--border-color);
                    border-style: solid;
                }
                .editor-loader {
                    border: 3px solid var(--border-color);
                    border-top: 3px solid var(--text-primary);
                    border-radius: 50%;
                    width: 30px;
                    height: 30px;
                    animation: spin 1s linear infinite;
                    margin: 0 auto;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}} />
        </div>
    );
}
