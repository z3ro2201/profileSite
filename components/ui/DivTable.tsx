import React from "react";

export type TableDensity = "compact" | "normal" | "comfortable";
export type CellAlign = "left" | "center" | "right";

// Context for passing table props and column configuration
interface TableContextValue {
  density: TableDensity;
  striped: boolean;
  hoverable: boolean;
  bordered: boolean;
  columns: ColumnConfig[];
  registerColumn: (index: number, config: ColumnConfig) => void;
}

interface ColumnConfig {
  width?: string;
  align?: CellAlign;
}

interface TbodyContextValue {
  isStriped: boolean;
}

const TableContext = React.createContext<TableContextValue | null>(null);
const TbodyContext = React.createContext<TbodyContextValue | null>(null);
const ColumnIndexContext = React.createContext<number>(0);

// Table
interface TableProps extends React.HTMLAttributes<HTMLDivElement> {
  density?: TableDensity;
  striped?: boolean;
  hoverable?: boolean;
  bordered?: boolean;
}

const TableComponent: React.FC<TableProps> = ({ density = "normal", striped = false, hoverable = true, bordered = true, className = "", children, ...props }) => {
  const [columns, setColumns] = React.useState<ColumnConfig[]>([]);
  const columnsRef = React.useRef<ColumnConfig[]>([]);

  const registerColumn = React.useCallback((index: number, config: ColumnConfig) => {
    // Check if column config actually changed to prevent unnecessary updates
    const currentConfig = columnsRef.current[index];
    if (currentConfig?.width === config.width && currentConfig?.align === config.align) {
      return;
    }

    columnsRef.current[index] = config;

    setColumns((prev) => {
      const newColumns = [...prev];
      newColumns[index] = config;
      return newColumns;
    });
  }, []);

  const contextValue: TableContextValue = React.useMemo(
    () => ({
      density,
      striped,
      hoverable,
      bordered,
      columns,
      registerColumn,
    }),
    [density, striped, hoverable, bordered, columns, registerColumn]
  );

  return (
    <TableContext.Provider value={contextValue}>
      <div className={`overflow-x-auto ${className}`} {...props}>
        <div className="min-w-[640px]">{children}</div>
      </div>
    </TableContext.Provider>
  );
};

// Thead
interface TheadProps extends React.HTMLAttributes<HTMLDivElement> {}

const Thead: React.FC<TheadProps> = ({ className = "", children, ...props }) => {
  return (
    <div className={`bg-gray-50 ${className}`} {...props}>
      {children}
    </div>
  );
};

// Tbody
interface TbodyProps extends React.HTMLAttributes<HTMLDivElement> {}

const TbodyComponent: React.FC<TbodyProps> = ({ className = "", children, ...props }) => {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
};

// Tr with column index tracking
interface TrProps extends React.HTMLAttributes<HTMLDivElement> {
  isHeader?: boolean;
}

const Tr: React.FC<TrProps> = ({ isHeader = false, className = "", children, ...props }) => {
  const table = React.useContext(TableContext);
  const tbody = React.useContext(TbodyContext);

  const baseClass = "flex";
  const borderClass = table?.bordered ? "border-b border-gray-200" : "";
  const hoverClass = !isHeader && table?.hoverable ? "hover:bg-gray-100 transition-colors cursor-pointer" : "";
  const stripedClass = !isHeader && table?.striped && tbody?.isStriped ? "bg-gray-50" : "";

  // Wrap children with column index context
  const childrenWithIndex = React.Children.map(children, (child, index) => {
    return <ColumnIndexContext.Provider value={index}>{child}</ColumnIndexContext.Provider>;
  });

  return (
    <div className={`${baseClass} ${borderClass} ${hoverClass} ${stripedClass} ${className}`} {...props}>
      {childrenWithIndex}
    </div>
  );
};

// Th - registers column configuration
interface ThProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string;
  align?: CellAlign;
}

const Th: React.FC<ThProps> = ({ width, align = "left", className = "", children, ...props }) => {
  const table = React.useContext(TableContext);
  const columnIndex = React.useContext(ColumnIndexContext);
  const configRef = React.useRef({ width, align });

  // Update ref when props change
  React.useEffect(() => {
    configRef.current = { width, align };
  }, [width, align]);

  // Register column configuration on mount and when config changes
  React.useEffect(() => {
    if (table) {
      table.registerColumn(columnIndex, configRef.current);
    }
  }, [table, columnIndex]); // Only depend on table and columnIndex, not width/align

  const densityStyles: Record<TableDensity, string> = {
    compact: "px-4 py-2",
    normal: "px-6 py-4",
    comfortable: "px-6 py-5",
  };

  const alignStyles = {
    left: "text-left justify-start",
    center: "text-center justify-center",
    right: "text-right justify-end",
  };

  const padding = densityStyles[table?.density || "normal"];
  const alignment = alignStyles[align];

  return (
    <div className={`${padding} ${alignment} text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center ${className}`} style={{ width: width || "auto", flex: width ? "none" : 1 }} {...props}>
      {children}
    </div>
  );
};

// Td - inherits configuration from Th
interface TdProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string;
  align?: CellAlign;
}

const Td: React.FC<TdProps> = ({ width: propWidth, align: propAlign, className = "", children, ...props }) => {
  const table = React.useContext(TableContext);
  const columnIndex = React.useContext(ColumnIndexContext);

  // Get column config from Th, or use props as fallback
  const columnConfig = table?.columns[columnIndex];
  const width = propWidth || columnConfig?.width;
  const align = propAlign || columnConfig?.align || "left";

  const densityStyles: Record<TableDensity, string> = {
    compact: "px-4 py-2",
    normal: "px-6 py-4",
    comfortable: "px-6 py-5",
  };

  const alignStyles = {
    left: "text-left justify-start",
    center: "text-center justify-center",
    right: "text-right justify-end",
  };

  const padding = densityStyles[table?.density || "normal"];
  const alignment = alignStyles[align];

  return (
    <div className={`${padding} ${alignment} text-sm flex items-center ${className}`} style={{ width: width || "auto", flex: width ? "none" : 1 }} {...props}>
      {children}
    </div>
  );
};

// Enhanced Tbody with row striping logic
const TbodyWithContext: React.FC<TbodyProps> = ({ children, ...props }) => {
  const table = React.useContext(TableContext);

  // Add striping logic to children
  const childrenWithStriping = React.Children.map(children, (child, index) => {
    if (React.isValidElement(child) && child.type === Tr) {
      const isStriped = !!(table?.striped && index % 2 === 1);
      return <TbodyContext.Provider value={{ isStriped }}>{child}</TbodyContext.Provider>;
    }
    return child;
  });

  return <TbodyComponent {...props}>{childrenWithStriping}</TbodyComponent>;
};

// Export as T namespace
export const T = {
  Table: TableComponent,
  Thead,
  Tbody: TbodyWithContext,
  Tr,
  Th,
  Td,
};
