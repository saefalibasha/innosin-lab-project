
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';
import { ChevronDown, LayoutDashboard, Layers, Package, Users, HelpCircle, FileText, Settings } from 'lucide-react';

const HeroNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const navigationItems = [
    {
      title: 'Products',
      icon: Package,
      items: [
        { title: 'Product Catalog', href: '/products', description: 'Browse our complete product range' },
        { title: 'Categories', href: '/categories', description: 'Explore products by category' },
        { title: 'New Arrivals', href: '/products?filter=new', description: 'Latest additions to our catalog' },
      ]
    },
    {
      title: 'Planning Tools',
      icon: LayoutDashboard,
      items: [
        { title: 'Floor Planner', href: '/floor-planner', description: 'Design and plan your laboratory space' },
        { title: 'Room Templates', href: '/templates', description: 'Pre-designed laboratory layouts' },
        { title: '3D Viewer', href: '/viewer', description: 'Interactive 3D product visualization' },
      ]
    },
    {
      title: 'Resources',
      icon: FileText,
      items: [
        { title: 'Documentation', href: '/docs', description: 'Installation guides and manuals' },
        { title: 'Support Center', href: '/support', description: 'Get help and technical support' },
        { title: 'Downloads', href: '/downloads', description: 'CAD files, specifications, and more' },
      ]
    }
  ];

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src="/branding/hero-logo.png" 
                alt="Innosin Lab" 
                className="h-10 w-auto"
              />
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-foreground">LabSpace</h1>
                <p className="text-xs text-muted-foreground">Laboratory Solutions</p>
              </div>
            </Link>
          </div>

          {/* Navigation Menu */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              {navigationItems.map((item) => (
                <NavigationMenuItem key={item.title}>
                  <NavigationMenuTrigger className="h-12 px-4 text-base">
                    <item.icon className="mr-2 h-5 w-5" />
                    {item.title}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      {item.items.map((subItem) => (
                        <li key={subItem.title}>
                          <NavigationMenuLink asChild>
                            <Link
                              className={cn(
                                'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
                                isActive(subItem.href) && 'bg-accent text-accent-foreground'
                              )}
                              to={subItem.href}
                            >
                              <div className="text-sm font-medium leading-none">{subItem.title}</div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                {subItem.description}
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            <Button
              variant={isActive('/admin') ? 'default' : 'ghost'}
              size="sm"
              onClick={() => navigate('/admin')}
              className="h-10 px-4"
            >
              <Settings className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Admin</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/help')}
              className="h-10 px-4"
            >
              <HelpCircle className="h-4 w-4" />
              <span className="sr-only">Help</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeroNavigation;
