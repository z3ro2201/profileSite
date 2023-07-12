'use client'
import React, {useEffect , useState} from "react";
import axios from 'axios';
import Gnb from './gnb'

interface BlogPostList {
    id: number;
    post_title: string;
    post_content: string;
    post_created_time: string;
    post_writer_id: number;
    post_writer_name: string;
    post_attachment: number;
}

const Blog = () => {
    const [postList, setPostList] = useState<BlogPostList[]>([]);

    useEffect(() => {
        (async () => {
            try {
                const response = await axios.get('/api/blog/post/list');
                const res = response.data;
                setPostList(res.data)
            } catch (e) {
                console.error(e);
            }
            console.log(postList);
        })();
    }, []);

    return(
        <div className="w-full h-full bg-zinc-900 box-border">
            <Gnb/>
            <div className="flex p-4 w-full h-12">
                <a href="">test</a>
            </div>
            <div className="w-full box-sizing p-2">
                {
                    postList.map((item, key) => (
                        <div className="w-full my-2" key={key}>
                            <div className="w-full p-2 my-2 bg-slate-100 text-black">{item.post_title}</div>
                            <div className="w-full p-2 my-2" dangerouslySetInnerHTML={{__html: item.post_content}}></div>
                            <div className="w-full p-2 my-2 bg-slate-100 text-black">{item.post_writer_name}</div>
                            <div className="w-full p-2 my-2 bg-slate-100 text-black">{item.post_created_time}</div>
                        </div>
                    )
                    
                    )
                    
                }
            </div>
        </div>
    )
}

export default Blog;