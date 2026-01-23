"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import {
  ChevronDownIcon,
  HorizontaLDots,
} from "../icons/index";
import { Home, FileText, Clock, Users, Package, CreditCard, Activity } from "lucide-react";
import Image from "next/image";

type NavItem = {
  name: string;
  icon?: React.ReactNode;
  path?: string;
  subItems?: { name: string; icon?: React.ReactNode; path: string; pro?: boolean; new?: boolean }[];
};

const navItems: NavItem[] = [
  {
    name: "Dashboard",
    icon: <Home size={20} strokeWidth={2} />,
    path: "/"
  },
  {
    name: "Health Dashboard",
    icon: <Activity size={20} strokeWidth={2} />,
    path: "/health-dashboard",
    subItems:[
      { name: "Dashboard", path: "/health-dashboard" },
      { name: "Hackathon Diagnostics", path: "/health-dashboard/diagnostics" },
      { name: "Organizers At-Risk", path: "/health-dashboard/organizersAtRisk" }, 
       { name: "Anomalous Activities", path: "/health-dashboard/anomalies" },   
    ]
  },
  {
    name: "Hackathon Requests",
    icon: <FileText size={20} strokeWidth={2} />,
    path: "/hackathon-requests"
  },
  {
    name: "User Management",
    icon: <Users size={20} strokeWidth={2} />,
    path: "/users"
  },
  {
    name: "Plans",
    icon: <Package size={20} strokeWidth={2} />,
    path: "/plans"
  },
  {
    name: "Subscriptions",
    icon: <CreditCard size={20} strokeWidth={2} />,
    path: "/subscriptions"
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered} = useSidebar();
  const pathname = usePathname();





  const renderMenuItems = (
    navItems: NavItem[],
    menuType: "main"
  ) => (
    <ul className="flex flex-col gap-1 px-3">
      {navItems.map((nav, index) => {
        const isSubmenuOpen = openSubmenu?.type === menuType && openSubmenu?.index === index;
        const hasActiveSubItem = nav.subItems?.some((sub) => isActive(sub.path));

        return (
          <li key={nav.name}>
            {nav.subItems ? (
              <button
                onClick={() => handleSubmenuToggle(index, menuType)}
                className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm
                  transition-all duration-150 cursor-pointer
                  ${isSubmenuOpen || hasActiveSubItem
                    ? "bg-[#FFBD12] text-[#18191F] border-2 border-[#18191F] "
                    : "text-gray-600 dark:text-gray-400 hover:bg-[#FFBD12]/20 hover:text-[#18191F] dark:hover:text-white border-2 border-transparent"
                  }
                  ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"}`}
              >
                <span className={`shrink-0 ${isSubmenuOpen || hasActiveSubItem ? "text-[#18191F]" : "text-gray-500 dark:text-gray-400 group-hover:text-[#18191F] dark:group-hover:text-white"}`}>
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <>
                    <span className="flex-1 text-left">{nav.name}</span>
                    <ChevronDownIcon
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isSubmenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </>
                )}
              </button>
            ) : (
              nav.path && (
                <Link
                  href={nav.path}
                  className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm
                    transition-all duration-150
                    ${isActive(nav.path)
                      ? "bg-[#FFBD12] text-[#18191F] border-2 border-[#18191F] "
                      : "text-gray-600 dark:text-gray-400 hover:bg-[#FFBD12]/20 hover:text-[#18191F] dark:hover:text-white border-2 border-transparent"
                    }
                    ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"}`}
                >
                  <span className={`shrink-0 ${isActive(nav.path) ? "text-[#18191F]" : "text-gray-500 dark:text-gray-400 group-hover:text-[#18191F] dark:group-hover:text-white"}`}>
                    {nav.icon}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className="flex-1">{nav.name}</span>
                  )}
                </Link>
              )
            )}

            {/* Submenu */}
            {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
              <div
                ref={(el) => {
                  subMenuRefs.current[`${menuType}-${index}`] = el;
                }}
                className="overflow-hidden transition-all duration-300 ease-out"
                style={{
                  height: isSubmenuOpen ? `${subMenuHeight[`${menuType}-${index}`]}px` : "0px",
                  opacity: isSubmenuOpen ? 1 : 0,
                }}
              >
                <ul className="mt-2 ml-4 pl-4 space-y-1 border-l-2 border-[#18191F]/20 dark:border-gray-600">
                  {nav.subItems.map((subItem) => (
                    <li key={subItem.name}>
                      <Link
                        href={subItem.path}
                        className={`group flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium
                          transition-all duration-150
                          ${isActive(subItem.path)
                            ? "text-[#18191F] dark:text-white bg-[#FFBD12]/30"
                            : "text-gray-600 dark:text-gray-400 hover:text-[#18191F] dark:hover:text-white hover:bg-[#FFBD12]/10"
                          }`}
                      >
                        {isActive(subItem.path) && (
                          <span className="w-1.5 h-1.5 rounded-sm bg-[#FFBD12] border border-[#18191F]" />
                        )}
                        <span className="flex-1">{subItem.name}</span>
                        {subItem.new && (
                          <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md border border-[#18191F]
                            ${isActive(subItem.path)
                              ? "bg-[#18191F] text-white"
                              : "bg-[#FFBD12] text-[#18191F]"
                            }`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md border border-[#18191F]
                            ${isActive(subItem.path)
                              ? "bg-[#18191F] text-white"
                              : "bg-[#FF4B1E] text-white"
                            }`}
                          >
                            pro
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" ;
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // const isActive = (path: string) => path === pathname;
   const isActive = useCallback((path: string) => path === pathname, [pathname]);

  useEffect(() => {
    // Check if the current path matches any submenu item
    let submenuMatched = false;
   ["main"].forEach((menuType) => {
    const items = navItems;

      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" ,
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    // If no submenu item matches, close the open submenu
    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [pathname,isActive]);

  useEffect(() => {
    // Set the height of the submenu items when the submenu is opened
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  return (
    <aside
      className={`fixed top-0 left-0 flex flex-col h-screen z-50
        bg-[#FFFBEA] dark:bg-gray-900
        border-r-2 border-[#18191F] dark:border-gray-700
        transition-all duration-300 ease-in-out
        ${isExpanded || isMobileOpen || isHovered ? "w-[280px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
    >
      {/* Logo Section */}
      <div
        className={`py-4 px-4 flex items-center border-b-2 border-[#18191F] dark:border-gray-700 ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link href="/" className="flex items-center gap-3 group">
          {isExpanded || isHovered || isMobileOpen ? (
            <div className="relative dark:text-[#FEC601]">
              <Image
                src="/images/logo/logo-4hacks.svg"
                alt="4Hacks Icon"
                width={40}
                height={40}
                priority
                className="block h-10 w-auto"
             />
            </div>
          ) : (
            <div className="relative dark:text-[#FEC601]">
             <Image
                src="/images/logo/logo-4hacks.svg"
                alt="4Hacks Icon"
                width={40}
                height={40}
                priority
                className="block h-10 w-auto"
             />
            </div>
          )}
        </Link>
      </div>

      {/* Navigation Section */}
      <div className="flex flex-col flex-1 overflow-y-auto custom-scrollbar py-4">
        <nav className="flex-1">
          <div className="flex flex-col gap-2">
            <div>
              <h2
                className={`mb-2 px-4 text-[11px] uppercase flex leading-5 text-[#18191F]/50 dark:text-gray-500 font-bold tracking-widest ${
                  !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? "Menu" : <HorizontaLDots />}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
