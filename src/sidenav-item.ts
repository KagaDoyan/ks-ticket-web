import { paths } from '@/paths';
import { AssessmentOutlined, CallToActionOutlined, CategoryOutlined, ConfirmationNumberOutlined, EngineeringOutlined, ExtensionOutlined, GroupOutlined, LocalOfferOutlined, LowPriorityOutlined, MapOutlined, MoveToInboxOutlined, Person2Outlined, ReportOffOutlined, SpokeOutlined, StoreMallDirectoryOutlined, SummarizeOutlined, WarehouseOutlined } from "@mui/icons-material";

export const navItems = [
  {
    group: 'Main',
    key: 'Main',
    items: [
      { key: 'dashboard', title: 'Dashboard', href: paths.dashboard.overview, icon: AssessmentOutlined, role: ["Admin", "Engineer", "User", "Customer"] },
      { key: 'ticket', title: 'ticket', href: paths.dashboard.ticket, icon: ConfirmationNumberOutlined, role: ["Admin", "Engineer", "User", "Customer"] },
      { key: 'report', title: 'report', href: paths.dashboard.report, icon: SummarizeOutlined, role: ["Admin", "User", "Customer"] },
    ]
  },
  {
    group: 'Settings',
    key: 'Settings',
    items: [
      { key: 'customer', title: 'customer', href: paths.dashboard.customer, icon: GroupOutlined, role: ["SuperAdmin", "Admin", "User", "Customer"] },
      { key: 'shop', title: 'shop', href: paths.dashboard.shop, icon: StoreMallDirectoryOutlined, role: ["SuperAdmin", "Admin", "User", "Customer"] },
      { key: 'engineer', title: 'engineer', href: paths.dashboard.engineer, icon: EngineeringOutlined, role: ["SuperAdmin", "Admin", "User", "Customer"] },
      { key: 'users', title: 'users', href: paths.dashboard.users, icon: Person2Outlined, role: ["SuperAdmin", "Admin", "User", "Customer"] },
      { key: 'node', title: 'node', href: paths.dashboard.node, icon: SpokeOutlined, role: ["SuperAdmin", "Admin", "User", "Customer"] },
      { key: 'provinces', title: 'provinces', href: paths.dashboard.province, icon: MapOutlined, role: ["SuperAdmin", "Admin", "User", "Customer"] },
      { key: 'priority_group', title: 'priorities group', href: paths.dashboard.priorities, icon: LowPriorityOutlined, role: ["SuperAdmin", "Admin", "User", "Customer"] },
    ]
  },
  {
    group: 'Item Mangement',
    key: 'Item_Mangement',
    items: [
      // { key: 'move_item', title: 'move item', href: paths.dashboard.move_item, icon: MoveToInboxOutlined },
      { key: 'item', title: 'item', href: paths.dashboard.item, icon: CallToActionOutlined, role: ["SuperAdmin", "Admin", "User", "Customer"] },
      { key: 'brand', title: 'brand', href: paths.dashboard.brand, icon: LocalOfferOutlined, role: ["SuperAdmin", "Admin", "User", "Customer"] },
      { key: 'category', title: 'category', href: paths.dashboard.category, icon: CategoryOutlined, role: ["SuperAdmin", "Admin", "User", "Customer"] },
      { key: 'model', title: 'model', href: paths.dashboard.model, icon: ExtensionOutlined, role: ["SuperAdmin", "Admin", "User", "Customer"] },
      { key: 'storage', title: 'storage', href: paths.dashboard.storage, icon: WarehouseOutlined, role: ["SuperAdmin", "Admin", "User", "Customer"] },
    ]
  },
  {
    group: 'Sell',
    key: 'sell',
    items: [
      { key: 'sell', title: 'sell', href: paths.dashboard.sell, icon: ReportOffOutlined, role: ["SuperAdmin"] },
    ]
  }
];
