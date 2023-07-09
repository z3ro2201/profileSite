import { NextRequest, NextResponse } from "next/server";
const db = require('component/mysql');

function queryPromise(sql:String) {
    return new Promise((resolve, reject) => {
        db.query(sql, (error:any, rows:any) => {
            if (error) return reject(error);
            resolve(rows);
        })
    })
}

export async function POST(req: NextRequest, res: NextResponse){
    const body = await req.json();
    console.log(body.username)
    if((body.username === '' || body.username === undefined) && (body.passwds === '' || body.passwds === undefined)) {
        return NextResponse.json({status: 400, messages: '아이디 또는 비밀번호가 입력되지 않았습니다.'});
    }
    const sql = `SELECT * FROM blog_users WHERE username='${body.username}' AND password = password('${body.passwds}')`;
    
    try {
        const rows:any = await queryPromise(sql);
        if(rows.length === 0) return NextResponse.json({
            status: 204,
            messages: '사용자 정보가 없거나 잘못 입력 하셨습니다.'
        })
        return NextResponse.json({
            status: 200,
            messages: 'success'
        });
    } catch (error) {
        return NextResponse.json({status: 500, messages: 'Internal Server Error'})
    }
}
