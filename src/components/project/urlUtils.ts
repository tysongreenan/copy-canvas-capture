
// Get domain from URL
export const getDomainFromUrl = (url: string) => {
  try {
    return new URL(url).hostname;
  } catch (e) {
    return url;
  }
};

// Get path from URL for better display
export const getPathFromUrl = (url: string) => {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname || '/';
  } catch (e) {
    return url;
  }
};

// Function to check if a page is the main URL (domain root)
export const isMainUrl = (url: string) => {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname === '/' || urlObj.pathname === '';
  } catch (e) {
    return false;
  }
};
