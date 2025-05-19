
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
        className={`relative z-40 flex text-muted-foreground h-full shrink-0 flex-col bg-gray-900 border-r border-white/5 transition-all`}
        variants={contentVariants}
      >
        <motion.ul variants={staggerVariants} className="flex h-full flex-col">
          <div className="flex grow flex-col items-center">
            <div className="flex h-[54px] w-full shrink-0 border-b border-white/5 p-2">
              <div className=" mt-[1.5px] flex w-full">
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger className="w-full" asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex w-fit items-center gap-2 text-white px-2" 
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
                            <ChevronsUpDown className="h-4 w-4 text-white/50" />
                          </>
                        )}
                      </motion.li>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="bg-gray-900 border-white/10 text-white">
                    <DropdownMenuItem
                      className="flex items-center gap-2 text-white hover:bg-white/5 focus:bg-white/10 cursor-pointer"
                    >
                      <UserCog className="h-4 w-4" /> Manage members
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="flex items-center gap-2 text-white hover:bg-white/5 focus:bg-white/10 cursor-pointer"
                    >
                      <Blocks className="h-4 w-4" /> Integrations
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-white hover:bg-white/5 focus:bg-white/10 cursor-pointer">
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
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 text-white transition hover:bg-white/5",
                        pathname.includes("dashboard") &&
                          "bg-white/5 text-blue-400",
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
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition text-white/70 hover:bg-white/5 hover:text-white",

                        pathname.includes("reports") &&
                          "bg-white/5 text-blue-400",
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
                        "flex h-8 flex-row items-center rounded-md px-2 py-1.5 transition text-white/70 hover:bg-white/5 hover:text-white",
                        pathname.includes("chat") && "bg-white/5 text-blue-400",
                      )}
                    >
                      <MessagesSquare className="h-4 w-4" />
                      <motion.li variants={variants}>
                        {!isCollapsed && (
                          <div className="ml-2 flex items-center gap-2">
                            <p className="text-sm font-medium">Chat</p>
                            <Badge
                              className={cn(
                                "flex h-fit w-fit items-center gap-1.5 rounded border-none bg-blue-500/20 px-1.5 text-blue-400",
                              )}
                              variant="outline"
                            >
                              BETA
                            </Badge>
                          </div>
                        )}
                      </motion.li>
                    </a>
                    <Separator className="w-full my-2 bg-white/10" />
                    <a
                      href="/deals"
                      className={cn(
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition text-white/70 hover:bg-white/5 hover:text-white",

                        pathname.includes("deals") && "bg-white/5 text-blue-400",
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
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition text-white/70 hover:bg-white/5 hover:text-white",

                        pathname.includes("accounts") &&
                          "bg-white/5 text-blue-400",
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
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition text-white/70 hover:bg-white/5 hover:text-white",

                        pathname.includes("competitors") &&
                          "bg-white/5 text-blue-400",
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
                    <Separator className="w-full my-2 bg-white/10" />
                    <a
                      href="/library/knowledge"
                      className={cn(
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition text-white/70 hover:bg-white/5 hover:text-white",

                        pathname.includes("library") &&
                          "bg-white/5 text-blue-400",
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
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition text-white/70 hover:bg-white/5 hover:text-white",
                        pathname.includes("feedback") &&
                          "bg-white/5 text-blue-400",
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
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition text-white/70 hover:bg-white/5 hover:text-white",

                        pathname.includes("review") &&
                          "bg-white/5 text-blue-400",
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
                  className="mt-auto flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 text-white/70 transition hover:bg-white/5 hover:text-white"
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
                      <div className="flex h-8 w-full flex-row items-center gap-2 rounded-md px-2 py-1.5 text-white/70 transition hover:bg-white/5 hover:text-white">
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
                              <ChevronsUpDown className="ml-auto h-4 w-4 text-white/50" />
                            </>
                          )}
                        </motion.li>
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent sideOffset={5} className="bg-gray-900 border-white/10 text-white">
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
                          <span className="line-clamp-1 text-xs text-white/60">
                            {"user@example.com"}
                          </span>
                        </div>
                      </div>
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuItem
                        className="flex items-center gap-2 text-white hover:bg-white/5 focus:bg-white/10 cursor-pointer"
                      >
                        <UserCircle className="h-4 w-4" /> Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="flex items-center gap-2 text-white hover:bg-white/5 focus:bg-white/10 cursor-pointer"
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
