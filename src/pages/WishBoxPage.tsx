import { Link } from "react-router";

function WishBoxPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-3xl font-bold">心愿盒</h1>
      <p>当前为页面占位，后续 Feature 开发时实现。</p>
      <Link className="underline" to="/home">
        返回首页
      </Link>
    </main>
  );
}

export default WishBoxPage;
