
"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Link, useLocation } from "react-router-dom"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

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
    <div className={cn("flex items-center", className)}>
      <div className="flex items-center gap-2 bg-white/10 border border-sea/20 backdrop-blur-lg py-1 px-2 rounded-full shadow-sm min-w-fit">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.name

          return (
            <Link
              key={item.name}
              to={item.url}
              onClick={() => setActiveTab(item.name)}
              className={cn(
                "relative cursor-pointer text-sm font-semibold px-3 py-1.5 rounded-full transition-colors whitespace-nowrap",
                "text-foreground/80 hover:text-sea",
                isActive && "text-white",
              )}
            >
              <div className="flex items-center space-x-1">
                <span className="text-xs">{item.name}</span>
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
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-sea-light rounded-t-full">
                    <div className="absolute w-8 h-4 bg-sea/30 rounded-full blur-md -top-1 -left-1" />
                    <div className="absolute w-6 h-4 bg-sea/20 rounded-full blur-md -top-0.5" />
                    <div className="absolute w-3 h-3 bg-sea/20 rounded-full blur-sm top-0 left-1.5" />
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
