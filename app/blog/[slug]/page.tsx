'use client'
import React, {useEffect , useState} from "react";
import axios from 'axios';
import Gnb from '../gnb'
import changeDate from '@/utils/changeDt';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface BlogPostList {
    id: number;
    post_title: string;
    post_content: string;
    post_created_time: string;
    post_modified_time: string;
    post_writer_id: number;
    post_writer_name: string;
    post_attachment: number;
}

const Page = ({params, searchParams} : { params: {slug: string}, searchParams: { [key: string]:string | string[] | undefined }}) => {
    const [postList, setPostList] = useState<BlogPostList[]>([]);
    const router = useRouter();
    useEffect(() => {
        (async () => {
            try {
                const response = await axios.post('/api/blog/post/view', {
                    id: params.slug
                });
                const res = response.data;
                setPostList(res.data)
                console.log(res)
            } catch (e) {
                console.error(e);
            }
        })();
    }, [params.slug]);

    return(
        <div className="w-full h-full bg-zinc-900 box-border">
            <Gnb/>
            <div className="flex p-4 w-full h-12">
                <a href="">test</a>
            </div>
            <div className="w-full box-sizing p-2">
                {
                    postList  ? postList.map((item, key) => (
                            <div className="flex w-full my-2 justify-center items-center" key={key}>
                                <div className="w-full lg:w-11/12 xl:w-1/2 lg:px-0">
                                    <h1>{item.post_title}</h1>
                                        <div className="w-full px-2 py-1 sm:p-0 sm:py-0 mx-1 my-1 text-slate-50 text-sm">
                                            {(item.post_modified_time === null)?changeDate(item.post_created_time):changeDate(item.post_modified_time)}
                                            &nbsp;·&nbsp;
                                            {item.post_writer_name}
                                        </div>
                                        <div className="w-full p-2 sm:p-0 mx-1 my-1 sm:w-3/5 sm:py-0 h-12 max-h-12 overflow-hidden text-ellipsis whitespace-nowrap" dangerouslySetInnerHTML={{__html: item.post_content}}></div>
                                        <div className="w-full px-2 sm:p-0 mx-1 my-1 text-sm">
                                            <span className="inline-block px-3 py-1 m-2 rounded-full bg-gray-500 text-slate-300">#테스트</span>
                                        </div>
                                </div>
                            </div>
                        )
                    
                    ) : 
                        <div className="w-full flex justify-center my-2">
                            <div className="w-11/12 text-center">
                            등록된 글이 없습니다.
                            </div>
                        </div>
                    
                }
            </div>
        </div>
    )
}

export default Page;