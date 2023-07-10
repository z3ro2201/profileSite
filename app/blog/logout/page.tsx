'use client'
import React, {useState, useRef, useEffect} from "react";
import Link from 'next/link';
import Router from "next/router";
import axios from 'axios';
import {sign, verify} from '@/controllers/sign';


export default function logout() {
    const [isAuth, setIsAuth] = useState(false);
    useEffect(() => {
        if(localStorage.getItem('key')) {
            setIsAuth(!isAuth);
        } else {
            setIsAuth(false)
        }
    }, [])

    useEffect(() => {
        if(isAuth) {
            if(alert('로그아웃 되었습니다') === undefined) location.href = '/blog';
        } else {
            if(alert('로그인이 필요합니다.') === undefined) location.href = '/blog/login';
        }
    },[]);

    return null;
}