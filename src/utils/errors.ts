export function getErrorMessage(error: unknown, fallback = 'Đã có lỗi xảy ra. Vui lòng thử lại.'): string {
  if (typeof error === 'object' && error !== null) {
    const maybeAxiosError = error as { response?: { data?: { message?: string | string[] } }; message?: string };
    const responseMessage = maybeAxiosError.response?.data?.message;

    if (Array.isArray(responseMessage)) {
      return responseMessage.join('\n');
    }

    if (typeof responseMessage === 'string' && responseMessage.trim()) {
      return responseMessage;
    }

    if (typeof maybeAxiosError.message === 'string' && maybeAxiosError.message.trim()) {
      return maybeAxiosError.message;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}
