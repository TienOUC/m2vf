import React from 'react';

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface PaginatorProps {
  pagination: Pagination;
  goToPage: (page: number) => void;
  goToNextPage: () => void;
  goToPrevPage: () => void;
  setPageSize: (pageSize: number) => void;
}

const Paginator: React.FC<PaginatorProps> = ({ 
  pagination, 
  goToPage, 
  goToNextPage, 
  goToPrevPage, 
  setPageSize 
}) => {
  const maxVisiblePages = 5; // 最多显示5个页面按钮（包括开头、结尾和省略号）
  
  const renderPageButtons = () => {
    const buttons = [];
    
    if (pagination.totalPages <= maxVisiblePages) {
      // 如果总页数不超过最大显示数，显示所有页码
      for (let i = 1; i <= pagination.totalPages; i++) {
        buttons.push(
          <button
            key={i}
            onClick={() => goToPage(i)}
            className={`w-8 h-8 text-sm rounded ${pagination.page === i ? 'bg-blue-600 text-white border border-blue-600' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
          >
            {i}
          </button>
        );
      }
    } else {
      // 如果总页数超过最大显示数，显示省略号
      buttons.push(
        <button
          key={1}
          onClick={() => goToPage(1)}
          className={`w-8 h-8 text-sm rounded ${pagination.page === 1 ? 'bg-blue-600 text-white border border-blue-600' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
        >
          {1}
        </button>
      );
      
      if (pagination.page > 3) {
        buttons.push(
          <span key="ellipsis-start" className="w-8 h-8 flex items-center justify-center text-sm text-gray-500">...</span>
        );
      }
      
      // 显示当前页及其前后各一页
      const startPage = Math.max(2, pagination.page - 1);
      const endPage = Math.min(pagination.totalPages - 1, pagination.page + 1);
      
      for (let i = startPage; i <= endPage; i++) {
        if (i !== 1 && i !== pagination.totalPages) {
          buttons.push(
            <button
              key={i}
              onClick={() => goToPage(i)}
              className={`w-8 h-8 text-sm rounded ${pagination.page === i ? 'bg-blue-600 text-white border border-blue-600' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
            >
              {i}
            </button>
          );
        }
      }
      
      if (pagination.page < pagination.totalPages - 2) {
        buttons.push(
          <span key="ellipsis-end" className="w-8 h-8 flex items-center justify-center text-sm text-gray-500">...</span>
        );
      }
      
      if (pagination.totalPages > 1) {
        buttons.push(
          <button
            key={pagination.totalPages}
            onClick={() => goToPage(pagination.totalPages)}
            className={`w-8 h-8 text-sm rounded ${pagination.page === pagination.totalPages ? 'bg-blue-600 text-white border border-blue-600' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
          >
            {pagination.totalPages}
          </button>
        );
      }
    }
    
    return buttons;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 flex justify-center">
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-700 mr-4">
          共 {pagination.total} 条
        </span>
        
        <button
          onClick={goToPrevPage}
          disabled={pagination.page === 1}
          className={`flex items-center justify-center w-8 h-8 p-1 rounded ${pagination.page === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div className="flex flex-wrap justify-center gap-1">
          {renderPageButtons()}
        </div>
        
        <button
          onClick={goToNextPage}
          disabled={pagination.page === pagination.totalPages}
          className={`flex items-center justify-center w-8 h-8 p-1 rounded ${pagination.page === pagination.totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        
        <div className="flex items-center ml-4">
          <span className="text-sm text-gray-700 mr-2">每页</span>
          <select
            value={pagination.pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="border border-gray-300 rounded text-sm px-2 py-1 h-8 bg-white text-gray-700 focus:ring-0 focus:outline-none"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
          </select>
          <span className="text-sm text-gray-700 ml-2">条</span>
        </div>
      </div>
    </div>
  );
};

export default Paginator;