import { useEffect } from 'react'
import type { PageMeta, StructuredData } from '../config/pageMeta'
import { siteConfig } from '../config/site'

const buildAbsoluteUrl = (path?: string) => {
  if (!path) return siteConfig.url
  return path.startsWith('http') ? path : `${siteConfig.url}${path.startsWith('/') ? path : `/${path}`}`
}

const buildImageUrl = (image?: string) => {
  if (!image) return buildAbsoluteUrl(siteConfig.metadata.ogImage)
  return image.startsWith('http') ? image : buildAbsoluteUrl(image)
}

const setMetaTag = (attr: 'name' | 'property', key: string, value: string) => {
  if (typeof document === 'undefined') return null
  let meta = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute(attr, key)
    document.head.appendChild(meta)
  }
  meta.setAttribute('content', value)
  return meta
}

const setLinkTag = (rel: string, href: string) => {
  if (typeof document === 'undefined') return null
  let link = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', rel)
    document.head.appendChild(link)
  }
  link.setAttribute('href', href)
  return link
}

interface SeoProps extends PageMeta {
  path?: string
  structuredData?: StructuredData
}

export const Seo = ({ title, description, keywords, image, path, structuredData }: SeoProps) => {
  const pageTitle = title || siteConfig.metadata.defaultTitle
  const pageDescription = description || siteConfig.metadata.defaultDescription
  const canonical = buildAbsoluteUrl(path)
  const imageUrl = buildImageUrl(image)
  const keywordsContent = (keywords && keywords.length > 0 ? keywords : siteConfig.metadata.keywords).join(', ')
  const jsonLdArray = Array.isArray(structuredData) ? structuredData : structuredData ? [structuredData] : []
  const structuredJson = JSON.stringify(jsonLdArray)

  useEffect(() => {
    if (typeof document === 'undefined') return

    document.title = pageTitle
    setLinkTag('canonical', canonical)

    setMetaTag('name', 'description', pageDescription)
    setMetaTag('name', 'keywords', keywordsContent)
    setMetaTag('property', 'og:title', pageTitle)
    setMetaTag('property', 'og:description', pageDescription)
    setMetaTag('property', 'og:type', 'website')
    setMetaTag('property', 'og:url', canonical)
    setMetaTag('property', 'og:image', imageUrl)
    setMetaTag('property', 'og:site_name', siteConfig.name)
    setMetaTag('name', 'twitter:card', 'summary_large_image')
    setMetaTag('name', 'twitter:title', pageTitle)
    setMetaTag('name', 'twitter:description', pageDescription)
    setMetaTag('name', 'twitter:image', imageUrl)

    const scripts: HTMLScriptElement[] = []
    const structuredEntries = JSON.parse(structuredJson) as typeof jsonLdArray

    if (structuredEntries.length > 0) {
      structuredEntries.forEach((entry) => {
        const script = document.createElement('script')
        script.type = 'application/ld+json'
        script.text = JSON.stringify(entry)
        document.head.appendChild(script)
        scripts.push(script)
      })
    }

    return () => {
      scripts.forEach((script) => script.remove())
    }
  }, [canonical, imageUrl, keywordsContent, pageDescription, pageTitle, structuredJson])

  return null
}

export default Seo

