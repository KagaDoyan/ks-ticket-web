import { paths } from '@/paths';
import { AssessmentOutlined, CallToActionOutlined, CategoryOutlined, ConfirmationNumberOutlined, EngineeringOutlined, ExtensionOutlined, GroupOutlined, LocalOfferOutlined, LowPriorityOutlined, MapOutlined, MoveToInboxOutlined, Person2Outlined, StoreMallDirectoryOutlined } from "@mui/icons-material";

export const navItems = [
  {
    group: 'Main',
    key: 'Main',
    items: [
      { key: 'dashboard', title: 'Dashboard', href: paths.dashboard.overview, icon: AssessmentOutlined },
      { key: 'ticket', title: 'ticket', href: paths.dashboard.ticket, icon: ConfirmationNumberOutlined },
    ]
  },
  {
    group: 'Settings',
    key: 'Settings',
    items: [
      { key: 'customer', title: 'customer', href: paths.dashboard.customer, icon: GroupOutlined },
      { key: 'shop', title: 'shop', href: paths.dashboard.shop, icon: StoreMallDirectoryOutlined },
      { key: 'engineer', title: 'engineer', href: paths.dashboard.engineer, icon: EngineeringOutlined },
      { key: 'users', title: 'users', href: paths.dashboard.users, icon: Person2Outlined },
      { key: 'provinces', title: 'provinces', href: paths.dashboard.province, icon: MapOutlined },
      { key: 'priority_group', title: 'priorities group', href: paths.dashboard.priorities, icon: LowPriorityOutlined },
    ]
  },
  {
    group: 'Item Mangement',
    key: 'Item_Mangement',
    items: [
      // { key: 'move_item', title: 'move item', href: paths.dashboard.move_item, icon: MoveToInboxOutlined },
      { key: 'item', title: 'item', href: paths.dashboard.item, icon: CallToActionOutlined },
      { key: 'brand', title: 'brand', href: paths.dashboard.brand, icon: LocalOfferOutlined },
      { key: 'category', title: 'category', href: paths.dashboard.category, icon: CategoryOutlined },
      { key: 'model', title: 'model', href: paths.dashboard.model, icon: ExtensionOutlined },
    ]
  }
];
