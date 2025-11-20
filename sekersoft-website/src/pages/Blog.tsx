import { motion } from 'framer-motion'
import { Calendar, Clock, ArrowRight, Search } from 'lucide-react'
import { screenshotPaths } from '../data/screenshots'

const Blog = () => {
  const posts = [
    {
      title: 'Lojistik Sektöründe Dijital Dönüşüm',
      excerpt: 'Modern lojistik şirketleri için dijital dönüşümün önemi ve başarı stratejileri.',
      category: 'Dijital Dönüşüm',
      date: '15 Ocak 2024',
      readTime: '5 dk',
      featured: true,
      image: screenshotPaths.dashboard
    },
    {
      title: 'Rota Optimizasyonu ile Maliyet Tasarrufu',
      excerpt: 'AI destekli rota optimizasyonu sayesinde yakıt maliyetlerinde %40\'a varan tasarruf.',
      category: 'Teknoloji',
      date: '12 Ocak 2024',
      readTime: '4 dk',
      featured: false,
      image: screenshotPaths.routes
    },
    {
      title: 'Müşteri Deneyimini İyileştirmenin 7 Yolu',
      excerpt: 'Lojistik sektöründe müşteri memnuniyetini artırmak için pratik öneriler.',
      category: 'Müşteri İlişkileri',
      date: '10 Ocak 2024',
      readTime: '6 dk',
      featured: false,
      image: screenshotPaths.orders
    },
    {
      title: 'Filo Yönetiminde Yapay Zeka Kullanımı',
      excerpt: 'Yapay zeka ve makine öğrenmesi ile filo yönetiminde yeni dönem.',
      category: 'Yapay Zeka',
      date: '8 Ocak 2024',
      readTime: '7 dk',
      featured: false,
      image: screenshotPaths.vehicles
    },
    {
      title: 'Sürdürülebilir Lojistik Pratikleri',
      excerpt: 'Çevre dostu lojistik uygulamaları ve karbon ayak izini azaltma stratejileri.',
      category: 'Sürdürülebilirlik',
      date: '5 Ocak 2024',
      readTime: '5 dk',
      featured: false,
      image: screenshotPaths.charts
    },
    {
      title: 'E-Ticaret Lojistiğinde Trendler',
      excerpt: '2024 yılında e-ticaret lojistiğini şekillendirecek önemli trendler.',
      category: 'E-Ticaret',
      date: '3 Ocak 2024',
      readTime: '4 dk',
      featured: false,
      image: screenshotPaths.activeVehicles
    },
  ]

  const categories = [
    'Tümü',
    'Dijital Dönüşüm',
    'Teknoloji',
    'Yapay Zeka',
    'Müşteri İlişkileri',
    'E-Ticaret',
    'Sürdürülebilirlik'
  ]

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="gradient-text">Blog</span> & Haberler
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Lojistik sektöründeki son gelişmeler, en iyi pratikler ve Sekersoft yeniliklerini keşfedin.
          </p>
        </motion.div>

        {/* Search & Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="glass rounded-2xl p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Blog yazılarında ara..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl glass border border-white/20 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
              
              {/* Category Filter */}
              <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                {categories.map((category) => (
                  <button
                    key={category}
                    className="px-4 py-2 rounded-lg glass glass-hover text-sm font-medium whitespace-nowrap transition-all hover:scale-105"
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Featured Post */}
        {posts.filter(p => p.featured).map((post, index) => (
          <motion.article
            key={post.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="glass rounded-3xl overflow-hidden mb-12 group cursor-pointer"
          >
            <div className="grid lg:grid-cols-2 gap-8 p-8">
              <div className="aspect-video rounded-2xl overflow-hidden border border-white/10 group-hover:scale-105 transition-transform duration-500">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 rounded-lg bg-blue-500/20 text-blue-400 text-sm font-medium">
                    {post.category}
                  </span>
                  <span className="text-sm text-gray-400">Öne Çıkan</span>
                </div>
                <h2 className="text-3xl font-bold mb-4 group-hover:text-blue-400 transition-colors">
                  {post.title}
                </h2>
                <p className="text-gray-400 mb-6 leading-relaxed">
                  {post.excerpt}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {post.date}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {post.readTime}
                  </div>
                </div>
                <button className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium group/btn">
                  Devamını Oku
                  <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </motion.article>
        ))}

        {/* Blog Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.filter(p => !p.featured).map((post, index) => (
            <motion.article
              key={post.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass rounded-2xl overflow-hidden group cursor-pointer glass-hover"
            >
              <div className="aspect-video overflow-hidden border-b border-white/5">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="p-6">
                <span className="inline-block px-3 py-1 rounded-lg bg-blue-500/20 text-blue-400 text-xs font-medium mb-3">
                  {post.category}
                </span>
                <h3 className="text-xl font-bold mb-3 group-hover:text-blue-400 transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {post.excerpt}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {post.date}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {post.readTime}
                  </div>
                </div>
                <button className="text-sm text-blue-400 hover:text-blue-300 font-medium group/btn flex items-center gap-1">
                  Devamını Oku
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Pagination */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex justify-center gap-2 mt-12"
        >
          <button className="px-4 py-2 rounded-lg glass glass-hover font-medium">
            Önceki
          </button>
          <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 font-medium">
            1
          </button>
          <button className="px-4 py-2 rounded-lg glass glass-hover font-medium">
            2
          </button>
          <button className="px-4 py-2 rounded-lg glass glass-hover font-medium">
            3
          </button>
          <button className="px-4 py-2 rounded-lg glass glass-hover font-medium">
            Sonraki
          </button>
        </motion.div>

        {/* Newsletter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20"
        >
          <div className="glass rounded-3xl p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Blog Güncellemelerini <span className="gradient-text">Kaçırmayın</span>
            </h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Yeni blog yazılarımızdan ve sektör haberlerinden ilk siz haberdar olun.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="E-posta adresiniz"
                className="flex-1 px-4 py-3 rounded-xl glass border border-white/20 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium shadow-lg shadow-blue-500/30 transition-all hover:shadow-blue-500/50 hover:scale-105"
              >
                Abone Ol
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Blog

