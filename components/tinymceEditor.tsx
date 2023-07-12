import React, { useRef, useEffect, useState, ChangeEvent } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { Editor as TinyMCEEditor } from 'tinymce';
const TINYMCE_API = process.env.NEXT_PUBLIC_TINYMCE_APIKEY

interface TinyMCEEditorProps {
  editorText: string;
  onEditorTextChange: (text: string) => void
}

const TinyMceEditor: React.FC<TinyMCEEditorProps> = ({ editorText, onEditorTextChange }) => {
	const editorRef = useRef<TinyMCEEditor | null>(null);
  const [ length, setLength ] = useState(0);

  	const tinymcePlugins = ['link', 'lists', 'autoresize'];
  	const tinymceToolbar =
    	'blocks fontfamily |' +
    	'bold italic underline strikethrough forecolor backcolor |' +
    	'alignleft aligncenter alignright alignjustify |' +
    	'bullist numlist blockquote link';

      useEffect(() => {
        if (editorRef.current && editorRef.current.getContent() !== editorText) {
          editorRef.current.setContent(editorText);
          console.log('eee')
        }
      }, [editorText]);
    
      const realtimeTextEdit = (text:string, editor:TinyMCEEditor) => {
        const editText = text;
        console.log(editor)
        onEditorTextChange(text);
      };
    
	return (
    	<Editor
      onInit={(evt, editor) => (editorRef.current = editor)}
      id="tinyEditor"
      apiKey={TINYMCE_API}
      onEditorChange={(text, editor) => realtimeTextEdit(text)}
        init={{
          plugins: tinymcePlugins,
          toolbar: tinymceToolbar,
          min_height: 500,
          menubar: false,
          branding: false,
          statusbar: false,
          block_formats: '제목1=h2;제목2=h3;제목3=h4;본문=p;'
        }}
      />
    );
};
export default TinyMceEditor;