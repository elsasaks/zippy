import { useStore } from '@/store/useStore'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getValidCodesForDate } from '@/lib/validation'
import { Star } from 'lucide-react'

interface POLCodePickerProps {
  value?: string
  onChange: (code: string) => void
  entryDate: string
  disabled?: boolean
}

export function POLCodePicker({
  value,
  onChange,
  entryDate,
  disabled,
}: POLCodePickerProps) {
  const { polCodes } = useStore()

  const validCodes = getValidCodesForDate(polCodes, entryDate)
  const favorites = validCodes.filter((c) => c.favorite)
  const others = validCodes.filter((c) => !c.favorite)

  if (validCodes.length === 0) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="No valid codes for this date" />
        </SelectTrigger>
      </Select>
    )
  }

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder="Select POL code" />
      </SelectTrigger>
      <SelectContent>
        {favorites.length > 0 && (
          <SelectGroup>
            <SelectLabel className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              Favorites
            </SelectLabel>
            {favorites.map((code) => (
              <SelectItem key={code.code} value={code.code}>
                <div className="flex flex-col">
                  <span>{code.code}</span>
                  <span className="text-xs text-muted-foreground truncate max-w-[250px]">
                    {code.description}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        )}
        {others.length > 0 && (
          <SelectGroup>
            <SelectLabel>Other Codes</SelectLabel>
            {others.map((code) => (
              <SelectItem key={code.code} value={code.code}>
                <div className="flex flex-col">
                  <span>{code.code}</span>
                  <span className="text-xs text-muted-foreground truncate max-w-[250px]">
                    {code.description}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        )}
      </SelectContent>
    </Select>
  )
}
