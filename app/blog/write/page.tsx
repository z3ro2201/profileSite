'use client'
import React, {useState, useRef, useEffect} from "react";
import Gnb from '../gnb'
import TinyMceEditor from '@/components/tinymceEditor';

export default function Write() {
    
    return (
        <div className="w-full h-full bg-zinc-900">
            <Gnb/>
            <h1>글 작성하기</h1>
            <div className="flex p-4 w-full h-auto">
                <TinyMceEditor />
            </div>
        </div>
    );
}