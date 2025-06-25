
import { Home, User, Briefcase, FileText, ShoppingCart } from 'lucide-react'
import { NavBar } from "@/components/ui/tubelight-navbar"

export function TubelightNavBarDemo() {
  const navItems = [
    { name: 'Home', url: '/', icon: Home },
    { name: 'About', url: '/about', icon: User },
    { name: 'Products', url: '/products', icon: Briefcase },
    { name: 'Floor Planner', url: '/floor-planner', icon: FileText },
    { name: 'Blog', url: '/blog', icon: FileText },
    { name: 'Contact', url: '/contact', icon: User },
    { name: 'RFQ Cart', url: '/rfq-cart', icon: ShoppingCart }
  ]

  return <NavBar items={navItems} />
}
