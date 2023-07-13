import { NextRequest, NextResponse } from "next/server";
import { queryPromise } from "@/utils/mysql";
/*
// 사용예시
queryPromise('SELECT * FROM users')
    .then(rows => {
        console.log(rows);
    })
    .catch(error => {
        console.error(error);
    });

*/

export async function POST(req: NextRequest, res: NextResponse){
    const body = await req.json();
    try {
        const sql = `SELECT * FROM blog_post WHERE id = ${body.id}`;
        const rows:any = await queryPromise(sql);
        if(rows.length === 0) return NextResponse.json({
            status: 404,
            messages: '등록된 글이 없습니다.'
        })
        const data = rows;
        return NextResponse.json({
            status: 200,
            messages: 'success',
            data: data
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({status: 500, messages: 'Internal Server Error'})
    }
}
