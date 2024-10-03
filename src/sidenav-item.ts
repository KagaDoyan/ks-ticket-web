import { paths } from '@/paths';
import { AssessmentOutlined, CallToActionOutlined, CategoryOutlined, ConfirmationNumberOutlined, EmailOutlined, EngineeringOutlined, ExtensionOutlined, GroupOutlined, Groups2Outlined, GroupsOutlined, LocalOfferOutlined, LowPriorityOutlined, MapOutlined, Person2Outlined, SpokeOutlined, StorefrontOutlined, StoreMallDirectoryOutlined, SummarizeOutlined, WarehouseOutlined } from "@mui/icons-material";

export const navItems = [
  {
    group: 'Main',
    key: 'Main',
    items: [
      { key: 'dashboard', title: 'Dashboard', href: paths.dashboard.overview, icon: AssessmentOutlined, role: ["SuperAdmin", "Admin", "User", "Customer"] },
      { key: 'ticket', title: 'ticket', href: paths.dashboard.ticket, icon: ConfirmationNumberOutlined, role: ["SuperAdmin", "Admin", "Engineer", "User"] },
      { key: 'report', title: 'report', href: paths.dashboard.report, icon: SummarizeOutlined, role: ["SuperAdmin", "Admin", "User"] },
    ]
  },
  {
    group: 'Settings',
    key: 'Settings',
    items: [
      { key: 'customer', title: 'customer', href: paths.dashboard.customer, icon: GroupOutlined, role: ["SuperAdmin", "Admin"] },
      { key: 'shop', title: 'shop', href: paths.dashboard.shop, icon: StoreMallDirectoryOutlined, role: ["SuperAdmin", "Admin"] },
      { key: 'engineer', title: 'engineer', href: paths.dashboard.engineer, icon: EngineeringOutlined, role: ["SuperAdmin", "Admin"] },
      { key: 'users', title: 'users', href: paths.dashboard.users, icon: Person2Outlined, role: ["SuperAdmin", "Admin"] },
      { key: 'node', title: 'node', href: paths.dashboard.node, icon: SpokeOutlined, role: ["SuperAdmin", "Admin"] },
      { key: 'provinces', title: 'provinces', href: paths.dashboard.province, icon: MapOutlined, role: ["SuperAdmin", "Admin"] },
      { key: 'priority_group', title: 'priorities group', href: paths.dashboard.priorities, icon: LowPriorityOutlined, role: ["SuperAdmin", "Admin"] },
      { key: 'teams', title: 'teams', href: paths.dashboard.team, icon: Groups2Outlined, role: ["SuperAdmin", "Admin"] },
      { key: 'email', title: 'email', href: paths.dashboard.email, icon: EmailOutlined, role: ["SuperAdmin", "Admin"] },
    ]
  },
  {
    group: 'Item Mangement',
    key: 'Item_Mangement',
    items: [
      // { key: 'move_item', title: 'move item', href: paths.dashboard.move_item, icon: MoveToInboxOutlined },
      { key: 'item', title: 'item', href: paths.dashboard.item, icon: CallToActionOutlined, role: ["SuperAdmin", "Admin", "User"] },
      { key: 'brand', title: 'brand', href: paths.dashboard.brand, icon: LocalOfferOutlined, role: ["SuperAdmin", "Admin", "User"] },
      { key: 'category', title: 'category', href: paths.dashboard.category, icon: CategoryOutlined, role: ["SuperAdmin", "Admin", "User"] },
      { key: 'model', title: 'model', href: paths.dashboard.model, icon: ExtensionOutlined, role: ["SuperAdmin", "Admin", "User"] },
      { key: 'storage', title: 'storage', href: paths.dashboard.storage, icon: WarehouseOutlined, role: ["SuperAdmin", "Admin"] },
    ]
  },
  {
    group: 'Sell',
    key: 'sell',
    items: [
      { key: 'sell', title: 'sell', href: paths.dashboard.sell, icon: StorefrontOutlined, role: ["SuperAdmin"] },
    ]
  }
];
