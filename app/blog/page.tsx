import React from "react";
import Link from 'next/link';
import Gnb from './gnb'
import Fnb from './fnb'

export default function Blog() {
    function apiTest() {
        fetch('/api/blog')
        .then(res => res.json())
        .then(data => console.log(data));
    }

    return(
        <div className="w-full h-full bg-zinc-900">
            <Gnb/>
            <div className="flex p-4 w-full h-12">
                <a href="">test</a>
            </div>
            <button onClick={apiTest}>testButton</button>
        </div>
    )
}