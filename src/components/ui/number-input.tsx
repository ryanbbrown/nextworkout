
import * as React from "react"
import { ChevronUp, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface NumberInputProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  className?: string
  disabled?: boolean
  step?: number
}

const NumberInput = React.forwardRef<HTMLDivElement, NumberInputProps>(
  ({ value, onChange, min = 0, max = Infinity, className, disabled = false, step = 1, ...props }, ref) => {
    const handleIncrement = () => {
      if (value < max && !disabled) {
        onChange(value + step)
      }
    }

    const handleDecrement = () => {
      if (value > min && !disabled) {
        onChange(value - step)
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center h-10 rounded-md border border-input bg-background text-center",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        {...props}
      >
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || value <= min}
          className={cn(
            "h-full px-2 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-50",
            value <= min && "opacity-30"
          )}
          aria-label="Decrease"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
        
        <div className="flex-1 h-full flex items-center justify-center font-medium text-sm">
          {value}
        </div>
        
        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled || value >= max}
          className={cn(
            "h-full px-2 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-50",
            value >= max && "opacity-30"
          )}
          aria-label="Increase"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
      </div>
    )
  }
)

NumberInput.displayName = "NumberInput"

export { NumberInput }
