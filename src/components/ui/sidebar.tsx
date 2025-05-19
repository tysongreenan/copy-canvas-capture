
"use client";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge"
import {
  Blocks,
  ChevronsUpDown,
  FileClock,
  GraduationCap,
  Layout,
  LayoutDashboard,
  LogOut,
  MessageSquareText,
  MessagesSquare,
  Plus,
  Settings,
  UserCircle,
  UserCog,
  UserSearch,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

const sidebarVariants = {
  open: {
    width: "15rem",
  },
  closed: {
    width: "3.05rem",
  },
};

const contentVariants = {
  open: { display: "block", opacity: 1 },
  closed: { display: "block", opacity: 1 },
};

const variants = {
  open: {
    x: 0,
    opacity: 1,
    transition: {
      x: { stiffness: 1000, velocity: -100 },
    },
  },
  closed: {
    x: -20,
    opacity: 0,
    transition: {
      x: { stiffness: 100 },
    },
  },
};

const transitionProps = {
  type: "tween",
  ease: "easeOut",
  duration: 0.2,
  staggerChildren: 0.1,
};

const staggerVariants = {
  open: {
    transition: { staggerChildren: 0.03, delayChildren: 0.02 },
  },
};


export function SessionNavBar() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const pathname = window.location.pathname;
  
  return (
    <motion.div
      className={cn(
        "sidebar fixed left-0 z-40 h-full shrink-0 border-r fixed",
      )}
      initial={isCollapsed ? "closed" : "open"}
      animate={isCollapsed ? "closed" : "open"}
      variants={sidebarVariants}
      transition={transitionProps}
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
    >
      <motion.div
        className={`relative z-40 flex text-muted-foreground h-full shrink-0 flex-col bg-white border-r border-gray-200 transition-all`}
        variants={contentVariants}
      >
        <motion.ul variants={staggerVariants} className="flex h-full flex-col">
          <div className="flex grow flex-col items-center">
            <div className="flex h-[54px] w-full shrink-0 border-b border-gray-200 p-2">
              <div className=" mt-[1.5px] flex w-full">
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger className="w-full" asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex w-fit items-center gap-2 text-gray-800 px-2" 
                    >
                      <Avatar className='rounded size-4'>
                        <AvatarFallback>O</AvatarFallback>
                      </Avatar>
                      <motion.li
                        variants={variants}
                        className="flex w-fit items-center gap-2"
                      >
                        {!isCollapsed && (
                          <>
                            <p className="text-sm font-medium">
                              {"Organization"}
                            </p>
                            <ChevronsUpDown className="h-4 w-4 text-gray-500" />
                          </>
                        )}
                      </motion.li>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="bg-white border-gray-200 text-gray-800">
                    <DropdownMenuItem
                      className="flex items-center gap-2 text-gray-800 hover:bg-gray-50 focus:bg-gray-100 cursor-pointer"
                    >
                      <UserCog className="h-4 w-4" /> Manage members
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="flex items-center gap-2 text-gray-800 hover:bg-gray-50 focus:bg-gray-100 cursor-pointer"
                    >
                      <Blocks className="h-4 w-4" /> Integrations
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-gray-800 hover:bg-gray-50 focus:bg-gray-100 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Create organization
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="flex h-full w-full flex-col">
              <div className="flex grow flex-col gap-4">
                <ScrollArea className="h-16 grow p-2">
                  <div className={cn("flex w-full flex-col gap-1")}>
                    <a
                      href="/dashboard"
                      className={cn(
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 text-gray-700 transition hover:bg-gray-100",
                        pathname.includes("dashboard") &&
                          "bg-gray-100 text-blue-600",
                      )}
                    >
                      <LayoutDashboard className="h-4 w-4" />{" "}
                      <motion.li variants={variants}>
                        {!isCollapsed && (
                          <p className="ml-2 text-sm font-medium">Dashboard</p>
                        )}
                      </motion.li>
                    </a>
                    <a
                      href="/reports"
                      className={cn(
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition text-gray-600 hover:bg-gray-100 hover:text-gray-900",

                        pathname.includes("reports") &&
                          "bg-gray-100 text-blue-600",
                      )}
                    >
                      <FileClock className="h-4 w-4" />{" "}
                      <motion.li variants={variants}>
                        {!isCollapsed && (
                          <div className="flex items-center gap-2">
                            <p className="ml-2 text-sm font-medium">Reports</p>
                          </div>
                        )}
                      </motion.li>
                    </a>
                    <a
                      href="/chat"
                      className={cn(
                        "flex h-8 flex-row items-center rounded-md px-2 py-1.5 transition text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                        pathname.includes("chat") && "bg-gray-100 text-blue-600",
                      )}
                    >
                      <MessagesSquare className="h-4 w-4" />
                      <motion.li variants={variants}>
                        {!isCollapsed && (
                          <div className="ml-2 flex items-center gap-2">
                            <p className="text-sm font-medium">Chat</p>
                            <Badge
                              className={cn(
                                "flex h-fit w-fit items-center gap-1.5 rounded border-none bg-blue-50 px-1.5 text-blue-600",
                              )}
                              variant="outline"
                            >
                              BETA
                            </Badge>
                          </div>
                        )}
                      </motion.li>
                    </a>
                    <Separator className="w-full my-2 bg-gray-200" />
                    <a
                      href="/deals"
                      className={cn(
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition text-gray-600 hover:bg-gray-100 hover:text-gray-900",

                        pathname.includes("deals") && "bg-gray-100 text-blue-600",
                      )}
                    >
                      <Layout className="h-4 w-4" />{" "}
                      <motion.li variants={variants}>
                        {!isCollapsed && (
                          <p className="ml-2 text-sm font-medium">Deals</p>
                        )}
                      </motion.li>
                    </a>
                    <a
                      href="/accounts"
                      className={cn(
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition text-gray-600 hover:bg-gray-100 hover:text-gray-900",

                        pathname.includes("accounts") &&
                          "bg-gray-100 text-blue-600",
                      )}
                    >
                      <UserCircle className="h-4 w-4" />{" "}
                      <motion.li variants={variants}>
                        {!isCollapsed && (
                          <p className="ml-2 text-sm font-medium">Accounts</p>
                        )}
                      </motion.li>
                    </a>
                    <a
                      href="/competitors"
                      className={cn(
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition text-gray-600 hover:bg-gray-100 hover:text-gray-900",

                        pathname.includes("competitors") &&
                          "bg-gray-100 text-blue-600",
                      )}
                    >
                      <UserSearch className="h-4 w-4" />
                      <motion.li variants={variants}>
                        {!isCollapsed && (
                          <p className="ml-2 text-sm font-medium">
                            Competitors
                          </p>
                        )}
                      </motion.li>
                    </a>
                    <Separator className="w-full my-2 bg-gray-200" />
                    <a
                      href="/library/knowledge"
                      className={cn(
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition text-gray-600 hover:bg-gray-100 hover:text-gray-900",

                        pathname.includes("library") &&
                          "bg-gray-100 text-blue-600",
                      )}
                    >
                      <GraduationCap className="h-4 w-4" />{" "}
                      <motion.li variants={variants}>
                        {!isCollapsed && (
                          <p className="ml-2 text-sm font-medium">
                            Knowledge Base
                          </p>
                        )}
                      </motion.li>
                    </a>
                    <a
                      href="/feedback"
                      className={cn(
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                        pathname.includes("feedback") &&
                          "bg-gray-100 text-blue-600",
                      )}
                    >
                      <MessageSquareText className="h-4 w-4" />{" "}
                      <motion.li variants={variants}>
                        {!isCollapsed && (
                          <p className="ml-2 text-sm font-medium">Feedback</p>
                        )}
                      </motion.li>
                    </a>
                    <a
                      href="/review"
                      className={cn(
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition text-gray-600 hover:bg-gray-100 hover:text-gray-900",

                        pathname.includes("review") &&
                          "bg-gray-100 text-blue-600",
                      )}
                    >
                      <FileClock className="h-4 w-4" />{" "}
                      <motion.li variants={variants}>
                        {!isCollapsed && (
                          <p className="ml-2 text-sm font-medium">
                            Document Review
                          </p>
                        )}
                      </motion.li>
                    </a>
                  </div>
                </ScrollArea>
              </div>
              <div className="flex flex-col p-2">
                <a
                  href="/settings/integrations"
                  className="mt-auto flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
                >
                  <Settings className="h-4 w-4 shrink-0" />{" "}
                  <motion.li variants={variants}>
                    {!isCollapsed && (
                      <p className="ml-2 text-sm font-medium"> Settings</p>
                    )}
                  </motion.li>
                </a>
                <div>
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger className="w-full">
                      <div className="flex h-8 w-full flex-row items-center gap-2 rounded-md px-2 py-1.5 text-gray-600 transition hover:bg-gray-100 hover:text-gray-900">
                        <Avatar className="size-4">
                          <AvatarFallback>
                            A
                          </AvatarFallback>
                        </Avatar>
                        <motion.li
                          variants={variants}
                          className="flex w-full items-center gap-2"
                        >
                          {!isCollapsed && (
                            <>
                              <p className="text-sm font-medium">Account</p>
                              <ChevronsUpDown className="ml-auto h-4 w-4 text-gray-500" />
                            </>
                          )}
                        </motion.li>
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent sideOffset={5} className="bg-white border-gray-200 text-gray-800">
                      <div className="flex flex-row items-center gap-2 p-2">
                        <Avatar className="size-6">
                          <AvatarFallback>
                            A
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col text-left">
                          <span className="text-sm font-medium">
                            {"User"}
                          </span>
                          <span className="line-clamp-1 text-xs text-gray-500">
                            {"user@example.com"}
                          </span>
                        </div>
                      </div>
                      <DropdownMenuSeparator className="bg-gray-200" />
                      <DropdownMenuItem
                        className="flex items-center gap-2 text-gray-800 hover:bg-gray-50 focus:bg-gray-100 cursor-pointer"
                      >
                        <UserCircle className="h-4 w-4" /> Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="flex items-center gap-2 text-gray-800 hover:bg-gray-50 focus:bg-gray-100 cursor-pointer"
                      >
                        <LogOut className="h-4 w-4" /> Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
        </motion.ul>
      </motion.div>
    </motion.div>
  );
}
