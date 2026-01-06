import Image from "next/image";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub, faInstagram } from "@fortawesome/free-brands-svg-icons";
import { faQuestion, faEnvelope } from "@fortawesome/free-solid-svg-icons";

import Link from "next/link";

const Season3Main = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2">
      <Image src="/s3/profile.webp" width={250} height={250} alt="메인페이지 프로필 사진, 뭐해야 해요 모코콩?" className="mb-4" />
      <h3 className="font-bold text-lg">SEASON 3</h3>
      <ul className="s3-main">
        <li>
          <Link href="/s3/profile">
            <FontAwesomeIcon icon={faQuestion} />
          </Link>
        </li>

        <li>
          <Link href="https://instagram.com/doit.2er0" target="_blank">
            <FontAwesomeIcon icon={faInstagram} />
          </Link>
        </li>

        <li>
          <Link href="https://github.com/2er0" target="_blank">
            <FontAwesomeIcon icon={faGithub} />
          </Link>
        </li>
      </ul>

      <div className="mt-4">
        <Link href="mailto:hello@2er0.io" className="flex gap-1 items-center underline-offset-auto">
          <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4" />
          hello@2er0.io
        </Link>
      </div>
    </div>
  );
};

export default Season3Main;
