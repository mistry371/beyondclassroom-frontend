'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSelector } from 'react-redux'
import { showError } from '@/components/ui/Toast'
import { ArrowLeft, Users, TrendingUp, Award } from 'lucide-react'
import api from '@/utils/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export default function ExamAnalytics() {
  const router = useRouter()
  const params = useParams()
  const { user } = useSelector(s => s.auth)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/exams/admin/' + params.examId + '/analytics')
      .then(r => setData(r.data.analytics))
      .catch(e => { console.error(e); showError('Failed to load analytics'); })
      .finally(() => setLoading(false))
  }, [user])

  if (loading) return <div className="min-h-screen bg-academic flex items-center justify-center">
        <div className="w-full max-w-4xl p-6 space-y-6 animate-pulse">
          <div className="h-10 bg-primary/10 rounded w-1/4"></div>
          <div className="h-32 bg-primary/5 rounded-2xl w-full"></div>
          <div className="space-y-3">
            <div className="h-12 bg-primary/5 rounded-xl w-full"></div>
            <div className="h-12 bg-primary/5 rounded-xl w-full"></div>
            <div className="h-12 bg-primary/5 rounded-xl w-full"></div>
          </div>
        </div>
</div>

  const COLORS = ['#ef4444','#f97316','#eab308','#22c55e','#6366f1']

  return (
    <div className="min-h-screen bg-academic">
      <div className="bg-white border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center gap-4">
          <button onClick={() => router.push('/admin/exams')} className="p-2 hover:bg-dark-200 rounded-lg"><ArrowLeft className="h-5 w-5 text-muted"/></button>
          <h1 className="text-2xl font-bold text-navy">Exam Analytics</h1>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {!data || data.totalAttempts === 0 ? (
          <div className="text-center py-20 bg-dark-100/50 rounded-2xl border border-white/10">
            <Users className="h-16 w-16 text-gray-600 mx-auto mb-4"/>
            <p className="text-muted text-xl">No attempts yet</p>
            <p className="text-muted mt-2">Analytics will appear once students start taking this exam</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Attempts', value: data.totalAttempts, color: 'from-primary to-secondary' },
                { label: 'Avg Score', value: data.avgScore + '%', color: 'from-secondary to-accent' },
                { label: 'Pass Rate', value: data.passRate + '%', color: 'from-green-500 to-emerald-500' },
                { label: 'Highest Score', value: data.highestScore + '%', color: 'from-yellow-500 to-orange-500' },
              ].map((s,i) => (
                <div key={i} className="bg-dark-100/80 rounded-2xl border border-white/10 p-5">
                  <p className="text-3xl font-black text-navy mb-1">{s.value}</p>
                  <p className="text-muted text-sm">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-dark-100/80 rounded-2xl border border-white/10 p-6">
                <h3 className="text-navy font-bold mb-4">Score Distribution</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data.scoreDistribution}>
                    <XAxis dataKey="range" tick={{ fill: '#9ca3af', fontSize: 11 }}/>
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }}/>
                    <Tooltip contentStyle={{ background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}/>
                    <Bar dataKey="count" radius={[4,4,0,0]}>
                      {(data.scoreDistribution||[]).map((_,i) => <Cell key={i} fill={COLORS[i]}/>)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-dark-100/80 rounded-2xl border border-white/10 p-6">
                <h3 className="text-navy font-bold mb-4">Section-wise Avg Score</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data.sectionAnalysis}>
                    <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }}/>
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }}/>
                    <Tooltip contentStyle={{ background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}/>
                    <Bar dataKey="avgScore" fill="#6366f1" radius={[4,4,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-dark-100/80 rounded-2xl border border-white/10 p-6">
              <h3 className="text-navy font-bold mb-4">Top Performers</h3>
              <div className="space-y-3">
                {(data.toppers||[]).map((t,i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-dark-200/40 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={"w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm " + (i===0?'bg-yellow-500 text-black':i===1?'bg-gray-400 text-black':i===2?'bg-amber-600 text-navy':'bg-academic text-muted')}>{i+1}</div>
                      <span className="text-navy font-medium">{t.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-primary font-bold">{t.percentage}%</p>
                      <p className="text-muted text-xs">{Math.floor(t.time/60)}m {t.time%60}s</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
