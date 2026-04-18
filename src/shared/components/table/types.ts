export interface ColumnDef<T> {
  id: string;
  header?: React.ReactNode | (() => React.ReactNode);
  accessorKey?: keyof T;
  cell?: (ctx: { row: { original: T; index: number } }) => React.ReactNode;
  enableSorting?: boolean;
  enableHiding?: boolean;
  className?: string;
  headerClassName?: string;
}

export interface SortState {
  column: string;
  direction: 'asc' | 'desc';
}

export interface RowSelectionState {
  [rowId: string]: boolean;
}
