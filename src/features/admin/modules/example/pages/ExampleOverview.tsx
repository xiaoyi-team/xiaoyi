import { Link } from "react-router";
import { toast } from "sonner";
import { AdminPageHeader } from "../../../shared/AdminPageHeader";
import { AdminLoadingState } from "../../../shared/AdminLoadingState";
import { AdminErrorState } from "../../../shared/AdminErrorState";
import { AdminEmptyState } from "../../../shared/AdminEmptyState";

export default function ExampleOverview() {
  return (
    <section className="space-y-8">
      <AdminPageHeader
        title="示例模块"
        description="这里展示模块页面如何使用后台共享组件。"
        actions={<Link to="about" className="inline-flex min-h-11 items-center rounded-lg bg-[#344f7d] px-4 text-white focus-visible:outline-2 focus-visible:outline-offset-2">查看详情</Link>}
      />
      <section aria-label="通知示例" className="flex flex-wrap gap-2">
        <button onClick={() => toast.success("操作已完成")} className="min-h-11 rounded-lg bg-[#344f7d] px-4 text-white">成功通知</button>
        <button onClick={() => toast.error("操作未能完成")} className="min-h-11 rounded-lg border border-[#d8baba] px-4 text-[#713b3b]">错误通知</button>
        <button onClick={() => toast("这是一条普通提示")} className="min-h-11 rounded-lg border border-[#dce3ed] px-4">普通提示</button>
      </section>
      <AdminLoadingState message="加载状态示例" />
      <AdminErrorState title="错误状态示例" description="此处展示由页面决定的错误说明。" onRetry={() => toast("已触发本地重试示例")} />
      <AdminEmptyState title="空状态示例" description="没有数据时展示简洁说明。" />
    </section>
  );
}
