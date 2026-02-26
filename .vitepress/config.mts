import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Carlo Kind",
  description: "blog for carlo kind",
  base: "/",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Blog', link: '/dsa' }
    ],

    sidebar: [
      {
        text: 'Data Structures and Algorithms',
        items: [
          { text: 'Binary Search', link: '/dsa/binary-search' },
          { text: 'Disjoint Set Union', link: '/dsa/dsu' },
          { text: 'Heaps', link: '/dsa/heaps' },
          { text: 'Dynamic Programming', link: '/dsa/dynamic-programming' },
          { text: 'Arrays as Hashmaps', link: '/dsa/arrays-as-hashmaps' },
          { text: 'Prefix Aggregate Hashmap', link: '/dsa/prefix-aggregate-hashmap' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ckind' },
      { icon: 'linkedin', link: 'https://www.linkedin.com/in/carlo-kind-108509159/' }
    ]
  }
})
