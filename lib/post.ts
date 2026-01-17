import { PostStateProp } from "@/types/Posts";
type Prop = {
  code: PostStateProp;
  name: string;
};
export const PostStateType: Prop[] = [
  { code: "DRAFT", name: "임시저장" },
  { code: "PUBLISHED", name: "발행" },
  { code: "ARCHIVED", name: "보관" },
];
