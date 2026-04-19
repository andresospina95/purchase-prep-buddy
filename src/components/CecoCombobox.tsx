import { useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { CentroCosto } from "@/lib/types";

interface Props {
  value: string;
  onChange: (codigo: string) => void;
  cecos: CentroCosto[];
  minChars?: number;
}

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function CecoCombobox({ value, onChange, cecos, minChars = 3 }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = useMemo(
    () => cecos.find((c) => c.codigo === value),
    [cecos, value],
  );

  const results = useMemo(() => {
    if (query.length < minChars) return [];
    const q = normalize(query);
    return cecos
      .filter(
        (c) =>
          normalize(c.codigo).includes(q) || normalize(c.denominacion).includes(q),
      )
      .slice(0, 50);
  }, [cecos, query, minChars]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          <span className="truncate">
            {selected ? `${selected.codigo} — ${selected.denominacion}` : "Selecciona"}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={`Escribe al menos ${minChars} letras…`}
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {query.length < minChars ? (
              <div className="px-3 py-6 text-center text-xs text-muted-foreground">
                Escribe al menos {minChars} letras para buscar
              </div>
            ) : results.length === 0 ? (
              <CommandEmpty>Sin resultados</CommandEmpty>
            ) : (
              <CommandGroup>
                {results.map((c) => (
                  <CommandItem
                    key={c.codigo}
                    value={c.codigo}
                    onSelect={() => {
                      onChange(c.codigo);
                      setOpen(false);
                      setQuery("");
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === c.codigo ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <span className="truncate">
                      {c.codigo} — {c.denominacion}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
