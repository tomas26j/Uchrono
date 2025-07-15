import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Trophy, TrendingUp, TrendingDown, Medal, Award, Crown } from 'lucide-react';
import { LEADERBOARD_DATA, ASSETS } from '../data/mockData';
import { fetchStockHistory } from '../lib/alphaVantage';

const Leaderboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('5years');
  const [viewMode, setViewMode] = useState('winners'); // winners, losers
  const [realData, setRealData] = useState({ '1year': [], '5years': [], '10years': [] });
  const [loading, setLoading] = useState(false);

  const periods = [
    { id: '1year', label: '1 Year', icon: '📅', years: 1 },
    { id: '5years', label: '5 Years', icon: '🗓️', years: 5 },
    { id: '10years', label: '10 Years', icon: '📊', years: 10 }
  ];

  const viewModes = [
    { id: 'winners', label: 'Top Winners', icon: '🏆' },
    { id: 'losers', label: 'Biggest Losers', icon: '📉' }
  ];

  useEffect(() => {
    async function calculateLeaderboard() {
      setLoading(true);
      const now = new Date();
      const results = { '1year': [], '5years': [], '10years': [] };
      for (const period of periods) {
        const start = new Date(now);
        start.setFullYear(now.getFullYear() - period.years);
        const startDate = `${start.getFullYear()}-01-01`;
        const endDate = `${now.getFullYear()}-12-31`;
        for (const asset of ASSETS) {
          let priceData = await fetchStockHistory(asset.symbol || asset.id, startDate, endDate);
          if (!priceData || priceData.length < 2) continue;
          const initial = priceData[0].price;
          const final = priceData[priceData.length - 1].price;
          const amount = 1000;
          const shares = amount / initial;
          const value = shares * final;
          const ret = ((value - amount) / amount) * 100;
          results[period.id].push({
            asset: asset.id,
            symbol: asset.symbol,
            return: ret,
            amount,
            value: Math.round(value)
          });
        }
        // Ordenar por retorno descendente
        results[period.id].sort((a, b) => b.return - a.return);
      }
      setRealData(results);
      setLoading(false);
    }
    calculateLeaderboard();
  }, []);

  const displayData = viewMode === 'winners'
    ? realData[selectedPeriod].slice(0, 5)
    : realData[selectedPeriod].slice(-5).reverse();

  const getRankIcon = (index) => {
    switch (index) {
      case 0: return <Crown className="h-6 w-6 text-black-500" />;
      case 1: return <Medal className="h-6 w-6 text-black-400" />;
      case 2: return <Award className="h-6 w-6 text-black-600" />;
      default: return <Trophy className="h-5 w-5 text-black-400" />;
    }
  };

  const getRankColor = (index) => {
    switch (index) {
      case 0: return 'from-yellow-400 to-yellow-600';
      case 1: return 'from-gray-300 to-gray-500';
      case 2: return 'from-amber-400 to-amber-600';
      default: return 'from-gray-200 to-gray-400';
    }
  };

  const getPerformanceColor = (returnValue) => {
    if (returnValue > 0) {
      if (returnValue > 500) return 'text-green-600 bg-green-50';
      if (returnValue > 100) return 'text-green-500 bg-green-50';
      return 'text-green-400 bg-green-50';
    } else {
      if (returnValue < -50) return 'text-red-600 bg-red-50';
      if (returnValue < -20) return 'text-red-500 bg-red-50';
      return 'text-red-400 bg-red-50';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <Card className="backdrop-blur-sm bg-card/90 border-border shadow-2xl">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Investment Leaderboard
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            See the top performing investments across different time periods
          </p>
          {loading && <div className="mt-2 text-blue-600 font-semibold">Cargando datos reales...</div>}
        </CardHeader>
      </Card>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Time Period Selection */}
        <div className="flex flex-wrap gap-2">
          {periods.map((period) => (
            <Button
              key={period.id}
              variant={selectedPeriod === period.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod(period.id)}
              className="flex items-center space-x-2 border-2 border-border focus:border-blue-500"
            >
              <span>{period.icon}</span>
              <span>{period.label}</span>
            </Button>
          ))}
        </div>

        {/* View Mode Selection */}
        <div className="flex flex-wrap gap-2">
          {viewModes.map((mode) => (
            <Button
              key={mode.id}
              variant={viewMode === mode.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode(mode.id)}
              className="flex items-center space-x-2 border-2 border-border focus:border-blue-500"
            >
              <span>{mode.icon}</span>
              <span>{mode.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Leaderboard */}
      <Card className="backdrop-blur-sm bg-card/90 border-border shadow-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-foreground flex items-center space-x-2">
            {viewMode === 'winners' ? (
              <>
                <TrendingUp className="h-6 w-6 text-green-500" />
                <span>Top Winners - {periods.find(p => p.id === selectedPeriod)?.label}</span>
              </>
            ) : (
              <>
                <TrendingDown className="h-6 w-6 text-red-500" />
                <span>Biggest Losers - {periods.find(p => p.id === selectedPeriod)?.label}</span>
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {displayData.map((entry, index) => {
              const asset = ASSETS.find(a => a.id === entry.asset);
              const isPositive = entry.return > 0;
              
              return (
                <div key={entry.asset} className="flex items-center space-x-4 p-4 bg-muted/50 rounded-xl hover:bg-muted/70 transition-colors">
                  {/* Rank */}
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getRankColor(index)} flex items-center justify-center`}>
                    {getRankIcon(index)}
                  </div>

                  {/* Asset Info */}
                  <div className="flex items-center space-x-3 flex-1">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: asset.color }}
                    >
                      {asset.icon}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{asset.name}</div>
                      <div className="text-sm text-muted-foreground">{asset.symbol}</div>
                    </div>
                  </div>

                  {/* Investment Amount */}
                  <div className="text-center">
                    <div className="text-lg font-bold text-foreground">
                      ${entry.amount}
                    </div>
                    <div className="text-xs text-muted-foreground">Invested</div>
                  </div>

                  {/* Current Value */}
                  <div className="text-center">
                    <div className="text-lg font-bold text-foreground">
                      ${entry.asset === 'dogecoin' ? entry.value.toFixed(4) : entry.value}
                    </div>
                    <div className="text-xs text-muted-foreground">Current</div>
                  </div>

                  {/* Performance */}
                  <div className="text-center">
                    <div className={`text-lg font-bold px-3 py-1 rounded-lg ${getPerformanceColor(entry.return)}`}>
                      {isPositive ? '+' : ''}{entry.return.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {isPositive ? 'Gain' : 'Loss'}
                    </div>
                  </div>

                  {/* Rank Badge */}
                  <div>
                    <Badge variant={index < 3 ? 'default' : 'secondary'}>
                      #{index + 1}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="backdrop-blur-sm bg-card/90 border-border shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-foreground">
              Best Performer
            </CardTitle>
          </CardHeader>
          <CardContent>
            {displayData.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: ASSETS.find(a => a.id === displayData[0].asset)?.color }}
                  >
                    {ASSETS.find(a => a.id === displayData[0].asset)?.icon}
                  </div>
                  <span className="font-semibold text-foreground">
                    {ASSETS.find(a => a.id === displayData[0].asset)?.name}
                  </span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  +{displayData[0].return.toFixed(1)}%
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-card/90 border-border shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-foreground">
              Average Return
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-blue-600">
                +{displayData.length > 0 ? (displayData.reduce((sum, entry) => sum + entry.return, 0) / displayData.length).toFixed(1) : 0}%
              </div>
              <div className="text-sm text-muted-foreground">
                Across top performers
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-card/90 border-border shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-foreground">
              Time Period
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-purple-600">
                {periods.find(p => p.id === selectedPeriod)?.label}
              </div>
              <div className="text-sm text-muted-foreground">
                Historical performance
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Disclaimer */}
      <Card className="backdrop-blur-sm bg-yellow-50 border-yellow-200 shadow-xl">
        <CardContent className="py-4">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-bold">!</span>
            </div>
            <div>
              <h4 className="font-semibold text-yellow-800">Important Disclaimer</h4>
              <p className="text-sm text-yellow-700 mt-1">
                These rankings are based on historical data and do not guarantee future performance. 
                Past performance is not indicative of future results. All investments carry risk.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Leaderboard;