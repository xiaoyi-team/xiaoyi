import HomeMap from "../features/home/components/HomeMap";

function HomePage() {
  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-black">
      <h1 className="sr-only">萧与逸之恋首页地图</h1>
      <HomeMap />
    </main>
  );
}

export default HomePage;
