import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { TrendingUp, TrendingDown, Calendar, DollarSign, Info } from 'lucide-react';
import { ASSETS } from '../data/mockData';

const Timeline = ({ asset, calculatorData }) => {
  const [timelineData, setTimelineData] = useState(null);
  const [viewMode, setViewMode] = useState('line'); // line, area, candlestick
  const [hoveredPoint, setHoveredPoint] = useState(null);

  useEffect(() => {
    if (calculatorData) {
      setTimelineData(calculatorData);
    }
  }, [calculatorData]);

  if (!timelineData) {
    return (
      <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-2xl">
        <CardContent className="py-12">
          <div className="text-center">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Timeline Data</h3>
            <p className="text-gray-600">
              Calculate an investment first to see the timeline visualization
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const assetInfo = ASSETS.find(a => a.id === timelineData.asset);
  const priceData = timelineData.priceData;
  
  // Calculate key metrics for the timeline
  const maxPrice = Math.max(...priceData.map(p => p.price));
  const minPrice = Math.min(...priceData.map(p => p.price));
  const priceRange = maxPrice - minPrice;
  
  // Find key events (buy/sell points)
  const buyPoint = priceData.find(p => p.date === timelineData.buyDate);
  const sellPoint = priceData.find(p => p.date === timelineData.sellDate);
  
  // Calculate portfolio value over time
  const portfolioData = priceData.map(point => ({
    ...point,
    portfolioValue: timelineData.shares * point.price,
    gain: (timelineData.shares * point.price) - timelineData.amount,
    percentageGain: ((timelineData.shares * point.price) - timelineData.amount) / timelineData.amount * 100
  }));

  const viewModes = [
    { id: 'line', label: 'Line Chart', icon: '📈' },
    { id: 'area', label: 'Area Chart', icon: '📊' },
    { id: 'portfolio', label: 'Portfolio Value', icon: '💰' }
  ];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPrice = (price) => {
    if (price < 1) return `$${price.toFixed(4)}`;
    if (price < 1000) return `$${price.toFixed(2)}`;
    return `$${(price / 1000).toFixed(1)}K`;
  };

  return (
    <div className="space-y-8">
      {/* Timeline Header */}
      <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: assetInfo.color }}
              >
                {assetInfo.icon}
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {assetInfo.name} Timeline
                </CardTitle>
                <p className="text-gray-600">
                  {formatDate(timelineData.buyDate)} to {formatDate(timelineData.sellDate)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                ${timelineData.finalValue.toFixed(2)}
              </div>
              <div className={`text-sm font-semibold ${
                timelineData.gain > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {timelineData.gain > 0 ? '+' : ''}${timelineData.gain.toFixed(2)} ({timelineData.percentageGain.toFixed(1)}%)
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* View Mode Selection */}
      <div className="flex flex-wrap gap-2">
        {viewModes.map((mode) => (
          <Button
            key={mode.id}
            variant={viewMode === mode.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode(mode.id)}
            className="flex items-center space-x-2"
          >
            <span>{mode.icon}</span>
            <span>{mode.label}</span>
          </Button>
        ))}
      </div>

      {/* Timeline Chart */}
      <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900">
            {viewMode === 'portfolio' ? 'Portfolio Value Over Time' : 'Price History'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative h-96 bg-gray-50 rounded-xl p-4">
            {/* SVG Chart */}
            <svg viewBox="0 0 800 300" className="w-full h-full">
              {/* Grid lines */}
              <defs>
                <pattern id="grid" width="40" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 30" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="800" height="300" fill="url(#grid)" />
              
              {/* Price/Portfolio line */}
              <g>
                {viewMode === 'area' && (
                  <path
                    d={`M 0 ${300 - ((portfolioData[0].price - minPrice) / priceRange * 250)} ${portfolioData.map((point, index) => {
                      const x = (index / (portfolioData.length - 1)) * 800;
                      const y = 300 - ((point.price - minPrice) / priceRange * 250);
                      return `L ${x} ${y}`;
                    }).join(' ')} L 800 300 L 0 300 Z`}
                    fill="url(#priceGradient)"
                    opacity="0.3"
                  />
                )}
                
                {/* Price line */}
                <path
                  d={`M 0 ${300 - ((portfolioData[0][viewMode === 'portfolio' ? 'portfolioValue' : 'price'] - (viewMode === 'portfolio' ? Math.min(...portfolioData.map(p => p.portfolioValue)) : minPrice)) / (viewMode === 'portfolio' ? Math.max(...portfolioData.map(p => p.portfolioValue)) - Math.min(...portfolioData.map(p => p.portfolioValue)) : priceRange) * 250)} ${portfolioData.map((point, index) => {
                    const x = (index / (portfolioData.length - 1)) * 800;
                    const value = viewMode === 'portfolio' ? point.portfolioValue : point.price;
                    const range = viewMode === 'portfolio' ? Math.max(...portfolioData.map(p => p.portfolioValue)) - Math.min(...portfolioData.map(p => p.portfolioValue)) : priceRange;
                    const min = viewMode === 'portfolio' ? Math.min(...portfolioData.map(p => p.portfolioValue)) : minPrice;
                    const y = 300 - ((value - min) / range * 250);
                    return `L ${x} ${y}`;
                  }).join(' ')}`}
                  fill="none"
                  stroke={assetInfo.color}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                
                {/* Buy point */}
                {buyPoint && (
                  <g>
                    <circle
                      cx={portfolioData.findIndex(p => p.date === buyPoint.date) / (portfolioData.length - 1) * 800}
                      cy={300 - ((buyPoint.price - minPrice) / priceRange * 250)}
                      r="6"
                      fill="#10b981"
                      stroke="white"
                      strokeWidth="3"
                    />
                  </g>
                )}
                
                {/* Sell point */}
                {sellPoint && (
                  <g>
                    <circle
                      cx={portfolioData.findIndex(p => p.date === sellPoint.date) / (portfolioData.length - 1) * 800}
                      cy={300 - ((sellPoint.price - minPrice) / priceRange * 250)}
                      r="6"
                      fill="#ef4444"
                      stroke="white"
                      strokeWidth="3"
                    />
                  </g>
                )}
              </g>
              
              {/* Gradient definition */}
              <defs>
                <linearGradient id="priceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{stopColor: assetInfo.color, stopOpacity: 0.8}} />
                  <stop offset="100%" style={{stopColor: assetInfo.color, stopOpacity: 0.1}} />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Hover tooltip */}
            {hoveredPoint && (
              <div className="absolute bg-white shadow-lg rounded-lg p-3 border pointer-events-none">
                <div className="text-sm font-semibold">{formatDate(hoveredPoint.date)}</div>
                <div className="text-xs text-gray-600">
                  Price: {formatPrice(hoveredPoint.price)}
                </div>
                {viewMode === 'portfolio' && (
                  <div className="text-xs text-gray-600">
                    Portfolio: ${hoveredPoint.portfolioValue.toFixed(2)}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Key Events */}
      <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Key Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Buy Event */}
            <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-xl">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900">Purchase</div>
                <div className="text-sm text-gray-600">
                  {formatDate(timelineData.buyDate)} • ${timelineData.amount} invested
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900">
                  {formatPrice(timelineData.buyPrice)}
                </div>
                <div className="text-sm text-gray-600">
                  {timelineData.shares.toFixed(6)} shares
                </div>
              </div>
            </div>
            
            {/* Sell Event */}
            <div className="flex items-center space-x-4 p-4 bg-red-50 rounded-xl">
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900">Sale</div>
                <div className="text-sm text-gray-600">
                  {formatDate(timelineData.sellDate)} • Portfolio liquidated
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900">
                  {formatPrice(timelineData.sellPrice)}
                </div>
                <div className="text-sm text-gray-600">
                  ${timelineData.finalValue.toFixed(2)} total
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round((new Date(timelineData.sellDate) - new Date(timelineData.buyDate)) / (1000 * 60 * 60 * 24))}
              </div>
              <div className="text-sm text-gray-600">Days Held</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <div className="text-2xl font-bold text-purple-600">
                {(() => {
                  const daysHeld = Math.round((new Date(timelineData.sellDate) - new Date(timelineData.buyDate)) / (1000 * 60 * 60 * 24));
                  const annualReturn = ((timelineData.sellPrice / timelineData.buyPrice) ** (365 / daysHeld) - 1) * 100;
                  return annualReturn.toFixed(1);
                })()}%
              </div>
              <div className="text-sm text-gray-600">Annual Return</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <div className="text-2xl font-bold text-green-600">
                {formatPrice(maxPrice)}
              </div>
              <div className="text-sm text-gray-600">Peak Price</div>
            </div>
            
            <div className="text-center p-4 bg-red-50 rounded-xl">
              <div className="text-2xl font-bold text-red-600">
                {formatPrice(minPrice)}
              </div>
              <div className="text-sm text-gray-600">Lowest Price</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Timeline;