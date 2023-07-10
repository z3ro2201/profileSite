import crypto from "crypto";

require('dotenv').config({
    path: '.env.local'
});

const secretKeys: string = process.env.NEXT_PUBLIC_JWT_KEY || '';

function base64UrlFromBase64(str: string) {
    return str.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

export function sign(payload: any){
    const header = {
        alg: 'HS256',
        typ: 'JWT'
    }
    const encodedHeader = base64UrlFromBase64(Buffer.from(JSON.stringify(header)).toString('base64'));
    const encodedPayload = base64UrlFromBase64(
        Buffer.from(JSON.stringify(payload)).toString('base64')
    );

    const signature = base64UrlFromBase64(
        crypto
            .createHmac('sha256', secretKeys) // secretKeys 변수 사용
            .update(encodedHeader+'.'+encodedPayload)
            .digest('base64')
            .replace('=', '')
    );
    return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export function verify(token: any) {
    // 토큰을 분리해서 각각 배열에 넣어줌
    const [header, payload, sign] = token.split('.');

    // 헤더와 페이로드를 디코딩함
    const decodedHeader = JSON.parse(Buffer.from(header, 'base64').toString('utf-8'));
    const decodedPayload = JSON.parse(Buffer.from(payload, 'base64').toString('utf-8'));

    // 디코딩한 헤더와 페이로드를 다시 엔코딩함
    const reEncodedHeader = base64UrlFromBase64(Buffer.from(JSON.stringify(decodedHeader)).toString('base64'));
    const encodedPayload = base64UrlFromBase64(Buffer.from(JSON.stringify(decodedPayload)).toString('base64'));

    const signature = base64UrlFromBase64(
        crypto
            .createHmac('sha256', secretKeys) // secretKeys 변수 사용
            .update(reEncodedHeader+'.'+encodedPayload)
            .digest('base64')
            .replace('=', '')
    );
    console.log(sign, signature)
    if(sign === signature) return true;
    else return false;
}