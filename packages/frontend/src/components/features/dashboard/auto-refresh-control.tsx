"use client"

import { Play, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface AutoRefreshControlProps {
  isPaused: boolean;
  progress: number;
  onToggle: () => void;
  interval?: number; // em segundos
}

export function AutoRefreshControl({ 
  isPaused, 
  progress, 
  onToggle, 
  interval = 5 
}: AutoRefreshControlProps) {
  const remainingTime = Math.ceil(((100 - progress) / 100) * interval);

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <Progress 
          value={progress} 
          className="w-20 h-2" 
        />
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {isPaused ? 'Pausado' : `${remainingTime}s`}
        </span>
      </div>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="h-8 w-8 p-0"
            >
              {isPaused ? (
                <Play className="h-4 w-4" />
              ) : (
                <Pause className="h-4 w-4" />
              )}
              <span className="sr-only">
                {isPaused ? 'Retomar atualização automática' : 'Pausar atualização automática'}
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {isPaused 
                ? 'Retomar atualização automática' 
                : 'Pausar atualização automática'
              }
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
