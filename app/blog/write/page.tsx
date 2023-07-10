'use client'
import React, {useState, useRef, useEffect} from "react";
import Link from 'next/link';
import Router from "next/router";
import axios from 'axios';
import {sign, verify} from '@/controllers/sign';
import Gnb from '../gnb'


export default function logout() {

    return(
        <div className="w-full h-full bg-zinc-900">
            <Gnb/>
            <div className="flex p-4 w-full h-12">
                <a href="">test</a>
            </div>
        </div>
    )
}