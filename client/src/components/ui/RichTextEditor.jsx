import React, { useRef, useEffect } from 'react';

// Simple rich text editor wrapper that's compatible with React 19
const RichTextEditor = ({ value, onChange, placeholder = 'Start writing...' }) => {
    const editorRef = useRef(null);

    // Initialize Quill editor
    useEffect(() => {
        // Dynamically import Quill to avoid SSR issues
        import('quill').then((Quill) => {
            if (editorRef.current && !editorRef.current.quill) {
                const quill = new Quill.default(editorRef.current, {
                    theme: 'snow',
                    placeholder: placeholder,
                    modules: {
                        toolbar: [
                            [{ header: [1, 2, 3, false] }],
                            ['bold', 'italic', 'underline', 'strike'],
                            [{ list: 'ordered' }, { list: 'bullet' }],
                            ['blockquote', 'code-block'],
                            [{ color: [] }, { background: [] }],
                            ['link'],
                            ['clean']
                        ]
                    }
                });

                // Set initial value
                if (value) {
                    quill.clipboard.dangerouslyPasteHTML(value);
                }

                // Listen for changes
                quill.on('text-change', () => {
                    const html = quill.root.innerHTML;
                    if (onChange) {
                        onChange(html);
                    }
                });

                editorRef.current.quill = quill;
            }
        });

        // Cleanup
        return () => {
            if (editorRef.current && editorRef.current.quill) {
                editorRef.current.quill = null;
            }
        };
    }, []);

    // Update content when value changes externally
    useEffect(() => {
        if (editorRef.current && editorRef.current.quill && value !== editorRef.current.quill.root.innerHTML) {
            const quill = editorRef.current.quill;
            const currentSelection = quill.getSelection();
            quill.clipboard.dangerouslyPasteHTML(value || '');
            if (currentSelection) {
                quill.setSelection(currentSelection);
            }
        }
    }, [value]);

    return (
        <div>
            <link href="https://cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet" />
            <div ref={editorRef} style={{ minHeight: '300px', backgroundColor: 'white' }} />
        </div>
    );
};

export default RichTextEditor;
