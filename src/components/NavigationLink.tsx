import { preloadRoute } from '../utils/lazyImports';

// Navigation component with route preloading on hover
interface NavigationLinkProps {
  to: string;
  children: React.ReactNode;
  routeName?: string;
}

export const NavigationLink = ({ to, children, routeName }: NavigationLinkProps) => {
  const handleMouseEnter = () => {
    if (routeName) {
      // Preload route chunk on hover for instant navigation
      preloadRoute(routeName);
    }
  };

  return (
    <div onMouseEnter={handleMouseEnter}>
      {children}
    </div>
  );
};