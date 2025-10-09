import dynamic from "next/dynamic";

const TenantManagementClient = dynamic(
  () => import("./TenantManagementClient"),
  { ssr: false }
);

export default function TenantManagementPage() {
  return <TenantManagementClient />;
}

