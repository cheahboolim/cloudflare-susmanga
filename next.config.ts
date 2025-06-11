/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  output: 'standalone',
  images: {
    domains: [
      'i1.nhentai.net',
      'i2.nhentai.net',
      'i3.nhentai.net',
      'i4.nhentai.net',
      'i5.nhentai.net',
      'i6.nhentai.net',
      'i7.nhentai.net',
      'i8.nhentai.net',
      'i9.nhentai.net',
      'cdn.susmanga.com',
      'nhentai.net',
    ],
  },
};

export default nextConfig;
