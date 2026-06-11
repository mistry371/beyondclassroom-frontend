import { SITE_URL } from '@/lib/seo'

export default function sitemap() {
  const grades = [1, 2, 3, 4, 5, 6, 7, 8]
  const staticRoutes = [
    '',
    '/about',
    '/team',
    '/packages',
    '/courses',
    '/tools',
    '/live',
    '/blogs',
    '/contact',
    '/promoter',
    '/auth/login',
    '/auth/register',
  ]

  return [
    ...staticRoutes.map((path) => ({
      url: `${SITE_URL}${path}`,
      lastModified: new Date(),
      changeFrequency: path === '' ? 'daily' : 'weekly',
      priority: path === '' ? 1 : path.includes('/learn/') ? 0.9 : 0.7,
    })),
    ...grades.map((g) => ({
      url: `${SITE_URL}/grades/grade-${g}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.85,
    })),
  ]
}
