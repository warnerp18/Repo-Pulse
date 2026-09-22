import { Suspense } from "react";
import DashBoard from "@/app/dashboard/_components/dashboard/DashBoard";
import DashboardSkeleton from "@/app/dashboard/_components/dashboard/DashboardSkeleton";

/* DashBoard reads ?repo= with useSearchParams, which opts the tree into
   client-side rendering. The boundary has to sit above the component that
   calls the hook — not inside it — so this page stays prerenderable. */
const DashBoardPage = () => {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashBoard />
    </Suspense>
  );
};

export default DashBoardPage;
