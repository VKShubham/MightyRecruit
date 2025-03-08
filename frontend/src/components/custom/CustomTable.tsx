import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Column, flexRender, getCoreRowModel, getExpandedRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, HeaderGroup, Row, SortingState, useReactTable } from '@tanstack/react-table';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  Filter,
  FilterX,
  Loader2,
  Plus,
  Search,
} from 'lucide-react';
import 'primereact/resources/primereact.min.css';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import { useEffect, useState } from 'react';
import { Input } from '../ui/input';
import { Separator } from '../ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import ReactSelect from './Select/react-select';

interface CustomTableProps {
  data: any;
  columns: any;
  title?: string;
  isLoading?: boolean;
  showAddButton?: boolean;
  filterConfig?: FilterConfig[];
  onAddClick?: () => void;
  renderSubComponent?: (props: { row: Row<any> }) => React.ReactElement
}

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  id: string;
  type: 'select' | 'multi-select' | 'text' | 'date-range' | 'number-range';
  label: string;
  options?: FilterOption[];
  getOptions?: (data: any[]) => FilterOption[];
  defaultValue?: string; // give if only in type select (Because other cause error)
}

const SelectFilter = ({ 
  column, 
  options,
  placeholder = "Filter..." ,
  defaultValue,
}: { 
  column: Column<any, unknown>;
  options: FilterOption[];
  placeholder?: string;
  defaultValue?: string;
}) => {
  useEffect(() => {
    if (defaultValue) {
      column.setFilterValue(defaultValue);
    }
  }, [defaultValue, column]);

  const columnFilterValue = column.getFilterValue() as string;
  return (
    <ReactSelect 
      value={options.find(option => option.value === columnFilterValue) || null}
      onChange={(obj: any) => {
        column.setFilterValue(!obj ? undefined : obj.value);
      }}
      options={options}
      className='min-w-44'
      placeholder={placeholder}
      isClearable
    />
  );
};

const MultiSelectFilter = ({ 
  column, 
  options,
  placeholder = "Filter..." 
}: { 
  column: Column<any, unknown>;
  options: FilterOption[];
  placeholder?: string;
}) => {
  const columnFilterValue = column.getFilterValue() as string[] || [];

  const selectedValues = options.filter(option => columnFilterValue.includes(option.value));

  const handleChange = (selectedOptions: any) => {
    const values = selectedOptions.map((opt: any) => opt.value);
    column.setFilterValue(values.length ? values : undefined);
  };

  return (
    <ReactSelect
      isMulti
      value={selectedValues}
      onChange={handleChange}
      options={options}
      isClearable
      className='min-w-44'
      placeholder={placeholder}
      isSearchable={true}
    />
  );
};


const TextFilter = ({ 
  column,
  placeholder = "Search...",
  className = ""
}: { 
  column: Column<any, unknown>;
  placeholder?: string;
  className?: string;
}) => {
  const columnFilterValue = column.getFilterValue() as string;
  return (
    <Input
      type="text"
      value={columnFilterValue || ""}
      onChange={(e) => column.setFilterValue(e.target.value)}
      placeholder={placeholder}
      className={`${className}`}
    />
  );
};

const CustomTable = ({
  data,
  columns,
  title = "Table",
  isLoading = false,
  showAddButton = true,
  onAddClick,
  filterConfig,
  renderSubComponent
}: CustomTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    getRowCanExpand: () => true,
    onSortingChange: setSorting,
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel()
  });

  const renderSortableHeader = (header: any) => {
    const column = header.column;
    const isSortable = column.getCanSort();

    if (!isSortable) {
      return flexRender(column.columnDef.header, header.getContext());
    }

    return (
      <div
        className="flex items-center cursor-pointer select-none group transition-colors hover:text-primary"
        onClick={column.getToggleSortingHandler()}
      >
        <span className="font-semibold text-xs md:text-sm">
          {flexRender(column.columnDef.header, header.getContext())}
        </span>
        <span className="ml-1.5 flex items-center">
          {column.getIsSorted() === 'asc' ? (
            <ArrowUp className="w-4 h-4" />
          ) : column.getIsSorted() === 'desc' ? (
            <ArrowDown className="w-4 h-4" />
          ) : (
            <ArrowUpDown className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </span>
      </div>
    );
  };

  const TableRowWithExpansion = ({ row }: { row: Row<any> }) => {
    return (
      <>
        <TableRow
          className={`
            transition-colors
            hover:bg-gray-50 dark:hover:bg-gray-900`}
        >
          {row.getVisibleCells().map((cell) => (
            <TableCell key={cell.id} className="py-3 text-xs md:text-sm">
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          ))}
        </TableRow>
        {row.getIsExpanded() && renderSubComponent && (
          <TableRow className="bg-gray-50/50 dark:bg-gray-900/50">
            <TableCell colSpan={row.getVisibleCells().length} className="p-4">
              {renderSubComponent({ row })}
            </TableCell>
          </TableRow>
        )}
      </>
    );
  };

  const renderInlineFilters = () => {
    return (
      <div className="flex items-center flex-wrap space-x-1.5 p-2 space-y-1 md:space-y-0">
        <Filter className='w-4 h-4 mx-2 md:w-5 md:h-5'/>
        <Separator orientation="vertical" className='min-h-8'/>
        <span>Filters : </span>
        {filterConfig?.map((filter) => {
          const column = table.getColumn(filter.id);
          if (!column) return null;
          
          const options = filter.options || [];
          const defaultValue = filter.defaultValue || "";
          
          return (
            <div key={filter.id} className="flex-shrink-0">          
              {filter.type === 'select' && (
                <div className="relative">
                  <SelectFilter 
                    column={column} 
                    options={options}
                     defaultValue={defaultValue}
                    placeholder={filter.label} 
                  />
                </div>
              )}

              {filter.type === 'multi-select' && (
                <MultiSelectFilter 
                  column={column} 
                  options={options} 
                  placeholder={filter.label} 
                />
              )}
              
              {filter.type === 'text' && (
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 md:w-4 md:h-4" />
                  <TextFilter 
                    column={column} 
                    placeholder={`Filter by ${filter.label.toLowerCase()}...`}
                    className="pl-9 text-sm" 
                  />
                </div>
              )}
            </div>
          );
        })}
        
        {filterConfig && filterConfig.length > 0 && (
          <Tooltip delayDuration={400}>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                onClick={() => table.resetColumnFilters()} 
                size="sm"
                className="flex items-center h-10 ml-auto hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <FilterX className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Clear Filters</TooltipContent>
          </Tooltip>
        )}
      </div>
    );
  };

  return (
    <Card className="w-full shadow-sm border-gray-200 dark:border-gray-800">
      <CardHeader className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">{title}</CardTitle>
          {showAddButton && (
            <Button 
              onClick={onAddClick}
              className="shadow-sm hover:shadow transition-shadow"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New
            </Button>
          )}
        </div>
      </CardHeader>
        {filterConfig && filterConfig?.length > 0 && renderInlineFilters()}
        <div className="border border-gray-200 dark:border-gray-800 overflow-hidden">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup: HeaderGroup<any>) => (
                <TableRow key={headerGroup.id} className="bg-gray-50/50 dark:bg-gray-900/50">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="py-3">
                      {renderSortableHeader(header)}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={table.getAllColumns().length} className="h-32">
                    <div className="flex flex-col items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin mb-2" />
                      <span className="text-sm text-gray-500">Loading data...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row: Row<any>) => (
                  <TableRowWithExpansion key={row.id} row={row} />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={table.getAllColumns().length} className="h-32">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <span className="text-sm">No data available</span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between mt-4 p-2 md:mt-6 md:p-4">
          <div className="flex items-center md:gap-3">
            <span className="text-xs text-gray-600 dark:text-gray-400 md:text-sm">Rows per page</span>
            <Select
              value={table.getState().pagination.pageSize.toString()}
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={pageSize.toString()}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-1.5">
            <Button
              variant="outline"
              size="icon"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ChevronFirst className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-xs text-gray-600 dark:text-gray-400 md:text-sm">
                 {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
              </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ChevronLast className="w-4 h-4" />
            </Button>
          </div>
        </div>
    </Card>
  );
};

export default CustomTable;