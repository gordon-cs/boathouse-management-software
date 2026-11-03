import { useMemo, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type SortValue = string | number | boolean | null | undefined;
type SortRule = {
  columnId: string;
  direction: "ascending" | "descending";
};

export type DataTableColumn<T> = {
  id: string;
  header: string;
  getValue: (row: T) => SortValue; // used for sorting, searching, and default rendering
  getSearchValue?: (row: T) => string; // used for searching, defaults to getValue if not provided
  render?: (row: T) => ReactNode; // used for custom rendering, defaults to getValue if not provided
  sortable?: boolean; // used for sorting, defaults to true if not provided
  searchable?: boolean; // used for searching, defaults to true if not provided
};

type DataTableProps<T> = {
  rows: T[];
  columns: DataTableColumn<T>[];
  getRowId: (row: T) => string | number;
  selectedRowId?: string | number;
  defaultSort?: SortRule[];
  emptyMessage: string; // message to display when there are no rows to show
  searchLabel: string; // label for the search input, used for accessibility
};

function getSearchText(value: SortValue) {
  if (value === null || value === undefined) {
    return "not recorded";
  }

  if (typeof value === "boolean") {
    return value ? "yes" : "no";
  }

  return String(value);
}

function compareValues(left: SortValue, right: SortValue) {
  if (left === null || left === undefined) {
    return right === null || right === undefined ? 0 : 1;
  }

  if (right === null || right === undefined) {
    return -1;
  }

  if (typeof left === "number" && typeof right === "number") {
    return left - right;
  }

  if (typeof left === "boolean" && typeof right === "boolean") {
    return Number(left) - Number(right);
  }

  return String(left).localeCompare(String(right), undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

function formatValue(value: SortValue) {
  if (value === null || value === undefined || value === "") {
    return "Not recorded";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return value;
}

function DataTable<T>({
  rows,
  columns,
  getRowId, // function to get the unique ID for each row
  selectedRowId, // optional ID of the currently selected row
  defaultSort,
  emptyMessage,
  searchLabel,
}: DataTableProps<T>) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortRule[]>(defaultSort ?? []);

  const visibleRows = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    const filteredRows = normalizedQuery
      ? rows.filter((row) =>
          columns.some(
            (column) =>
              column.searchable !== false &&
              (
                column.getSearchValue?.(row) ??
                getSearchText(column.getValue(row))
              )
                .toLocaleLowerCase()
                .includes(normalizedQuery),
          ),
        )
      : rows;

    if (!sort.length) {
      return filteredRows;
    }

    return [...filteredRows].sort((left, right) => {
      for (const rule of sort) {
        const column = columns.find(({ id }) => id === rule.columnId);
        if (!column) {
          continue;
        }

        const leftValue = column.getValue(left);
        const rightValue = column.getValue(right);
        const comparison = compareValues(leftValue, rightValue);

        if (comparison !== 0) {
          if (
            rule.direction === "descending" &&
            leftValue != null &&
            rightValue != null
          ) {
            return -comparison;
          }

          return comparison;
        }
      }

      return 0;
    });
  }, [columns, query, rows, sort]);

  function toggleSort(columnId: string) {
    setSort((currentSort) => {
      const currentRule = currentSort.find((rule) => rule.columnId === columnId);
      return [
        {
          columnId,
          direction:
            currentRule?.direction === "ascending"
              ? "descending"
              : "ascending",
        },
      ];
    });
  }

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="sr-only">{searchLabel}</span>
        <input
          aria-label={searchLabel}
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:max-w-sm"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search..."
          type="search"
          value={query}
        />
      </label>

      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => {
              const sortRule = sort.find((rule) => rule.columnId === column.id);

              return (
                <TableHead
                  aria-sort={
                    column.sortable === false
                      ? undefined
                      : sortRule
                        ? sortRule.direction
                        : "none"
                  }
                  key={column.id}
                >
                  {column.sortable === false ? (
                    column.header
                  ) : (
                    <Button
                      aria-label={`Sort by ${column.header}${
                        sortRule
                          ? sortRule.direction === "ascending"
                            ? ", currently ascending"
                            : ", currently descending"
                          : ""
                      }`}
                      className="-ml-2"
                      onClick={() => toggleSort(column.id)}
                      type="button"
                      variant="ghost"
                    >
                      {column.header}
                      {sortRule ? (
                        sortRule.direction === "ascending" ? (
                          <ArrowUp aria-hidden="true" />
                        ) : (
                          <ArrowDown aria-hidden="true" />
                        )
                      ) : (
                        <ArrowUpDown aria-hidden="true" />
                      )}
                    </Button>
                  )}
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {visibleRows.length ? (
            visibleRows.map((row) => {
              const isSelected =
                selectedRowId !== undefined && getRowId(row) === selectedRowId;

              return (
                <TableRow
                  data-state={isSelected ? "selected" : undefined}
                  className={
                    isSelected
                      ? "data-[state=selected]:bg-accent data-[state=selected]:text-accent-foreground data-[state=selected]:hover:bg-accent/80 [&>td]:font-medium [&>td:first-child]:border-l-4 [&>td:first-child]:border-l-primary"
                      : undefined
                  }
                  key={getRowId(row)}
                >
                  {columns.map((column) => (
                    <TableCell key={column.id}>
                      {column.render
                        ? column.render(row)
                        : formatValue(column.getValue(row))}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell
                className="py-6 text-center text-muted-foreground"
                colSpan={columns.length}
              >
                {query.trim() ? "No matching records found." : emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export default DataTable;
