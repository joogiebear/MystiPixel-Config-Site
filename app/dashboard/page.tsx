'use client'

import { useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview')

  // Mock user data
  const user = {
    name: 'ConfigMaster',
    email: 'config@master.com',
    isPremium: true,
    joinDate: 'Jan 2024',
    totalConfigs: 12,
    totalDownloads: 45600,
    totalEarnings: 12450.00,
    followers: 1250
  }

  const myConfigs = [
    {
      id: 1,
      title: 'Ultimate Performance Pack',
      downloads: 12500,
      rating: 4.9,
      status: 'published',
      isPremium: true,
      price: 4.99,
      earnings: 6250,
      sales: 1250
    },
    {
      id: 2,
      title: 'Server Optimization Bundle',
      downloads: 8200,
      rating: 4.8,
      status: 'published',
      isPremium: false,
      price: 0,
      earnings: 0,
      sales: 0
    },
    {
      id: 3,
      title: 'New Config Draft',
      downloads: 0,
      rating: 0,
      status: 'draft',
      isPremium: true,
      price: 3.99,
      earnings: 0,
      sales: 0
    }
  ]

  const recentActivity = [
    { type: 'sale', message: 'Someone purchased Ultimate Performance Pack', time: '2 hours ago', amount: 4.99 },
    { type: 'download', message: 'Server Optimization Bundle was downloaded', time: '5 hours ago' },
    { type: 'review', message: 'New 5-star review on Ultimate Performance Pack', time: '1 day ago' },
    { type: 'sale', message: 'Someone purchased Ultimate Performance Pack', time: '2 days ago', amount: 4.99 }
  ]

  const analytics = {
    thisMonth: {
      downloads: 2450,
      sales: 145,
      earnings: 724.20,
      views: 8900
    },
    lastMonth: {
      downloads: 2180,
      sales: 128,
      earnings: 638.40,
      views: 7800
    }
  }

  const calculateGrowth = (current: number, previous: number) => {
    const growth = ((current - previous) / previous) * 100
    return growth.toFixed(1)
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-2">Dashboard</h1>
            <p className="text-[var(--text-secondary)]">Welcome back, {user.name}!</p>
          </div>
          <Button variant="primary">
            Upload New Config
          </Button>
        </div>

        {/* Tabs */}
        <div className="border-b border-[var(--border)] mb-8">
          <div className="flex gap-6">
            {['overview', 'my-configs', 'analytics', 'earnings', 'settings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 px-1 font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {tab.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <Card>
                <div className="text-sm text-[var(--text-secondary)] mb-1">Total Configs</div>
                <div className="text-3xl font-bold text-[var(--primary)]">{user.totalConfigs}</div>
              </Card>
              <Card>
                <div className="text-sm text-[var(--text-secondary)] mb-1">Total Downloads</div>
                <div className="text-3xl font-bold text-[var(--primary)]">{user.totalDownloads.toLocaleString()}</div>
              </Card>
              <Card>
                <div className="text-sm text-[var(--text-secondary)] mb-1">Total Earnings</div>
                <div className="text-3xl font-bold text-[var(--accent)]">${user.totalEarnings.toLocaleString()}</div>
              </Card>
              <Card>
                <div className="text-sm text-[var(--text-secondary)] mb-1">Followers</div>
                <div className="text-3xl font-bold text-[var(--primary)]">{user.followers}</div>
              </Card>
            </div>

            {/* This Month Performance */}
            <Card>
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">This Month</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div className="text-sm text-[var(--text-secondary)] mb-2">Downloads</div>
                  <div className="text-2xl font-bold text-[var(--text-primary)] mb-1">
                    {analytics.thisMonth.downloads.toLocaleString()}
                  </div>
                  <div className="text-xs text-[var(--success)]">
                    +{calculateGrowth(analytics.thisMonth.downloads, analytics.lastMonth.downloads)}% from last month
                  </div>
                </div>
                <div>
                  <div className="text-sm text-[var(--text-secondary)] mb-2">Sales</div>
                  <div className="text-2xl font-bold text-[var(--text-primary)] mb-1">
                    {analytics.thisMonth.sales}
                  </div>
                  <div className="text-xs text-[var(--success)]">
                    +{calculateGrowth(analytics.thisMonth.sales, analytics.lastMonth.sales)}% from last month
                  </div>
                </div>
                <div>
                  <div className="text-sm text-[var(--text-secondary)] mb-2">Earnings</div>
                  <div className="text-2xl font-bold text-[var(--accent)] mb-1">
                    ${analytics.thisMonth.earnings.toFixed(2)}
                  </div>
                  <div className="text-xs text-[var(--success)]">
                    +{calculateGrowth(analytics.thisMonth.earnings, analytics.lastMonth.earnings)}% from last month
                  </div>
                </div>
                <div>
                  <div className="text-sm text-[var(--text-secondary)] mb-2">Views</div>
                  <div className="text-2xl font-bold text-[var(--text-primary)] mb-1">
                    {analytics.thisMonth.views.toLocaleString()}
                  </div>
                  <div className="text-xs text-[var(--success)]">
                    +{calculateGrowth(analytics.thisMonth.views, analytics.lastMonth.views)}% from last month
                  </div>
                </div>
              </div>
            </Card>

            {/* Recent Activity */}
            <Card>
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Recent Activity</h2>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start justify-between py-3 border-b border-[var(--border)] last:border-0">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">
                        {activity.type === 'sale' && '💰'}
                        {activity.type === 'download' && '⬇️'}
                        {activity.type === 'review' && '⭐'}
                      </div>
                      <div>
                        <p className="text-[var(--text-primary)]">{activity.message}</p>
                        <p className="text-sm text-[var(--text-secondary)]">{activity.time}</p>
                      </div>
                    </div>
                    {activity.amount && (
                      <div className="text-[var(--accent)] font-semibold">+${activity.amount}</div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* My Configs Tab */}
        {activeTab === 'my-configs' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">My Configs</h2>
              <Button variant="primary">Upload New Config</Button>
            </div>

            <div className="space-y-4">
              {myConfigs.map((config) => (
                <Card key={config.id} className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-[var(--text-primary)]">
                        {config.title}
                      </h3>
                      <Badge variant={config.status === 'published' ? 'success' : 'warning'}>
                        {config.status}
                      </Badge>
                      {config.isPremium && <Badge variant="accent">Premium</Badge>}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-[var(--text-secondary)]">Downloads: </span>
                        <span className="text-[var(--text-primary)] font-medium">{config.downloads.toLocaleString()}</span>
                      </div>
                      {config.isPremium && (
                        <>
                          <div>
                            <span className="text-[var(--text-secondary)]">Sales: </span>
                            <span className="text-[var(--text-primary)] font-medium">{config.sales}</span>
                          </div>
                          <div>
                            <span className="text-[var(--text-secondary)]">Earnings: </span>
                            <span className="text-[var(--accent)] font-medium">${config.earnings.toLocaleString()}</span>
                          </div>
                        </>
                      )}
                      {config.rating > 0 && (
                        <div>
                          <span className="text-[var(--text-secondary)]">Rating: </span>
                          <span className="text-[var(--text-primary)] font-medium">⭐ {config.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Edit</Button>
                    <Button variant="ghost" size="sm">Delete</Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <Card>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Analytics</h2>
            <div className="text-center py-12 text-[var(--text-secondary)]">
              <div className="text-6xl mb-4">📊</div>
              <p>Detailed analytics coming soon!</p>
              <p className="text-sm mt-2">Track views, conversions, and user engagement</p>
            </div>
          </Card>
        )}

        {/* Earnings Tab */}
        {activeTab === 'earnings' && (
          <div className="space-y-6">
            <Card>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Earnings Overview</h2>
                  <p className="text-[var(--text-secondary)]">You keep 80% of all sales</p>
                </div>
                <Button variant="accent">Withdraw Funds</Button>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-[var(--surface-light)] rounded-lg">
                  <div className="text-sm text-[var(--text-secondary)] mb-2">Available Balance</div>
                  <div className="text-3xl font-bold text-[var(--accent)]">$9,960.00</div>
                </div>
                <div className="text-center p-6 bg-[var(--surface-light)] rounded-lg">
                  <div className="text-sm text-[var(--text-secondary)] mb-2">Pending</div>
                  <div className="text-3xl font-bold text-[var(--text-primary)]">$2,490.00</div>
                </div>
                <div className="text-center p-6 bg-[var(--surface-light)] rounded-lg">
                  <div className="text-sm text-[var(--text-secondary)] mb-2">Lifetime Earnings</div>
                  <div className="text-3xl font-bold text-[var(--primary)]">$12,450.00</div>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">Transaction History</h3>
              <div className="text-center py-8 text-[var(--text-secondary)]">
                <p>No transactions yet</p>
              </div>
            </Card>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <Card>
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Profile Settings</h2>
              <div className="space-y-4 max-w-2xl">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={user.name}
                    className="w-full bg-[var(--surface-light)] border border-[var(--border)] rounded-lg px-4 py-2 text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    className="w-full bg-[var(--surface-light)] border border-[var(--border)] rounded-lg px-4 py-2 text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Bio
                  </label>
                  <textarea
                    rows={4}
                    className="w-full bg-[var(--surface-light)] border border-[var(--border)] rounded-lg px-4 py-2 text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none resize-none"
                    placeholder="Tell the community about yourself..."
                  />
                </div>
                <Button variant="primary">Save Changes</Button>
              </div>
            </Card>

            <Card>
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Payment Settings</h2>
              <div className="space-y-4 max-w-2xl">
                <p className="text-[var(--text-secondary)]">Configure your payment method to receive earnings</p>
                <Button variant="outline">Connect PayPal</Button>
                <Button variant="outline">Connect Stripe</Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
