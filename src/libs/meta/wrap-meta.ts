type CountMetaData = {
  count?: number;
  page?: number;
  limit?: number;
  pageCount?: number;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
  orderBy?: any;
};
export type CountMetaType<T> = {
  data: T;
  meta?: CountMetaData;
};

export function wrapMeta<T>(
  data: T,
  count: number,
  showDataAll: boolean,
  page?: number,
  limit?: number
): CountMetaType<T> {
  if (showDataAll) {
    return {
      data,
      meta: {
        count: count,
        page: 1,
        limit: count,
        pageCount: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      },
    };
  }
  limit = limit !== 0 ? limit : count;
  return {
    data,
    meta: {
      count: count || 0,
      page: page,
      limit: limit,
      pageCount: limit ? Math.ceil(count / limit) : 1,
      hasPreviousPage: page ? page > 1 : false,
      hasNextPage: page && limit ? page < Math.ceil(count / limit) : false,
    },
  };
}
