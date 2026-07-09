// Next.js는 어떤 layout/page에서든 전역 스타일시트(.css)를 side-effect로
// import하는 걸 허용하지만(webpack 레벨에서는 문제없이 처리됨), 이 프로젝트엔
// 그에 대한 앰비언트 모듈 선언이 없어서 에디터의 tsserver가
// "모듈 또는 형식 선언을 찾을 수 없습니다(ts 2882)"로 표시할 수 있다.
// (app/globals.css는 app/layout.tsx=루트 레이아웃에서만 import돼서 우연히
// 안 걸렸을 뿐, app/s4/layout.tsx처럼 중첩 레이아웃에서 import하면 걸림)
declare module "*.css";
