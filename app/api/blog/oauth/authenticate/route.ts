import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, body, query, cookies } = req;

  if (method === 'GET') {
    // GET 요청 처리
    const name = query.name || 'Anonymous';
    res.status(200).json({ message: `Hello, ${name}!` });
  } else if (method === 'POST') {
    // POST 요청 처리
    const { username, password } = body;
    // ... 추가적인 로직 수행
    res.status(200).json({ message: 'POST request received' });
  } else {
    // 다른 요청 메서드 처리
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
