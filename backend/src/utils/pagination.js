export function createCursorPagination(items, limit, cursorField = 'createdAt') {
  const hasMore = items.length > limit;
  const data = hasMore ? items.slice(0, -1) : items;
  
  const nextCursor = hasMore && data.length > 0 
    ? data[data.length - 1][cursorField]?.toString() 
    : null;

  return {
    data,
    pagination: {
      hasMore,
      nextCursor,
      limit,
    },
  };
}

export function createPagePagination(total, page, limit) {
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return {
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext,
      hasPrev,
    },
  };
}