import {
  ClipboardList,
  PackagePlus,
  Warehouse,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  description?: string;
  disabled?: boolean;
};

export const mainNavItems: NavItem[] = [
  {
    title: "产品与 SKU 录入",
    href: "/products/new",
    icon: PackagePlus,
    description: "创建产品并批量添加 SKU",
  },
  {
    title: "库存操作台",
    href: "/inventory/operate",
    icon: Warehouse,
    description: "按 SKU 编号入库 / 出库",
    disabled: true,
  },
  {
    title: "库存明细与日志",
    href: "/inventory/logs",
    icon: ClipboardList,
    description: "查看库存变动记录",
    disabled: true,
  },
];
