'use client'
import React, {useState, useRef, useEffect} from "react";
import Link from 'next/link';
import Router from "next/router";
import axios from 'axios';
import {sign, verify} from '@/controllers/sign';


export default function Blog() {
    const [txtLoginId, setTxtLoginId] = useState("");
    const [txtLoginPw, setTxtLoginPw] = useState("");
    const loginId = useRef<HTMLInputElement>(null);
    const loginPw = useRef<HTMLInputElement>(null);
    const date = new Date();
    const iat:number = date.getTime();

    const onIdHandler = (e:any) => {
        setTxtLoginId(e.currentTarget.value)
    }

    const onPwHandler = (e:any) => {
        setTxtLoginPw(e.currentTarget.value)
    }

    const login = async () => {
        try {
            const response = await axios.post('/api/blog/oauth/authenticate', {
                    email: txtLoginId,
                    passwds: txtLoginPw
            })
            const res = response.data;
            
            if(res.status !== 200) {
                return alert(res.data.messages);
            }

            const data = res.data;
            const payload = {
                email: data.email,
                username: data.username,
                iss: 'http://localhost:3000/',
                iat: iat
            };
                
            const token = sign(payload);
            const verifyToken = verify(token);
            localStorage.setItem('key', token);
            alert(`${data.username}님 안녕하세요!`);

            const setTime = setTimeout(() => {
                location.href = '/blog';
            }, 2500);

            return () => {
                clearTimeout(setTime);
            }
        } catch (error) {
            console.error(error)
        }
    }
    
    const [isAuth, setIsAuth] = useState(false);
    useEffect(() => {
        if(localStorage.getItem('key')) {
            setIsAuth(!isAuth);
        } else {
            setIsAuth(false)
        }
    }, [])

    useEffect(() => {
        if(isAuth && alert('이미 로그인 중 입니다.') === undefined)
            location.href = '/blog';
    },[]);


    return(
        <section className="text-gray-600 body-font bg-white">
            <div className="container px-5 py-24 mx-auto flex flex-wrap items-center">
                <div className="lg:w-3/5 md:w-1/2 md:pr-16 lg:pr-0 pr-0">
                    <h1 className="min-w-[600px] title-font font-medium text-3xl text-gray-900">
                        2er0.io 
                    </h1>
                    <p className="min-w-[600px] leading-relaxed mt-4">
                        로그인을 안하셨네요!
                    </p>
                </div>
                <div className="lg:w-2/6 md:w-1/2 bg-gray-100 rounded-lg p-8 flex flex-col md:ml-auto w-full mt-10 md:mt-0">
                    <h2 className="text-gray-900 text-lg font-medium title-font mb-5">로그인</h2>
                    <div className="relative mb-4">
                        <label htmlFor="userName" className="leading-7 text-sm text-gray-600">사용자명</label>
                        <input type="text" id="userName" name="userName" className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out" onChange={onIdHandler} ref={loginId}/>
                    </div>
                    <div className="relative mb-4">
                        <label htmlFor="passwds" className="leading-7 text-sm text-gray-600">비밀번호</label>
                        <input type="password" id="passwds" name="passwds" className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out" onChange={onPwHandler} ref={loginPw}/>
                    </div>
                    <button className="text-white bg-indigo-500 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg" onClick={login}>로그인</button>
                    <p className="text-xs text-gray-500 mt-3">Literally you probably haven't heard of them jean shorts.</p>
                </div>
            </div>
        </section>
    )
}