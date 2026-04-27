"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function PolicyRuleViewIndexRedirect() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const basePath = pathname.startsWith("/hr")
      ? "/hr"
      : pathname.startsWith("/company-admin")
        ? "/company-admin"
        : pathname.startsWith("/payroll")
          ? "/payroll"
          : pathname.split("/")[1]
            ? `/${pathname.split("/")[1]}`
            : "/company-admin";

    router.replace(`${basePath}/policy-rule`);
  }, [pathname, router]);

  return null;
}
