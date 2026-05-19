import type { SoftDeleteQueryParams } from '@/shared/types/api.types';
import { cleanParams } from '@/shared/utils/cleanParams';
import { buildSortParam, parseSortParam } from '@/shared/utils/sort';
import { toSoftDeleteQuery } from '@/shared/utils/softDelete';
import {
  PRODUCT_KEYWORD_SORT_FIELDS,
  type ProductListParams,
} from '../types/product.types';

export const DEFAULT_PRODUCT_SORT = 'createdAt,desc';

export type ProductListRequestParams = Omit<ProductListParams, 'deletedState'> &
  SoftDeleteQueryParams;

const PRODUCT_KEYWORD_SORT_FIELD_SET = new Set<string>(PRODUCT_KEYWORD_SORT_FIELDS);

export interface ResolvedProductListQuery {
  request: ProductListRequestParams;
  keyword?: string;
  isKeywordSearch: boolean;
  sort: string;
}

export function normalizeProductKeyword(keyword: string | undefined): string | undefined {
  const trimmed = keyword?.trim();
  return trimmed ? trimmed : undefined;
}

export function sanitizeProductSortForKeywordSearch(
  sort: string | undefined,
  keyword: string | undefined,
): string {
  const normalizedSort = normalizeSort(sort);
  if (!keyword) {
    return normalizedSort;
  }

  const parsedSort = parseSortParam(normalizedSort);
  if (!parsedSort || !PRODUCT_KEYWORD_SORT_FIELD_SET.has(parsedSort.column)) {
    return DEFAULT_PRODUCT_SORT;
  }

  return buildSortParam(parsedSort);
}

export function resolveProductListQuery(
  params: ProductListParams,
  keywordOverride = params.keyword,
): ResolvedProductListQuery {
  const { deletedState, ...requestBase } = params;
  const keyword = normalizeProductKeyword(keywordOverride);
  const sort = sanitizeProductSortForKeywordSearch(params.sort, keyword);

  return {
    request: cleanParams({
      ...requestBase,
      keyword,
      sort,
      ...toSoftDeleteQuery(deletedState),
    }) as ProductListRequestParams,
    keyword,
    isKeywordSearch: keyword !== undefined,
    sort,
  };
}

function normalizeSort(sort: string | undefined): string {
  const parsedSort = parseSortParam(sort);
  return parsedSort ? buildSortParam(parsedSort) : DEFAULT_PRODUCT_SORT;
}
