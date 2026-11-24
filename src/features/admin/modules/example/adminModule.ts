import type { AdminModule } from "../../moduleContract";

export const exampleModule = {
  id: "example",
  label: "示例模块",
  routes: [
    { id: "overview", index: true, loadPage: () => import("./pages/ExampleOverview") },
    { id: "about", path: "about", activeMenuId: "overview", loadPage: () => import("./pages/ExampleAbout") },
  ],
  menu: [{ id: "overview", routeId: "overview", label: "示例首页", groupId: "examples", groupLabel: "示例", icon: "◇" }],
} satisfies AdminModule;
