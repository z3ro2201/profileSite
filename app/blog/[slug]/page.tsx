const BlogContentPage = () => {
  return (
    <>
      <div className="pl-6 pr-4 pt-4 pb-6 w-full h-[calc(100%/2)] flex flex-col justify-end bg-[rgba(0,0,0,.5)] text-white">
        <div className="mb-2">
          <div className="w-full">
            <span className="py-1 px-3 min-w-[50px] inline-block bg-black text-white rounded-full text-[.8rem]">badge</span>
          </div>
          <h1 className="pb-1 inline-block border-b border-white text-[2.24rem] font-bold">example Title</h1>
        </div>
        <div className="mt-1 flex justify-between text-[0.9rem]">
          <div>
            <span className="inline-block mr-2">2025/01/18 00:00:00</span>
            <span className="inline-block">/</span>
            <span className="inline-block ml-2">0 comments</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogContentPage;
