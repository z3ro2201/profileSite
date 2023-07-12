'use client'
import React, {useState, useRef, useEffect} from "react";
import Gnb from '../gnb'
import axios from 'axios';
import TinyMceEditor from '@/components/tinymceEditor';
import {decodedPayload} from '@/controllers/sign';

interface EditorProps {
    initialSubject: string;
    initialContent: string;
  }

const Write: React.FC<EditorProps> = ({initialSubject, initialContent}) => {
    const [subjectText, setSubjectText] = useState<string>('');
    const [editorText, setEditorText] = useState<string>('');
    const userData = decodedPayload(localStorage.getItem('key'));

    const handleEditorTextChange = (text: string) => {
        setEditorText(text);
    }

    const handleEditorTextSeverSave = async () => {
        console.log(subjectText, editorText)
        
        try {
            const response = await axios.post('/api/blog/post/write', {
                email: userData.email,
                subject: subjectText,
                content: editorText
            })
            const res = response.data;
            
            if(res.status !== 200) {
                return alert(res.data.messages);
            }

            alert("글이 정상적으로 등록되었습니다!");
        } catch (e) {
            alert("오류가 발생했습니다.\n오류내용:" + e);
        }
    }
    
    const handleSubjectTextChange = (e: any) => {
        setSubjectText(e.target.value)
    }

    useEffect(() => setEditorText(editorText ?? ''), [])

    return (
        <div className="w-full h-full bg-zinc-900">
            <Gnb/>
            <h1>글 작성하기</h1>
            <div className="w-full p-2 mb-2">
                <input type="text" id="text" name="text" className="w-full p-2" onChange={handleSubjectTextChange}/>
            </div>
            <div className="flex p-4 w-full h-auto">
                <TinyMceEditor editorText={initialContent} onEditorTextChange={handleEditorTextChange} />
            </div>
            <button onClick={handleEditorTextSeverSave}>저장</button>
        </div>
    );
}

export default Write;