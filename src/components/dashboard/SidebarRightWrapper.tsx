"use client";

import dynamic from "next/dynamic";

const SidebarRight = dynamic(
  () =>
    import("@/components/sidebar-right").then((mod) => ({
      default: mod.SidebarRight,
    })),
  { ssr: false },
);

export default function SidebarRightWrapper() {
  return <SidebarRight />;
}
