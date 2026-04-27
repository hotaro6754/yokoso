export const getFileBaseUrl = () => {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  return apiBaseUrl.replace(/\/api\/?$/, "");
};

export const getFileUrl = (url, fallback = "") => {
  if (!url) return fallback;
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  if (url.startsWith("/uploads/")) {
    return `${getFileBaseUrl()}${url}`;
  }
  return url;
};

export const getProfileImageUrl = (profileImage, fallback = "/images/users/user-01.png") => {
  return getFileUrl(profileImage, fallback);
};
