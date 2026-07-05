import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Share2, Calendar, User, Tag, Check } from 'lucide-react'
import { api } from '../services/api.js'

export default function NewsDetail({ navigate, newsId }) {
  const [article, setArticle] = useState(null)
  const [related, setRelated] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let active = true
    const load = async () => {
      if (!newsId) { setError('Article introuvable.'); setIsLoading(false); return }
      try {
        setIsLoading(true)
        const res = await api.news.getById(newsId)
        if (!active) return
        if (res?.success && res.data) {
          setArticle(res.data)
          // Articles similaires (même catégorie, hors article courant)
          try {
            const all = await api.news.getAll()
            if (active && all?.success && Array.isArray(all.data)) {
              setRelated(all.data.filter(a => String(a.id) !== String(newsId) && a.categorie === res.data.categorie).slice(0, 3))
            }
          } catch { /* pas d'articles similaires */ }
          setError(null)
        } else {
          setError(res?.message || "Cet article n'est pas disponible.")
        }
      } catch {
        setError('Erreur réseau lors du chargement de l’article.')
      } finally {
        if (active) setIsLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [newsId])

  const handleShare = async () => {
    try {
      await navigator.clipboard?.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* clipboard indisponible */ }
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="animate-pulse flex flex-col gap-4">
          <div className="h-6 w-28 rounded-lg bg-bg-tertiary" />
          <div className="h-10 w-3/4 rounded-lg bg-bg-tertiary" />
          <div className="h-64 w-full rounded-2xl bg-bg-tertiary" />
        </div>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center flex flex-col items-center gap-4">
        <h1 className="text-xl font-extrabold text-text-primary">Article inaccessible</h1>
        <p className="text-sm text-text-secondary">{error}</p>
        <button onClick={() => navigate?.('news')} className="px-4 py-2 rounded-xl bg-accent-primary text-white text-xs font-bold">
          Retour aux actualités
        </button>
      </div>
    )
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto px-6 py-10 flex flex-col gap-6"
    >
      <button onClick={() => navigate?.('news')} className="flex items-center gap-2 text-xs font-bold text-text-secondary hover:text-text-primary transition-colors self-start">
        <ArrowLeft className="w-4 h-4" /> Retour aux actualités
      </button>

      <header className="flex flex-col gap-4">
        <div className="flex items-center gap-2 flex-wrap text-[10px] font-black uppercase tracking-wider">
          {article.categorie && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent-primary/12 border border-accent-primary/25 text-accent-primary">
              <Tag className="w-3 h-3" /> {article.categorie}
            </span>
          )}
          {article.status && article.status !== 'APPROVED' && (
            <span className="px-2.5 py-1 rounded-full bg-amber-500/12 border border-amber-500/25 text-amber-500">{article.status}</span>
          )}
        </div>
        <h1 className="text-2xl md:text-4xl font-extrabold text-text-primary tracking-tight leading-tight">{article.title}</h1>
        <div className="flex items-center gap-4 text-xs text-text-muted">
          {article.author && <span className="inline-flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {article.author}</span>}
          {article.date && <span className="inline-flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {article.date}</span>}
          <button onClick={handleShare} className="ml-auto inline-flex items-center gap-1.5 text-accent-primary hover:underline">
            {copied ? <><Check className="w-3.5 h-3.5" /> Lien copié</> : <><Share2 className="w-3.5 h-3.5" /> Partager</>}
          </button>
        </div>
      </header>

      <div className="glass-panel rounded-3xl p-6 md:p-8">
        <div className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
          {article.content || article.excerpt || 'Contenu indisponible.'}
        </div>
      </div>

      {related.length > 0 && (
        <section className="flex flex-col gap-3 mt-4">
          <h2 className="text-base font-extrabold text-text-primary tracking-tight">Articles similaires</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {related.map(r => (
              <button
                key={r.id}
                onClick={() => navigate?.('news-detail', { newsId: r.id })}
                className="text-left p-4 rounded-2xl glass-panel hover:-translate-y-0.5 transition-all"
              >
                {r.categorie && <span className="text-[9px] font-black uppercase tracking-wider text-accent-primary">{r.categorie}</span>}
                <p className="text-xs font-bold text-text-primary line-clamp-3 mt-1">{r.title}</p>
              </button>
            ))}
          </div>
        </section>
      )}
    </motion.article>
  )
}
