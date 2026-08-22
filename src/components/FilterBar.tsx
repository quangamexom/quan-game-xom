import React from 'react';
import { FilterState, ViewMode, SortOption } from '../types';
import { LayoutGrid, Table, Monitor, Star, Sparkles, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

interface FilterBarProps {
  filterState: FilterState;
  onFilterChange: (newState: Partial<FilterState>) => void;
  totalResults: number;
}

const PLATFORMS = [
  { id: 'ALL', label: 'TẤT CẢ' },
  { id: 'PC', label: 'PC GAME' },
  { id: 'PS4', label: 'PS4 / PS5' },
  { id: 'PS1', label: 'PS1 GIẢ LẬP' },
  { id: 'Android', label: 'ANDROID / MOBILE' },
  { id: 'Switch', label: 'NINTENDO SWITCH' },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  filterState,
  onFilterChange,
  totalResults
}) => {
  return (
    <div className="glass-panel rounded-2xl p-4 mb-6">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        
        {/* Left Side Info / Quick Tag */}
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Tổng số game khả dụng: <strong className="text-amber-300 font-bold">{totalResults}</strong></span>
        </div>

        {/* Filters & View Switches */}
        <div className="flex items-center gap-3 flex-wrap justify-between sm:justify-end">
          
          {/* Viet Hoa Only Checkbox Pill */}
          <button
            onClick={() => onFilterChange({ vietHoaOnly: !filterState.vietHoaOnly })}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer flex items-center gap-1.5 ${
              filterState.vietHoaOnly
                ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${filterState.vietHoaOnly ? 'fill-amber-300 text-amber-300' : ''}`} />
            <span>Chỉ Việt Hóa ⭐</span>
          </button>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700 rounded-xl px-2.5 py-1 text-xs text-slate-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
            <select
              value={filterState.sortBy}
              onChange={(e) => onFilterChange({ sortBy: e.target.value as SortOption })}
              className="bg-transparent text-slate-200 text-xs font-medium focus:outline-none cursor-pointer py-1"
            >
              <option value="latest" className="bg-slate-900 text-slate-200">Mới Cập Nhật</option>
              <option value="popular" className="bg-slate-900 text-slate-200">Phổ Biến Nhất</option>
              <option value="rating" className="bg-slate-900 text-slate-200">Đánh Giá Phân Cấp</option>
              <option value="title_asc" className="bg-slate-900 text-slate-200">Tên A - Z</option>
              <option value="size" className="bg-slate-900 text-slate-200">Dung Lượng</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-950 rounded-xl p-1 border border-slate-800">
            <button
              onClick={() => onFilterChange({ viewMode: 'grid' })}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                filterState.viewMode === 'grid'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Chế độ Lưới (Grid)"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>

            <button
              onClick={() => onFilterChange({ viewMode: 'launchbox' })}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                filterState.viewMode === 'launchbox'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Chế độ LaunchBox DB Card"
            >
              <Monitor className="w-4 h-4" />
            </button>

            <button
              onClick={() => onFilterChange({ viewMode: 'table' })}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                filterState.viewMode === 'table'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Chế độ Bảng Danh Sách (Table View)"
            >
              <Table className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
        <span>Hiển thị <strong className="text-amber-400 font-mono">{totalResults}</strong> trò chơi</span>
        {filterState.searchQuery && (
          <span>Kết quả tìm kiếm cho: "<strong className="text-white">{filterState.searchQuery}</strong>"</span>
        )}
      </div>
    </div>
  );
};
