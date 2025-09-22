"use client"

import { useQuery } from '@tanstack/react-query';
import { IconTrendingDown, IconTrendingUp, IconMessageCircle, IconMessages, IconClock } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { api } from "@/lib/api"

async function fetchDashboardMetrics() {
  return api('/dashboard/metrics');
}

export function SectionCards() {
  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: fetchDashboardMetrics,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="@container/card">
            <CardHeader>
              <div className="flex items-center justify-center h-20">
                <Spinner />
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
        <Card className="@container/card col-span-full">
          <CardHeader>
            <CardDescription>Erro ao carregar métricas</CardDescription>
            <CardTitle className="text-sm text-destructive">
              Não foi possível carregar os dados do dashboard
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const formatTrend = (trend: number) => {
    const isPositive = trend >= 0;
    const Icon = isPositive ? IconTrendingUp : IconTrendingDown;
    const sign = isPositive ? '+' : '';
    return { Icon, sign, trend: Math.abs(trend) };
  };

  const conversationsTrend = formatTrend(metrics?.conversationsTrend || 0);
  const messagesTrend = formatTrend(metrics?.messagesTrend || 0);

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total de Conversas</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {metrics?.totalConversations?.toLocaleString() || 0}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <conversationsTrend.Icon />
              {conversationsTrend.sign}{conversationsTrend.trend}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {conversationsTrend.trend > 0 ? 'Crescimento este período' : 'Redução este período'} 
            <conversationsTrend.Icon className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Conversas iniciadas no sistema
          </div>
        </CardFooter>
      </Card>
      
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Mensagens Hoje</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {metrics?.messagesToday?.toLocaleString() || 0}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <messagesTrend.Icon />
              {messagesTrend.sign}{messagesTrend.trend}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {messagesTrend.trend > 0 ? 'Aumento nas mensagens' : 'Redução nas mensagens'} 
            <messagesTrend.Icon className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Mensagens enviadas hoje
          </div>
        </CardFooter>
      </Card>
      
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Tempo Médio de Resposta</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {metrics?.averageResponseTime || 0}min
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconClock />
              {metrics?.responseTimeTrend || 0}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Tempo médio de resposta <IconClock className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Entre mensagem do cliente e resposta do operador
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
