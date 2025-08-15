export function success(data = null, message = 'Success') {
  return {
    success: true,
    message,
    data,
  };
}

export function error(message = 'Error', code = 'GENERIC_ERROR') {
  return {
    success: false,
    message,
    code,
  };
}

export function paginated(data, pagination) {
  return {
    success: true,
    data,
    pagination,
  };
}