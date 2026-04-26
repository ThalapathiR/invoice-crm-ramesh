import re

file_path = 'c:/Users/Admin/Desktop/saas/saas/saas-sharyx/frontend/src/components/Tools/ToolBuilderForm.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the wrapper wrapper
content = content.replace(
    '<div className="px-8 border-b border-border bg-background sticky top-0 z-30 shrink-0">',
    '<div className="px-8 py-3 border-b border-white/5 bg-background/80 backdrop-blur-2xl sticky top-0 z-30 shrink-0 shadow-sm shadow-black/5">'
)

# Replace the TabsList
content = content.replace(
    '<TabsList className="bg-transparent border-none h-14 p-0 justify-start gap-8">',
    '<TabsList className="flex gap-2 overflow-x-auto hide-scrollbar bg-transparent border-none h-auto p-0 justify-start w-full items-center">'
)

# Base class replacement
base_old = 'data-[state=active]:bg-transparent data-[state=active]:text-primary border-b-2 border-transparent data-[state=active]:border-primary rounded-none h-full px-0 hover:text-primary transition-all font-semibold'

base_new = 'rounded-full px-4 py-1.5 h-8 text-xs font-bold tracking-wide data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=active]:shadow-primary/25 bg-muted/20 text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all whitespace-nowrap'

green_old = base_old + ' text-emerald-500'
green_new = 'rounded-full px-4 py-1.5 h-8 text-xs font-bold tracking-wide data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-emerald-500/25 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 hover:text-emerald-700 transition-all whitespace-nowrap'
content = content.replace(green_old, green_new)

yellow_old = base_old + ' text-yellow-500'
yellow_new = 'rounded-full px-4 py-1.5 h-8 text-xs font-bold tracking-wide data-[state=active]:bg-yellow-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-yellow-500/25 bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 hover:text-yellow-700 transition-all whitespace-nowrap'
content = content.replace(yellow_old, yellow_new)

# Standard ones
content = content.replace(base_old, base_new)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
