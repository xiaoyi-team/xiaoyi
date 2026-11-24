export function AdminHeader({ onLogout }: { onLogout: () => void }) {
  return (
    <header className="flex min-h-16 shrink-0 items-center justify-between gap-3 border-b border-[#dce3ed] bg-white px-5 sm:px-8 md:min-h-20">
      <span className="text-sm font-medium text-[#536781]">后台首页</span>
      <button type="button" onClick={onLogout} className="min-h-11 shrink-0 rounded-lg px-3 text-sm font-medium text-[#31578d] hover:bg-[#edf2f8] focus-visible:outline-2 focus-visible:outline-offset-2">
        退出登录
      </button>
    </header>
  );
}
