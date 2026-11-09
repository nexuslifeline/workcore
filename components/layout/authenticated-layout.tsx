"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { LayoutProvider } from "@/context/layout-provider";
import { SearchProvider } from "@/context/search-provider";
import { OrganizationProvider } from "@/context/organization-provider";
import { PageLayout } from "@/components/layout/page-layout";
import { NoRolePermissionsBanner } from "@/components/layout/no-role-permissions-notice";
import { PageSuspense } from "@/components/common/page-suspense";

type AuthenticatedLayoutProps = {
  children: ReactNode;
  /** RSC subtree (e.g. SidebarNavGroups) rendered on the server, passed through this shell. */
  sidebarNav: ReactNode;
};

const DOCUMENT_WORKSPACE_NEW_PATHS = [
  "/estimates/new",
  "/sales-orders/new",
  "/invoices/new",
  "/recurring-invoices/new",
  "/purchase-orders/new",
  "/requisitions/new",
  "/purchase-invoices/new",
  "/payments/new",
  "/supplier-payments/new",
] as const;

function matchesPathPrefix(pathname: string | null, path: string) {
  if (!pathname) return false;
  return pathname === path || pathname.startsWith(`${path}/`);
}

export function AuthenticatedLayout({ children, sidebarNav }: AuthenticatedLayoutProps) {
  const pathname = usePathname();

  const pagesWithoutMainHeader = [
    "/",
    "/settings",
    ...DOCUMENT_WORKSPACE_NEW_PATHS,
    "/tax-calendar",
  ];

  const matchesPath = pagesWithoutMainHeader.some((path) => matchesPathPrefix(pathname, path));

  const isEstimateEditPage = pathname?.match(/^\/estimates\/[^/]+\/edit$/);
  const isSalesOrderEditPage = pathname?.match(/^\/sales-orders\/[^/]+\/edit$/);
  const isInvoiceEditPage = pathname?.match(/^\/invoices\/[^/]+\/edit$/);
  const isRecurringInvoiceEditPage = pathname?.match(/^\/recurring-invoices\/[^/]+\/edit$/);
  const isPurchaseOrderEditPage = pathname?.match(/^\/purchase-orders\/[^/]+\/edit$/);
  const isRequisitionEditPage = pathname?.match(/^\/requisitions\/[^/]+\/edit$/);
  const isPurchaseInvoiceEditPage = pathname?.match(/^\/purchase-invoices\/[^/]+\/edit$/);
  const isPaymentEditPage = pathname?.match(/^\/payments\/[^/]+\/edit$/);
  const isSupplierPaymentEditPage = pathname?.match(/^\/supplier-payments\/[^/]+\/edit$/);
  const isProjectEditPage = pathname?.match(/^\/projects\/[^/]+\/edit$/);
  const isBankReconciliationWorkspacePage = pathname?.match(/^\/accounting\/bank-reconciliation\/[^/]+$/);
  const isGeneralLedgerPage =
    pathname?.startsWith("/accounting/general-ledger") || pathname?.startsWith("/reports/general-ledger");
  const isReportDetailPage = pathname?.startsWith("/reports/");
  const isTaxCalendarPage = matchesPathPrefix(pathname, "/tax-calendar");
  const isDocumentWorkspaceNewPage = DOCUMENT_WORKSPACE_NEW_PATHS.some((path) =>
    matchesPathPrefix(pathname, path),
  );

  // Keep the shared app Header (with SidebarTrigger) for GL and reports so
  // sidebar collapse/open works the same on mobile and desktop.
  const skipHeaderMain =
    matchesPath ||
    !!isEstimateEditPage ||
    !!isSalesOrderEditPage ||
    !!isInvoiceEditPage ||
    !!isRecurringInvoiceEditPage ||
    !!isPurchaseOrderEditPage ||
    !!isRequisitionEditPage ||
    !!isPurchaseInvoiceEditPage ||
    !!isPaymentEditPage ||
    !!isSupplierPaymentEditPage ||
    !!isProjectEditPage ||
    !!isBankReconciliationWorkspacePage;

  // Viewport lock is only for full-bleed workspaces that manage their own scroll.
  // Custom-header pages like dashboard (`/`) and settings must keep document scroll
  // (settings already locks via <Main fixed> → has-data-[layout=fixed]).
  // GL/reports lock via <Main fixed> instead of skipHeaderMain.
  const lockViewport =
    isDocumentWorkspaceNewPage ||
    isTaxCalendarPage ||
    !!isEstimateEditPage ||
    !!isSalesOrderEditPage ||
    !!isInvoiceEditPage ||
    !!isRecurringInvoiceEditPage ||
    !!isPurchaseOrderEditPage ||
    !!isRequisitionEditPage ||
    !!isPurchaseInvoiceEditPage ||
    !!isPaymentEditPage ||
    !!isSupplierPaymentEditPage ||
    !!isProjectEditPage ||
    !!isBankReconciliationWorkspacePage;

  const useFixedMain = isGeneralLedgerPage || isReportDetailPage;

  return (
    <OrganizationProvider>
      <SearchProvider>
        <LayoutProvider>
          <PageLayout
            skipHeaderMain={skipHeaderMain}
            lockViewport={lockViewport}
            mainFluid={useFixedMain}
            mainFixed={useFixedMain}
            mainXPaddingDisabled={isGeneralLedgerPage}
            sidebarNav={sidebarNav}
          >
            <NoRolePermissionsBanner />
            <PageSuspense>{children}</PageSuspense>
          </PageLayout>
        </LayoutProvider>
      </SearchProvider>
    </OrganizationProvider>
  );
}
