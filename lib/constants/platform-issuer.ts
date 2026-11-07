import type { Organization } from "@/types/organization";

/**
 * SaaS platform issuer details for billing invoices issued by Nexuslifeline
 * to tenant organizations. Do not use for tenant-owned documents (sales
 * invoices, financial reports, etc.).
 */
export const PLATFORM_ISSUER = {
  name: "Nexuslifeline",
  address: "Pampanga, Philippines",
  email: "admin@nexuslifeline.com",
  website: "https://nexuslifeline.com",
  phone: null,
} satisfies Pick<Organization, "name" | "address" | "email" | "website" | "phone">;
