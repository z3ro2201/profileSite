import React, { useRef, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { Editor as TinyMCEEditor } from 'tinymce';

const TinyMceEditor = () => {
	const editorRef = useRef<TinyMCEEditor | null>(null);
    const [editorText, setEditorText] = useState('');

  	const tinymcePlugins = ['link', 'lists', 'autoresize'];
  	const tinymceToolbar =
    	'blocks fontfamily |' +
    	'bold italic underline strikethrough forecolor backcolor |' +
    	'alignleft aligncenter alignright alignjustify |' +
    	'bullist numlist blockquote link';

    const realtimeTextEdit = (e:any) => {
        setEditorText(e);
        console.log(editorText)
    }

	return (
    	<Editor
        onInit={(e, editor) => (editorRef.current = editor)}
        id ="tinyEditor"
        apiKey=""
        onEditorChange={e=>realtimeTextEdit(e)}
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