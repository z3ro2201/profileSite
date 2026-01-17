import React from "react";

export type TableDensity = "compact" | "normal" | "comfortable";
export type CellAlign = "left" | "center" | "right";

export interface TableColumn<T = any> {
  key: string;
  label: string;
  width?: string;
  align?: CellAlign;
}

export interface TableProps<T = any> extends React.TableHTMLAttributes<HTMLTableElement> {
  columns: TableColumn<T>[];
  data: T[];
  renderCell?: (value: any, row: T, column: TableColumn<T>) => React.ReactNode;
  caption?: string;
  striped?: boolean;
  hoverable?: boolean;
  bordered?: boolean;
  density?: TableDensity;
  emptyMessage?: string;
  className?: string;
}

/**
 * Table Component
 * 접근성과 반응형을 고려한 테이블 컴포넌트
 */
export function Table<T extends { id?: string | number }>({ columns = [], data = [], renderCell, caption, striped = false, hoverable = true, bordered = true, density = "normal", emptyMessage = "데이터가 없습니다.", className = "", ...props }: TableProps<T>) {
  const densityStyles: Record<TableDensity, string> = {
    compact: "px-4 py-2",
    normal: "px-6 py-4",
    comfortable: "px-6 py-5",
  };

  const cellPadding = densityStyles[density];

  const getAlignClass = (align?: CellAlign): string => {
    if (align === "center") return "text-center";
    if (align === "right") return "text-right";
    return "text-left";
  };

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full min-w-[640px]" role="table" {...props}>
        {caption && <caption className="sr-only">{caption}</caption>}

        <thead>
          <tr className={bordered ? "border-b border-gray-200" : ""}>
            {columns.map((column, idx) => (
              <th key={column.key || idx} scope="col" className={`${cellPadding} ${getAlignClass(column.align)} text-xs font-semibold text-gray-500 uppercase tracking-wider`} style={{ width: column.width }}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className={bordered ? "divide-y divide-gray-200" : ""}>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className={`${cellPadding} text-center text-sm text-gray-500`}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr
                key={row.id || rowIdx}
                className={`
                  ${striped && rowIdx % 2 === 1 ? "bg-gray-50" : ""}
                  ${hoverable ? "hover:bg-gray-50 transition-colors" : ""}
                `}
              >
                {columns.map((column, colIdx) => {
                  const value = (row as any)[column.key];
                  const content = renderCell ? renderCell(value, row, column) : value;

                  return (
                    <td key={`${rowIdx}-${column.key || colIdx}`} className={`${cellPadding} text-sm ${getAlignClass(column.align)}`}>
                      {content}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export interface TableContainerProps extends React.HTMLAttributes<HTMLElement> {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * TableContainer - 테이블을 감싸는 카드 컨테이너
 */
export function TableContainer({ title, description, actions, children, className = "" }: TableContainerProps) {
  return (
    <section className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${className}`} aria-labelledby={title ? "table-heading" : undefined}>
      {(title || description || actions) && (
        <div className="px-4 sm:px-6 py-5 border-b border-gray-200 flex items-center justify-between">
          <div>
            {title && (
              <h2 id="table-heading" className="text-base font-semibold text-gray-800">
                {title}
              </h2>
            )}
            {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

/**
 * TableCell - 커스텀 셀 컴포넌트들
 */

interface TextCellProps {
  primary: React.ReactNode;
  secondary?: React.ReactNode;
  className?: string;
}

interface UserCellProps {
  avatar: React.ReactNode;
  name: string;
  email?: string;
  className?: string;
}

interface DateCellProps {
  date: string;
  format?: string;
  className?: string;
}

export type ProgressColor = "blue" | "green" | "red" | "yellow";

interface ProgressCellProps {
  value: number;
  max?: number;
  color?: ProgressColor;
  showLabel?: boolean;
  className?: string;
}

interface ActionsCellProps {
  children: React.ReactNode;
  className?: string;
}

export const TableCell = {
  /**
   * 텍스트 셀 (기본)
   */
  Text: ({ primary, secondary, className = "" }: TextCellProps) => (
    <div className={className}>
      <div className="text-sm font-medium text-gray-800">{primary}</div>
      {secondary && <div className="text-xs text-gray-500">{secondary}</div>}
    </div>
  ),

  /**
   * 아바타 + 텍스트 셀
   */
  User: ({ avatar, name, email, className = "" }: UserCellProps) => (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="size-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-lg" role="img" aria-label={`${name} 아바타`}>
        {avatar}
      </div>
      <div>
        <div className="text-sm font-semibold text-gray-800">{name}</div>
        {email && <div className="text-xs text-gray-500">{email}</div>}
      </div>
    </div>
  ),

  /**
   * 날짜 셀
   */
  Date: ({ date, format, className = "" }: DateCellProps) => (
    <time className={`text-sm text-gray-600 ${className}`} dateTime={date}>
      {format || date}
    </time>
  ),

  /**
   * 진행률 바 셀
   */
  Progress: ({ value, max = 100, color = "blue", showLabel = true, className = "" }: ProgressCellProps) => {
    const colorStyles: Record<ProgressColor, string> = {
      blue: "bg-blue-500",
      green: "bg-emerald-500",
      red: "bg-red-500",
      yellow: "bg-amber-500",
    };

    const percentage = Math.round((value / max) * 100);

    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {showLabel && <span className="text-sm text-gray-600 font-medium whitespace-nowrap">{percentage}%</span>}
        <div className="flex-1 min-w-[80px] max-w-xs">
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max} aria-label={`진행률 ${percentage}%`}>
            <div className={`h-full rounded-full transition-all ${colorStyles[color]}`} style={{ width: `${percentage}%` }} />
          </div>
        </div>
      </div>
    );
  },

  /**
   * 액션 버튼 셀
   */
  Actions: ({ children, className = "" }: ActionsCellProps) => <div className={`flex items-center gap-2 ${className}`}>{children}</div>,
};
