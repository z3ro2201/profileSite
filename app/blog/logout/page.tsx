'use client'
import React, {useState, useRef, useEffect} from "react";
import Link from 'next/link';
import Router from "next/router";
import axios from 'axios';
import {sign, verify} from '@/controllers/sign';


export default function logout() {
    const [isAuth, setIsAuth] = useState<boolean>();
    useEffect(() => {
        if(localStorage.getItem('key')) {
            localStorage.removeItem('key');
            if(alert('로그아웃 되었습니다') === undefined) location.href = '/blog';
        } else {
            if(alert('로그인이 필요합니다.') === undefined) location.href = '/blog/login';

        }
    }, []);

    return null;
}