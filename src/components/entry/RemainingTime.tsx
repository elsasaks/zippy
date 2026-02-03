import type { Split } from '@/types'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  formatMinutes,
  calculateRemainingMinutes,
  getAllocationPercentage,
  isFullyAllocated,
} from '@/lib/calculations'

interface RemainingTimeProps {
  totalMinutes: number
  splits: Split[]
  showProgress?: boolean
}

export function RemainingTime({
  totalMinutes,
  splits,
  showProgress = true,
}: RemainingTimeProps) {
  const remaining = calculateRemainingMinutes(totalMinutes, splits)
  const percentage = getAllocationPercentage(totalMinutes, splits)
  const fullyAllocated = isFullyAllocated(totalMinutes, splits)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {fullyAllocated ? 'Fully allocated' : `Remaining: ${formatMinutes(remaining)}`}
        </span>
        {fullyAllocated ? (
          <Badge variant="success">Complete</Badge>
        ) : (
          <Badge variant="outline">
            {formatMinutes(remaining)} / {formatMinutes(totalMinutes)}
          </Badge>
        )}
      </div>
      {showProgress && (
        <Progress value={percentage} className="h-2" />
      )}
    </div>
  )
}
