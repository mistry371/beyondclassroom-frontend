'use client'

import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Video, Calendar, Clock, Users, Play, ExternalLink, Mic, MicOff, VideoOff, PhoneOff, MonitorPlay, Circle } from 'lucide-react'
import Navbar from '@/components/Navbar'
import api from '@/utils/api'
import { motion } from 'framer-motion'

export default function LiveClassesPage() {
  const { user } = useSelector(state => state.auth)
  const [allClasses, setAllClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('upcoming')
  const [activeClass, setActiveClass] = useState(null)
  const [micOn, setMicOn] = useState(false)
  const [camOn, setCamOn] = useState(false)

  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    try {
      const res = await api.get('/live-classes')
      setAllClasses(res.data.liveClasses || [])
    } catch (error) {
      setAllClasses([])
    } finally {
      setLoading(false)
    }
  }

  const liveClasses = allClasses.filter(c => c.status === 'live')
  const upcomingClasses = allClasses.filter(c => c.status === 'upcoming')
  const recordings = allClasses.filter(c => c.status === 'recorded')

  const joinClass = (cls) => {
    if (cls.zoomLink) {
      window.open(cls.zoomLink, '_blank')
    } else {
      setActiveClass(cls)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-dark flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark-100 to-dark">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-r from-primary to-secondary rounded-xl">
              <Video className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Live Classes</h1>
              <p className="text-gray-400">Interactive live sessions with expert instructors</p>
            </div>
          </div>
        </motion.div>

        {/* Live Now Banner */}
        {liveClasses.length > 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/40 rounded-2xl p-6 mb-8"
          >
            <div className="flex items-center gap-2 mb-4">
              <Circle className="h-4 w-4 text-red-400 fill-red-400 animate-pulse" />
              <span className="text-red-400 font-bold text-lg">LIVE NOW</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {liveClasses.map(cls => (
                <div key={cls._id} className="bg-dark/50 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-bold">{cls.title}</h3>
                    <p className="text-gray-400 text-sm">{cls.instructor} • {cls.enrolled || 0}/{cls.maxStudents} students</p>
                  </div>
                  <button onClick={() => joinClass(cls)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-all flex items-center gap-2"
                  >
                    <Play className="h-4 w-4" /> Join Now
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex gap-3 mb-6">
          {[
            { id: 'upcoming', label: `Upcoming (${upcomingClasses.length})` },
            { id: 'recordings', label: `Recordings (${recordings.length})` },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 rounded-lg font-medium transition-all ${activeTab === tab.id ? 'bg-gradient-to-r from-primary to-secondary text-white' : 'bg-dark-100 text-gray-400 hover:bg-dark-200'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Upcoming Classes */}
        {activeTab === 'upcoming' && (
          upcomingClasses.length === 0 ? (
            <div className="text-center py-20">
              <Calendar className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-xl">No upcoming classes scheduled</p>
              <p className="text-gray-500 text-sm mt-2">Check back soon for new sessions</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingClasses.map((cls, index) => (
                <motion.div key={cls._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
                  className="bg-gradient-to-br from-dark-100/90 to-dark/90 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-primary/20 rounded-xl"><Video className="h-6 w-6 text-primary" /></div>
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full font-medium">Upcoming</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">{cls.title}</h3>
                  <p className="text-primary text-sm mb-3">{cls.topic}</p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-400 text-sm"><Users className="h-4 w-4" />{cls.instructor}</div>
                    <div className="flex items-center gap-2 text-gray-400 text-sm"><Calendar className="h-4 w-4" />{cls.date} at {cls.time}</div>
                    <div className="flex items-center gap-2 text-gray-400 text-sm"><Clock className="h-4 w-4" />{cls.duration}</div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-gray-400" />
                      <div className="flex-1 bg-dark-200 rounded-full h-2">
                        <div className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full"
                          style={{ width: `${((cls.enrolled || 0) / cls.maxStudents) * 100}%` }} />
                      </div>
                      <span className="text-gray-400">{cls.enrolled || 0}/{cls.maxStudents}</span>
                    </div>
                  </div>
                  <button onClick={() => joinClass(cls)}
                    className="w-full px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" /> Join via Zoom
                  </button>
                </motion.div>
              ))}
            </div>
          )
        )}

        {/* Recordings */}
        {activeTab === 'recordings' && (
          recordings.length === 0 ? (
            <div className="text-center py-20">
              <MonitorPlay className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-xl">No recordings available yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recordings.map((cls, index) => (
                <motion.div key={cls._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
                  className="bg-gradient-to-br from-dark-100/90 to-dark/90 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-secondary/20 rounded-xl"><MonitorPlay className="h-6 w-6 text-secondary" /></div>
                    <span className="px-3 py-1 bg-gray-500/20 text-gray-400 text-xs rounded-full font-medium">Recorded</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">{cls.title}</h3>
                  <p className="text-secondary text-sm mb-3">{cls.topic}</p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-400 text-sm"><Users className="h-4 w-4" />{cls.instructor}</div>
                    <div className="flex items-center gap-2 text-gray-400 text-sm"><Calendar className="h-4 w-4" />{cls.date}</div>
                    <div className="flex items-center gap-2 text-gray-400 text-sm"><Clock className="h-4 w-4" />{cls.duration}</div>
                  </div>
                  <button onClick={() => setActiveClass(cls)}
                    className="w-full px-4 py-2 bg-secondary/20 text-secondary rounded-lg font-medium hover:bg-secondary/30 transition-all flex items-center justify-center gap-2"
                  >
                    <Play className="h-4 w-4" /> Watch Recording
                  </button>
                </motion.div>
              ))}
            </div>
          )
        )}

        {/* Video Player Modal */}
        {activeClass && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl">
              <div className="bg-dark-100 rounded-2xl overflow-hidden border border-white/10">
                <div className="aspect-video bg-black flex items-center justify-center relative">
                  <div className="text-center">
                    <MonitorPlay className="h-20 w-20 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">{activeClass.title}</p>
                    <p className="text-gray-500 text-sm mt-2">Recording playback</p>
                  </div>
                  <div className="absolute top-4 right-4 bg-black/60 px-3 py-1 rounded-full">
                    <span className="text-white text-sm">{activeClass.duration}</span>
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between bg-dark-200">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setMicOn(!micOn)} className={`p-3 rounded-xl transition-all ${micOn ? 'bg-primary/20 text-primary' : 'bg-red-500/20 text-red-400'}`}>
                      {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                    </button>
                    <button onClick={() => setCamOn(!camOn)} className={`p-3 rounded-xl transition-all ${camOn ? 'bg-primary/20 text-primary' : 'bg-red-500/20 text-red-400'}`}>
                      {camOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                    </button>
                  </div>
                  <div className="text-center">
                    <p className="text-white font-medium">{activeClass.title}</p>
                    <p className="text-gray-400 text-sm">{activeClass.instructor}</p>
                  </div>
                  <button onClick={() => setActiveClass(null)} className="p-3 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-all">
                    <PhoneOff className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
