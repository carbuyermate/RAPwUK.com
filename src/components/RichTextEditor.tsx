'use client';

import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import { useMemo } from 'react';

// Use dynamic import to prevent SSR rendering issues with Quill
// Standardowy dynamiczny import dla Next.js 13+
const ReactQuill = dynamic(() => import('react-quill'), { 
    ssr: false,
    loading: () => <div className="p-4 text-center text-sm text-secondary border border-[rgba(255,255,255,0.1)] rounded-lg min-h-[200px] flex items-center justify-center">Ładowanie edytora...</div>
});

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
    const modules = useMemo(() => ({
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link', 'blockquote', 'code-block'],
            ['clean']
        ],
    }), []);

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike',
        'list', 'bullet',
        'link', 'blockquote', 'code-block'
    ];

    return (
        <div className="rich-text-editor-container">
            <ReactQuill
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder || "Zacznij pisać tutaj..."}
            />
            <style jsx global>{`
                .rich-text-editor-container .quill {
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 8px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                .rich-text-editor-container .ql-toolbar {
                    border: none;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    background: rgba(255, 255, 255, 0.05);
                    border-top-left-radius: 8px;
                    border-top-right-radius: 8px;
                }
                .rich-text-editor-container .ql-container {
                    border: none;
                    font-family: inherit;
                    font-size: 1rem;
                    color: var(--text-primary);
                    min-height: 250px;
                }
                .rich-text-editor-container .ql-editor {
                    padding: 1rem;
                }
                .rich-text-editor-container .ql-stroke {
                    stroke: var(--text-primary);
                }
                .rich-text-editor-container .ql-fill {
                    fill: var(--text-primary);
                }
                .rich-text-editor-container .ql-picker {
                    color: var(--text-primary);
                }
                .rich-text-editor-container .ql-editor.ql-blank::before {
                    color: var(--text-secondary);
                    font-style: normal;
                }
            `}</style>
        </div>
    );
}
