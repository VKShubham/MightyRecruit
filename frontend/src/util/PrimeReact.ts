// Custom filter function for multi-select
export const multiSelectFilterFn = (row: any, columnId: string, filterValue: string[]) => {
    if (!filterValue || !filterValue.length) return true;
    const value = row.getValue(columnId);
    
    // For array values (if your data has array values)
    if (Array.isArray(value)) {
      return value.some(v => filterValue.includes(v));
    }
    
    // For single values
    return filterValue.includes(value);
  };