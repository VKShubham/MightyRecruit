const TableSkeleton = () => (
  <div className="w-full animate-pulse">
    <div className="border rounded-md dark:border-gray-700">
      {/* Header skeleton */}
      <div className="grid grid-cols-4 gap-4 p-4 border-b bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-4 bg-gray-200 dark:bg-gray-600 rounded" />
        ))}
      </div>
      
      {/* Rows skeleton */}
      {[1, 2, 3, 4, 5].map((row) => (
        <div key={row} className="grid grid-cols-4 gap-4 p-4 border-b dark:border-gray-700">
          {[1, 2, 3, 4].map((cell) => (
            <div key={cell} className="h-4 bg-gray-100 dark:bg-gray-700 rounded" />
          ))}
        </div>
      ))}
    </div>
    
    {/* Pagination skeleton */}
    <div className="flex items-center justify-between p-4 border-t dark:border-gray-700">
      <div className="h-8 w-20 bg-gray-100 dark:bg-gray-700 rounded" />
      <div className="h-4 w-32 bg-gray-100 dark:bg-gray-700 rounded" />
      <div className="h-8 w-20 bg-gray-100 dark:bg-gray-700 rounded" />
    </div>
  </div>
);

export default TableSkeleton;