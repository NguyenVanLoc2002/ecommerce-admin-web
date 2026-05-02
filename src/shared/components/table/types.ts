export interface ColumnDef<T> {
  id: string;
  header?: React.ReactNode | (() => React.ReactNode);
  accessorKey?: keyof T;
  cell?: (ctx: { row: { original: T; index: number } }) => React.ReactNode;
  enableSorting?: boolean;
  /**
   * Backend field used in `sort=field,direction` when sorting this column.
   * Defaults to `id` when unset.
   */
  sortField?: string;
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
