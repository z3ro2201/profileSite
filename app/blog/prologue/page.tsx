// prologue는 /blog로 통합됨.
import { redirect } from "next/navigation";

const PrologueRedirect = () => {
  redirect("/blog");
};

export default PrologueRedirect;
