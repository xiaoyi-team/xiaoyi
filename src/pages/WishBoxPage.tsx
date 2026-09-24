function WishBoxPage() {
  return (
    <main className="grid min-h-dvh w-full place-items-center bg-slate-100">
      <section
        aria-label="心愿盒 16:9 场景坐标验证区域"
        className="relative w-full border border-dashed border-slate-500 bg-emerald-100"
        style={{
          aspectRatio: "16 / 9",
          maxWidth: "177.7778dvh",
        }}
      >
        <span
          aria-hidden="true"
          className="absolute left-[5%] top-[5%] aspect-square w-[2%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-fuchsia-600"
        />
        <span
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 aspect-square w-[2%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-700"
        />
        <span
          aria-hidden="true"
          className="absolute bottom-[5%] right-[5%] aspect-square w-[2%] translate-x-1/2 translate-y-1/2 rounded-full bg-rose-600"
        />
      </section>
    </main>
  );
}

export default WishBoxPage;
