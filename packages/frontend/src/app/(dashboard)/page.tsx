"use client"

import { AppSidebar } from "@/components/features/dashboard/app-sidebar"
import { ChartAreaInteractive } from "@/components/features/dashboard/chart-area-interactive"
import { ConversationsTable } from "@/components/features/dashboard/conversations-table"
import { SectionCards } from "@/components/features/dashboard/section-cards"
import { SiteHeader } from "@/components/features/dashboard/site-header"
import { AutoRefreshControl } from "@/components/features/dashboard/auto-refresh-control"
import { useDashboardAutoRefresh } from "@/hooks/use-dashboard-auto-refresh"
import { Badge } from "@/components/ui/badge"

export default function Page() {
  const { isPaused, progress, togglePause } = useDashboardAutoRefresh();

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        {/* Controle Global de Atualização Automática */}
        <div className="px-4 lg:px-6 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold">Dashboard</h1>
              <Badge variant="outline" className="text-xs">
                Atualização automática
              </Badge>
            </div>
            <AutoRefreshControl
              isPaused={isPaused}
              progress={progress}
              onToggle={togglePause}
              interval={5}
            />
          </div>
        </div>

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