import { Link } from "react-router";

type ModulePlaceholderProps = {
  title: string;
};

function ModulePlaceholder({ title }: ModulePlaceholderProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-3xl font-bold">{title}</h1>
      <p>页面建设中</p>
      <Link className="underline" to="/home">
        返回首页
      </Link>
    </main>
  );
}

export default ModulePlaceholder;
