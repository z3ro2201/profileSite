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
    if(body.email === '' || body.email === undefined) {
        return NextResponse.json({status: 401, messages: '사용자 정보가 없습니다.'});
    }
    if((body.subject === '' || body.subject === undefined) &&
        (body.content === '' || body.content === undefined)) {
        return NextResponse.json({status: 400, messages: '제목 또는 내용이 입력되지 않았습니다.'});
    }
    
    try {
        const userSql = `SELECT id, username FROM blog_users WHERE email = '${body.email}'`;
        const userRows:any = await queryPromise(userSql);
        if(userRows.length === 0) return NextResponse.json({
            status: 401,
            messages: '해당 사용자는 자격이 없거나 잘못된 세션상태 입니다. 다시 로그인이 필요합니다.'
        });
        const userData = userRows[0];

        const sql = `INSERT INTO blog_post (post_title, post_content, post_created_time, post_writer_id, post_writer_name, post_attachment) VALUES ` +
        `('${body.subject}', '${body.content}', NOW(), '${userData.id}', '${userData.username}' , NULL)`;
        const rows:any = await queryPromise(sql);
        if(rows.length === 0) return NextResponse.json({
            status: 500,
            messages: 'Internal Server Error'
        })
        const data = rows[0];
        return NextResponse.json({
            status: 200,
            messages: 'success'
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({status: 500, messages: 'Internal Server Error'})
    }
}
