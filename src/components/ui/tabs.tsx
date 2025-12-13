"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      // Glassmorphism background with premium styling
      "inline-flex items-center justify-center gap-1",
      "rounded-xl p-1.5",
      "bg-white/80 dark:bg-gray-900/80",
      "backdrop-blur-md",
      "shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50",
      "border border-gray-200/60 dark:border-gray-700/60",
      "ring-1 ring-gray-100/50 dark:ring-gray-800/50",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      // Base styling
      "inline-flex items-center justify-center gap-2",
      "whitespace-nowrap rounded-lg px-4 py-2.5",
      "text-sm font-medium",
      "text-gray-600 dark:text-gray-400",
      
      // Transition effects
      "transition-all duration-300 ease-out",
      
      // Hover state
      "hover:text-[#800000] dark:hover:text-red-400",
      "hover:bg-gray-100/70 dark:hover:bg-gray-800/70",
      
      // Focus state
      "ring-offset-background",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      
      // Disabled state
      "disabled:pointer-events-none disabled:opacity-50",
      
      // Active state - Maroon gradient with premium shadow
      "data-[state=active]:bg-gradient-to-r",
      "data-[state=active]:from-[#800000] data-[state=active]:to-[#990000]",
      "data-[state=active]:text-white",
      "data-[state=active]:shadow-md data-[state=active]:shadow-[#800000]/25",
      "data-[state=active]:font-semibold",
      
      // Icon styling within trigger
      "[&>svg]:size-4 [&>svg]:shrink-0",
      
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-4",
      "ring-offset-background",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      
      // Smooth entrance animation
      "animate-in fade-in-0 slide-in-from-bottom-2",
      "duration-300 ease-out",
      
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
