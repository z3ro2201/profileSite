import React, { ReactNode } from 'react';
import dotenv from 'dotenv';
import { useRouter } from 'next/router';
import jwt,{Secret} from 'jsonwebtoken';
dotenv.config({
    path: '@/.env.local'
});

const secretKey: Secret = process.env.SECRET_KEY || 'default_secret_key';

const PageWrapper = ({ children }: { children: ReactNode}) => {
    const router = useRouter();
    const token = localStorage.getItem('jwtToken');

    if(!token) {
        router.push('/blog/login');
        return null;
    }

    try {
        const decoded = jwt.verify(token, secretKey);
        
        return <div>children</div>;
    } catch (error) {
        router.push('/blog/login');
        return null;
    }
}

export default PageWrapper;