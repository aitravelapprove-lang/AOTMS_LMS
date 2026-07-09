import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { ChevronDown, Search } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

const countries = [
  { code: "+91", country: "in", flag: "🇮🇳", name: "India" },
  { code: "+1", country: "us", flag: "🇺🇸", name: "United States" },
  { code: "+44", country: "gb", flag: "🇬🇧", name: "United Kingdom" },
  { code: "+971", country: "ae", flag: "🇦🇪", name: "UAE" },
  { code: "+966", country: "sa", flag: "🇸🇦", name: "Saudi Arabia" },
  { code: "+65", country: "sg", flag: "🇸🇬", name: "Singapore" },
  { code: "+61", country: "au", flag: "🇦🇺", name: "Australia" },
  { code: "+49", country: "de", flag: "🇩🇪", name: "Germany" },
  { code: "+33", country: "fr", flag: "🇫🇷", name: "France" },
  { code: "+81", country: "jp", flag: "🇯🇵", name: "Japan" },
  { code: "+86", country: "cn", flag: "🇨🇳", name: "China" },
  { code: "+82", country: "kr", flag: "🇰🇷", name: "South Korea" },
  { code: "+55", country: "br", flag: "🇧🇷", name: "Brazil" },
  { code: "+52", country: "mx", flag: "🇲🇽", name: "Mexico" },
  { code: "+27", country: "za", flag: "🇿🇦", name: "South Africa" },
  { code: "+7", country: "ru", flag: "🇷🇺", name: "Russia" },
  { code: "+39", country: "it", flag: "🇮🇹", name: "Italy" },
  { code: "+34", country: "es", flag: "🇪🇸", name: "Spain" },
  { code: "+31", country: "nl", flag: "🇳🇱", name: "Netherlands" },
  { code: "+46", country: "se", flag: "🇸🇪", name: "Sweden" },
  { code: "+41", country: "ch", flag: "🇨🇭", name: "Switzerland" },
  { code: "+48", country: "pl", flag: "🇵🇱", name: "Poland" },
  { code: "+90", country: "tr", flag: "🇹🇷", name: "Turkey" },
  { code: "+62", country: "id", flag: "🇮🇩", name: "Indonesia" },
  { code: "+60", country: "my", flag: "🇲🇾", name: "Malaysia" },
  { code: "+63", country: "ph", flag: "🇵🇭", name: "Philippines" },
  { code: "+66", country: "th", flag: "🇹🇭", name: "Thailand" },
  { code: "+84", country: "vn", flag: "🇻🇳", name: "Vietnam" },
  { code: "+92", country: "pk", flag: "🇵🇰", name: "Pakistan" },
  { code: "+880", country: "bd", flag: "🇧🇩", name: "Bangladesh" },
  { code: "+94", country: "lk", flag: "🇱🇰", name: "Sri Lanka" },
  { code: "+977", country: "np", flag: "🇳🇵", name: "Nepal" },
  { code: "+20", country: "eg", flag: "🇪🇬", name: "Egypt" },
  { code: "+234", country: "ng", flag: "🇳🇬", name: "Nigeria" },
  { code: "+254", country: "ke", flag: "🇰🇪", name: "Kenya" },
];

interface PhoneInputProps {
  value?: string;
  countryCode?: string;
  onValueChange?: (phone: string) => void;
  onCountryChange?: (code: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value, countryCode = "+91", onValueChange, onCountryChange, placeholder = "9876543210", className, disabled }, ref) => {
    const [open, setOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState("");
    
    const selectedCountry = countries.find(c => c.code === countryCode) || countries[0];

    const filteredCountries = countries.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.code.includes(searchQuery)
    );

    return (
      <div className={cn("flex gap-2 w-full", className)}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={disabled}
              className="flex items-center justify-between gap-2 h-12 px-3 rounded-xl border-0 bg-muted/30 hover:bg-muted/50 transition-all min-w-[120px] text-sm group"
            >
              <div className="flex items-center gap-2">
                <img 
                  src={`https://flagcdn.com/w40/${selectedCountry.country.toLowerCase()}.png`} 
                  alt={selectedCountry.name}
                  className="w-5 h-3.5 object-cover rounded-sm shadow-sm"
                />
                <span className="text-foreground font-bold">{selectedCountry.code}</span>
              </div>
              <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200", open && "rotate-180")} />
            </button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-[300px] p-0 bg-background border border-border shadow-2xl z-[100] rounded-2xl overflow-hidden" 
            align="start"
            side="bottom"
            sideOffset={8}
          >
            <div className="p-3 border-b border-border bg-muted/10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search country or code..."
                  className="w-full pl-9 pr-4 py-2 bg-muted/30 border-0 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <ScrollArea className="h-[320px]">
              <div className="p-1 space-y-0.5">
                {filteredCountries.map((country) => (
                  <button
                    key={country.country}
                    type="button"
                    onClick={() => {
                      onCountryChange?.(country.code);
                      setOpen(false);
                      setSearchQuery("");
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left hover:bg-primary/5 transition-all group",
                      countryCode === country.code && "bg-primary/10"
                    )}
                  >
                    <img 
                      src={`https://flagcdn.com/w40/${country.country.toLowerCase()}.png`} 
                      alt={country.name}
                      className="w-6 h-4 object-cover rounded-sm shadow-sm grayscale-[0.2] group-hover:grayscale-0 transition-all"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-semibold text-foreground block truncate">{country.name}</span>
                    </div>
                    <span className="text-xs font-bold text-primary bg-primary/5 px-2 py-1 rounded-md">{country.code}</span>
                  </button>
                ))}
                {filteredCountries.length === 0 && (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No countries found
                  </div>
                )}
              </div>
            </ScrollArea>
          </PopoverContent>
        </Popover>
        <div className="flex-1 relative">
          <Input
            ref={ref}
            type="tel"
            value={value}
            onChange={(e) => onValueChange?.(e.target.value.replace(/\D/g, ''))}
            placeholder={placeholder}
            className="h-12 bg-muted/30 text-foreground border-0 rounded-xl focus:ring-2 focus:ring-primary/30 focus:bg-background transition-all placeholder:text-muted-foreground/50 font-medium"
            disabled={disabled}
            maxLength={10}
          />
          {value && value.length < 10 && (
            <div className="absolute -bottom-5 left-0 text-[10px] font-bold text-orange-500 animate-pulse">
              Min 10 digits required ({value.length}/10)
            </div>
          )}
        </div>
      </div>
    );
  }
);

PhoneInput.displayName = "PhoneInput";

export { PhoneInput, countries };
