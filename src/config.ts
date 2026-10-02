const defaultApiBaseUrl = "https://practice.expandtesting.com/notes/api";

function getApiBaseUrl(): URL {
  const configuredUrl = process.env.API_BASE_URL ?? defaultApiBaseUrl;
  const normalizedUrl = configuredUrl.endsWith("/")
    ? configuredUrl
    : `${configuredUrl}/`;

  try {
    return new URL(normalizedUrl);
  } catch (error) {
    throw new Error(`API_BASE_URL must be a valid URL: ${configuredUrl}`, {
      cause: error,
    });
  }
}

export const apiBaseUrl = getApiBaseUrl();
