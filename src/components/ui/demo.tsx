
import { Home, User, Briefcase, FileText, ShoppingCart } from 'lucide-react'
import { TubelightNavBar } from "@/components/ui/tubelight-navbar"

export function TubelightNavBarDemo() {
  const navItems = [
    { name: 'Home', url: '/', icon: Home },
    { name: 'Products', url: '/products', icon: Briefcase },
    { name: 'Floor Planner', url: '/floor-planner', icon: FileText },
    { name: 'About', url: '/about', icon: User },
    { name: 'Contact', url: '/contact', icon: ShoppingCart }
  ]

  return <TubelightNavBar items={navItems} />
}
