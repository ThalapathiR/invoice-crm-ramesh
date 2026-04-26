import * as React from "react";
import { format, subDays, startOfMonth, endOfMonth, subMonths, isSameDay, differenceInDays } from "date-fns";
import { 
  Calendar as CalendarIcon, 
  ChevronRight, 
  Clock, 
  Zap, 
  History, 
  CalendarDays,
  X,
  Check,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";

interface DateRangePickerProps {
  className?: string;
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
}

export function DateRangePicker({
  className,
  date,
  setDate,
}: DateRangePickerProps) {
  const [tempDate, setTempDate] = React.useState<DateRange | undefined>(date);
  const [isOpen, setIsOpen] = React.useState(false);
  const isMobile = useIsMobile();

  React.useEffect(() => {
    if (isOpen) setTempDate(date);
  }, [isOpen, date]);

  const presets = [
    { label: "Today", icon: Zap, value: { from: new Date(), to: new Date() } },
    { label: "Yesterday", icon: History, value: { from: subDays(new Date(), 1), to: subDays(new Date(), 1) } },
    { label: "Last 7 Days", icon: CalendarDays, value: { from: subDays(new Date(), 6), to: new Date() } },
    { label: "Last 30 Days", icon: Clock, value: { from: subDays(new Date(), 29), to: new Date() } },
    { label: "This Month", icon: CalendarIcon, value: { from: startOfMonth(new Date()), to: endOfMonth(new Date()) } },
    { label: "Last Month", icon: History, value: { from: startOfMonth(subMonths(new Date(), 1)), to: endOfMonth(subMonths(new Date(), 1)) } },
  ];

  const handleApply = () => {
    setDate(tempDate);
    setIsOpen(false);
  };

  const handleClear = () => {
    setTempDate(undefined);
    setDate(undefined);
    setIsOpen(false);
  };

  const handlePresetClick = (presetRange: DateRange) => {
    setTempDate(presetRange);
    setDate(presetRange);
    setIsOpen(false);
  };

  const selectedDays = React.useMemo(() => {
    if (!tempDate?.from || !tempDate?.to) return 0;
    return differenceInDays(tempDate.to, tempDate.from) + 1;
  }, [tempDate]);

  const PickerContent = (
    <div className="flex flex-col outline-none w-full md:w-fit max-w-[100vw]">
      {/* Premium Header - Radical Density Factor */}
      <div className="bg-white/95 dark:bg-zinc-950/90 p-3 md:pt-3 md:pb-2 border-b border-border/10 backdrop-blur-2xl">
        <div className="flex items-center justify-between mb-1.5 md:mb-1.5">
          <h2 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 flex items-center gap-2 px-1">
            <Sparkles className="h-2.5 w-2.5 text-primary" />
            Selection Insight
          </h2>
          {selectedDays > 0 && (
            <div className="range-insight-badge flex items-center gap-1.5 glow-selection-primary scale-[0.85] md:scale-90 origin-right">
              <Clock className="h-2.5 w-2.5" />
              {selectedDays} {selectedDays === 1 ? 'Day' : 'Days'}
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between gap-1.5 md:gap-2">
          {/* Start-Date Pod: Hard-coded height for Radical Slimming */}
          <div className="flex-1 h-12 md:h-14 relative p-2 md:px-4 rounded-lg md:rounded-xl bg-primary/5 border border-primary/10 transition-colors hover:bg-primary/10 flex items-end">
             <p className="absolute top-1 md:top-1.5 left-2 md:left-4 text-[7px] md:text-[8px] font-black uppercase text-primary/50 tracking-widest">Start</p>
             <p className="text-[11px] md:text-sm font-black text-slate-900 dark:text-white truncate pb-0.5">
               {tempDate?.from ? format(tempDate.from, "MMM dd, yyyy") : "—"}
             </p>
          </div>
          
          <div className="shrink-0 h-6 w-6 md:h-7 md:w-7 rounded-full bg-slate-100 dark:bg-zinc-900/50 flex items-center justify-center border border-border/50">
            <ArrowRight className="h-2.5 w-2.5 text-muted-foreground/40" />
          </div>

          {/* End-Date Pod: Hard-coded height for Radical Slimming */}
          <div className="flex-1 h-12 md:h-14 relative p-2 md:px-4 rounded-lg md:rounded-xl bg-primary/5 border border-primary/10 transition-colors hover:bg-primary/10 text-right flex flex-col justify-end">
             <p className="absolute top-1 md:top-1.5 right-2 md:right-4 text-[7px] md:text-[8px] font-black uppercase text-primary/50 tracking-widest">End</p>
             <p className="text-[11px] md:text-sm font-black text-slate-900 dark:text-white truncate pb-0.5">
               {tempDate?.to ? format(tempDate.to, "MMM dd, yyyy") : "—"}
             </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row overflow-hidden bg-white/20 dark:bg-black/20">
        {/* Elite Sidebar - Super Condensed for Professional Depth */}
        <div className="w-full md:w-40 border-b md:border-b-0 md:border-r border-border/5 p-1.5 md:p-2 bg-white/40 dark:bg-zinc-950/40">
          <div className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible scrollbar-none pb-1 md:pb-0">
            {presets.map((preset) => {
              const Icon = preset.icon;
              const isSelected = tempDate?.from && isSameDay(tempDate.from, preset.value.from) && 
                               tempDate?.to && isSameDay(tempDate.to, preset.value.to);
              
              return (
                <Button
                  key={preset.label}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "whitespace-nowrap md:whitespace-normal flex-none justify-start text-[9.5px] md:text-[10px] font-black uppercase tracking-tight h-7 md:h-8 px-2.5 rounded-md transition-all gap-2.5 group relative border border-transparent",
                    isSelected
                      ? "bg-primary text-white shadow-md shadow-primary/20 hover:bg-primary/95 border-primary/30"
                      : "hover:bg-primary/5 hover:text-primary text-muted-foreground/60 hover:border-primary/5"
                  )}
                  onClick={() => handlePresetClick(preset.value)}
                >
                  <div className={cn(
                    "h-4 w-4 rounded flex items-center justify-center transition-colors shrink-0",
                    isSelected ? "bg-white/20" : "bg-primary/10 group-hover:bg-primary/20"
                  )}>
                    <Icon className={cn("h-2.5 w-2.5", isSelected ? "text-white" : "text-primary")} />
                  </div>
                  {preset.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Calendar Grid - Pixel-Balanced Interaction Zone */}
        <div className="flex-1 overflow-x-auto p-1 md:p-4 bg-white/10 dark:bg-black/10 no-scrollbar">
          <div className="w-fit mx-auto scale-[0.88] md:scale-100 origin-top">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={tempDate?.from || new Date()}
              selected={tempDate}
              onSelect={setTempDate}
              numberOfMonths={isMobile ? 1 : 2}
              className="p-0 border-none shadow-none"
              classNames={{
                months: "flex flex-col md:flex-row gap-4 md:gap-8",
              }}
            />
          </div>
        </div>
      </div>

      {/* Radical Condensed Footer */}
      <div className="p-2.5 md:p-3 safe-bottom bg-white/80 dark:bg-zinc-950/80 border-t border-border/10 flex items-center justify-between backdrop-blur-3xl">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleClear}
          className="text-[9px] md:text-[10px] text-red-500/80 hover:text-red-400 hover:bg-red-500/5 font-black uppercase tracking-tighter rounded-full px-3"
        >
          <X className="h-2.5 w-2.5 mr-1" />
          Clear
        </Button>
        <div className="flex items-center gap-1.5">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsOpen(false)}
            className="text-[9px] md:text-[10px] font-black uppercase tracking-tighter rounded-full px-3"
          >
            Cancel
          </Button>
          <Button 
            size="sm" 
            onClick={handleApply}
            className="text-[9px] md:text-[10px] font-black uppercase tracking-widest rounded-full px-5 md:px-7 bg-primary text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:scale-[1.03] active:scale-[0.97]"
          >
            <Check className="h-3 w-3 mr-1" />
            Apply Selection
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={cn("grid gap-1", className)}>
      {isMobile ? (
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
          <DrawerTrigger asChild>
            <TriggerButton date={date} />
          </DrawerTrigger>
          <DrawerContent className="rounded-t-[16px] md:rounded-t-[20px] border-border/10 glass-card-strong outline-none">
            <div className="w-full max-h-[80vh] overflow-y-auto no-scrollbar">
              {PickerContent}
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <TriggerButton date={date} />
          </PopoverTrigger>
          <PopoverContent 
            className="w-auto p-0 rounded-[24px] md:rounded-[28px] border-border/10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)] overflow-hidden glass-card-strong animate-in fade-in zoom-in-95 duration-200 z-50 max-h-[85vh] overflow-y-auto scrollbar-premium" 
            align="end"
            sideOffset={8}
          >
            {PickerContent}
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}

const TriggerButton = React.forwardRef<
  HTMLButtonElement,
  { date: DateRange | undefined } & React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ date, ...props }, ref) => {
  return (
    <Button
      ref={ref}
      variant="outline"
      className={cn(
        "w-full lg:w-[320px] justify-start text-left font-bold glass-button rounded-full h-10 border-border/50 shadow-sm transition-all hover:ring-4 hover:ring-primary/10 hover:border-primary/30 bg-white/60 dark:bg-zinc-900/60 p-0.5 pl-4",
        !date && "text-muted-foreground"
      )}
      {...props}
    >
      <div className="bg-primary shadow-lg shadow-primary/30 rounded-full h-7 w-7 flex items-center justify-center mr-3 animate-pulse-slow shrink-0">
        <CalendarIcon className="h-3.5 w-3.5 text-white" />
      </div>
      <span className="truncate text-[11px] font-bold tracking-tight">
        {date?.from ? (
          date.to ? (
            <>
              {format(date.from, "MMM dd")} - {format(date.to, "MMM dd, yyyy")}
            </>
          ) : (
            format(date.from, "MMM dd, yyyy")
          )
        ) : (
          "Select Conversation Range"
        )}
      </span>
      <ChevronRight className="ml-auto mr-3 h-3.5 w-3.5 opacity-20 shrink-0" />
    </Button>
  );
});
TriggerButton.displayName = "TriggerButton";
