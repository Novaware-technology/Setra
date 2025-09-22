import { AppSidebar } from "@/components/features/dashboard/app-sidebar"
import { ChartAreaInteractive } from "@/components/features/dashboard/chart-area-interactive"
import { ConversationsTable } from "@/components/features/dashboard/conversations-table"
import { SectionCards } from "@/components/features/dashboard/section-cards"
import { SiteHeader } from "@/components/features/dashboard/site-header"

export default function Page() {
  return (
    <div className="flex flex-1 flex-col">
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <SectionCards />
        <div className="px-4 lg:px-6">
          <ChartAreaInteractive />
        </div>
        <ConversationsTable />
      </div>
    </div>
  </div>
  )
}