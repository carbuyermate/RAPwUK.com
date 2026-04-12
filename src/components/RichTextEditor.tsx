'use client';

import { useRef, useEffect } from 'react';

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

const btnStyle: React.CSSProperties = {
    padding: '4px 10px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '4px',
    color: 'rgba(255,255,255,0.8)',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: 700,
    transition: 'all 0.15s',
};

const dividerStyle: React.CSSProperties = {
    width: '1px', height: '20px',
    background: 'rgba(255,255,255,0.1)',
    margin: '0 4px',
};

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);

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

    const execCmd = (command: string) => {
        document.execCommand(command, false, undefined);
        editorRef.current?.focus();
        handleInput();
    };

    const insertLink = () => {
        // Zapiszmy zaznaczenie zanim wyskoczy alert (czasami przeglądarki gubią focus przy prompt)
        const selection = window.getSelection();
        let range: Range | null = null;
        if (selection && selection.rangeCount > 0) {
            range = selection.getRangeAt(0);
        }

        const url = prompt('Podaj pełny URL linku (np. https://...):');
        if (url && url.trim() !== '') {
            if (range) {
                selection?.removeAllRanges();
                selection?.addRange(range);
            }
            
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

    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    return (
        <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            overflow: 'hidden',
        }}>
            {/* Toolbar */}
            <div style={{
                display: 'flex',
                gap: '4px',
                padding: '8px 12px',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.04)',
                flexWrap: 'wrap',
                alignItems: 'center',
            }}>
                {TOOLBAR_BUTTONS.map(btn => (
                    <button
                        key={btn.command}
                        type="button"
                        title={btn.title}
                        onMouseDown={(e) => { e.preventDefault(); execCmd(btn.command); }}
                        style={{ ...btnStyle, ...(btn.style || {}) }}
                    >
                        {btn.label}
                    </button>
                ))}
                <div style={dividerStyle} />
                <button type="button" title="Nagłówek H2"
                    onMouseDown={(e) => { e.preventDefault(); insertHeading(2); }}
                    style={btnStyle}>H2</button>
                <button type="button" title="Nagłówek H3"
                    onMouseDown={(e) => { e.preventDefault(); insertHeading(3); }}
                    style={btnStyle}>H3</button>
                <div style={dividerStyle} />
                <button type="button" title="Lista punktowana"
                    onMouseDown={(e) => { e.preventDefault(); execCmd('insertUnorderedList'); }}
                    style={btnStyle}>• Lista</button>
                <button type="button" title="Dodaj link"
                    onMouseDown={(e) => { e.preventDefault(); insertLink(); }}
                    style={btnStyle}>🔗 Link</button>
                <button type="button" title="Usun link"
                    onMouseDown={(e) => { e.preventDefault(); execCmd('unlink'); }}
                    style={{...btnStyle, opacity: 0.8, fontSize: '0.75rem'}}>🔗✖ Usuń</button>
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
                    color: 'rgba(255,255,255,0.9)',
                    fontSize: '1rem',
                    lineHeight: 1.7,
                    outline: 'none',
                    fontFamily: 'inherit',
                }}
            />

            <style dangerouslySetInnerHTML={{ __html: `
                [contenteditable]:empty:before {
                    content: attr(data-placeholder);
                    color: rgba(255,255,255,0.25);
                    pointer-events: none;
                    display: block;
                }
                [contenteditable] a { color: #60a5fa; text-decoration: underline; }
                [contenteditable] h2 { font-size: 1.4rem; font-weight: 700; margin: 1rem 0 0.5rem; }
                [contenteditable] h3 { font-size: 1.1rem; font-weight: 700; margin: 0.8rem 0 0.4rem; }
                [contenteditable] ul { padding-left: 1.5rem; margin: 0.5rem 0; }
                [contenteditable] li { margin: 0.2rem 0; }
            `}} />
        </div>
    );
}
