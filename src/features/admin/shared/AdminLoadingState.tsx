export function AdminLoadingState({ message = "正在加载…" }: { message?: string }) {
  return <p role="status" className="py-6 text-sm text-[#64748b]">{message}</p>;
}
