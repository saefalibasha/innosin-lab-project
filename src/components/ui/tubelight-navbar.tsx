
"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Link, useLocation } from "react-router-dom"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRFQ } from "@/contexts/RFQContext"
import { Badge } from "@/components/ui/badge"

interface NavItem {
  name: string
  url: string
  icon: LucideIcon
}

interface NavBarProps {
  items: NavItem[]
  className?: string
}

export function NavBar({ items, className }: NavBarProps) {
  const location = useLocation()
  const [activeTab, setActiveTab] = useState(items[0].name)
  const [isMobile, setIsMobile] = useState(false)
  const { itemCount } = useRFQ()

  useEffect(() => {
    // Set active tab based on current route
    const currentItem = items.find(item => item.url === location.pathname)
    if (currentItem) {
      setActiveTab(currentItem.name)
    }
  }, [location.pathname, items])

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div
      className={cn(
        "fixed top-6 left-1/2 -translate-x-1/2 z-50",
        className,
      )}
    >
      <div className="flex items-center gap-3 bg-white/10 border border-sea/20 backdrop-blur-lg py-1 px-1 rounded-full shadow-lg">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.name
          const isRFQCart = item.name === 'RFQ Cart'

          return (
            <Link
              key={item.name}
              to={item.url}
              onClick={() => setActiveTab(item.name)}
              className={cn(
                "relative cursor-pointer text-sm font-semibold px-6 py-2 rounded-full transition-colors",
                "text-foreground/80 hover:text-sea",
                isActive && "text-white",
              )}
            >
              <div className="flex items-center space-x-2">
                <span className="hidden md:inline">{item.name}</span>
                <span className="md:hidden relative">
                  <Icon size={18} strokeWidth={2.5} />
                  {isRFQCart && itemCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-4 w-4 flex items-center justify-center p-0 text-xs bg-sea hover:bg-sea-dark border-0"
                    >
                      {itemCount}
                    </Badge>
                  )}
                </span>
                {isRFQCart && itemCount > 0 && !isMobile && (
                  <Badge 
                    variant="destructive" 
                    className="h-4 w-4 flex items-center justify-center p-0 text-xs bg-sea hover:bg-sea-dark border-0"
                  >
                    {itemCount}
                  </Badge>
                )}
              </div>
              {isActive && (
                <motion.div
                  layoutId="lamp"
                  className="absolute inset-0 w-full bg-sea rounded-full -z-10"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-sea-light rounded-t-full">
                    <div className="absolute w-12 h-6 bg-sea/30 rounded-full blur-md -top-2 -left-2" />
                    <div className="absolute w-8 h-6 bg-sea/20 rounded-full blur-md -top-1" />
                    <div className="absolute w-4 h-4 bg-sea/20 rounded-full blur-sm top-0 left-2" />
                  </div>
                </motion.div>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
