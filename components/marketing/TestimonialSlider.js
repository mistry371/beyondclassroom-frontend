'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import Image from 'next/image'
import api from '@/utils/api'

const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (url.startsWith('/uploads/')) {
    const baseUrl = api.defaults.baseURL ? api.defaults.baseURL.replace('/api', '') : 'http://localhost:5000';
    return `${baseUrl}${url}`;
  }
  return url;
};

export default function TestimonialSlider() {
  const [testimonials, setTestimonials] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await api.get('/testimonials')
        if (res.data.success && res.data.testimonials.length > 0) {
          setTestimonials(res.data.testimonials)
        }
      } catch (error) {
        console.error("Failed to load testimonials:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchTestimonials()
  }, [])

  const slideLeft = useCallback(() => {
    setDirection(-1)
    setCurrentIndex((prev) => (prev === 0 ? Math.max(0, testimonials.length - 1) : prev - 1))
  }, [testimonials.length])

  const slideRight = useCallback(() => {
    setDirection(1)
    setCurrentIndex((prev) => (prev >= testimonials.length - 1 ? 0 : prev + 1))
  }, [testimonials.length])

  useEffect(() => {
    if (!isHovered && testimonials.length > 0) {
      const timer = setInterval(() => {
        slideRight()
      }, 5000)
      return () => clearInterval(timer)
    }
  }, [isHovered, slideRight, testimonials.length])

  const variants = {
    enter: (direction) => {
      return {
        x: direction > 0 ? 1000 : -1000,
        opacity: 0,
        scale: 0.9,
      }
    },
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction) => {
      return {
        zIndex: 0,
        x: direction < 0 ? 1000 : -1000,
        opacity: 0,
        scale: 0.9,
      }
    }
  }

  return (
    <section className="py-24 bg-gradient-to-b from-white to-slate-50 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-secondary/5 blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-primary font-bold tracking-wider uppercase text-sm mb-4 block">Student Success Stories</span>
            <h2 className="text-4xl md:text-5xl font-black text-navy mb-6">Loved by Thousands</h2>
            <p className="text-xl text-muted">See how Beyond Classroom is transforming mathematics education for students and parents across the country.</p>
          </motion.div>
        </div>

        <div 
          className="relative max-w-4xl mx-auto"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {isLoading ? (
            <div className="h-[400px] md:h-[300px] flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          ) : testimonials.length > 0 ? (
            <>
              {/* Main Slider Container */}
          <div className="relative h-[400px] md:h-[300px] w-full flex items-center justify-center perspective-1000">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                  scale: { duration: 0.2 }
                }}
                className="absolute w-full px-4 md:px-12"
              >
                {(() => {
                  const currentT = testimonials[currentIndex] || testimonials[0];
                  if (!currentT) return null;
                  return (
                    <div className="bg-white rounded-3xl p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-primary/10 relative">
                      <Quote className="absolute top-8 right-8 md:top-12 md:right-12 w-16 h-16 text-primary/10 rotate-180" />
                      
                      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left relative z-10">
                        <div className="flex-shrink-0">
                          <div className="w-24 h-24 md:w-32 md:h-32 relative rounded-full overflow-hidden border-4 border-white shadow-lg bg-slate-100 flex items-center justify-center">
                            {currentT.image ? (
                              <img 
                                src={getImageUrl(currentT.image)} 
                                alt={currentT.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-4xl text-primary/40 font-bold">{currentT.name?.charAt(0)}</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex-grow">
                          <div className="flex gap-1 mb-4 justify-center md:justify-start">
                            {[...Array(currentT.rating || 5)].map((_, i) => (
                              <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                            ))}
                          </div>
                          <p className="text-lg md:text-xl text-slate-700 italic mb-6 leading-relaxed font-medium">
                            "{currentT.content}"
                          </p>
                          <div>
                            <h4 className="text-xl font-bold text-navy">{currentT.name}</h4>
                            <p className="text-primary font-medium">{currentT.grade}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="flex justify-center items-center gap-6 mt-8">
            <button 
              onClick={slideLeft}
              className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-primary hover:border-primary/30 hover:shadow-md transition-all focus:outline-none"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <div className="flex gap-3">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setDirection(index > currentIndex ? 1 : -1)
                    setCurrentIndex(index)
                  }}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? 'bg-primary scale-125' 
                      : 'bg-slate-300 hover:bg-slate-400'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            <button 
              onClick={slideRight}
              className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-primary hover:border-primary/30 hover:shadow-md transition-all focus:outline-none"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
          </>
          ) : null}
        </div>
      </div>
    </section>
  )
}
