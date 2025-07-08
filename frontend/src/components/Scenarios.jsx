import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Play, Search, TrendingUp, TrendingDown, Star, Clock, Target } from 'lucide-react';
import { CURATED_SCENARIOS, ASSETS } from '../data/mockData';

const Scenarios = ({ onScenarioSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Scenarios', icon: '🎯' },
    { id: 'legendary', label: 'Legendary', icon: '🏆' },
    { id: 'crypto', label: 'Crypto', icon: '₿' },
    { id: 'stocks', label: 'Stocks', icon: '📈' },
    { id: 'missed', label: 'Missed Opportunities', icon: '😅' }
  ];

  const filteredScenarios = CURATED_SCENARIOS.filter(scenario => {
    const matchesSearch = scenario.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scenario.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || scenario.tags.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const calculateScenarioResult = (scenario) => {
    const asset = ASSETS.find(a => a.id === scenario.asset);
    // Mock calculation for display
    const mockGain = Math.random() * 1000000; // Random gain for demo
    const mockPercentage = Math.random() * 5000; // Random percentage for demo
    return {
      finalValue: scenario.amount + mockGain,
      gain: mockGain,
      percentage: mockPercentage
    };
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Curated Scenarios
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Explore famous investment scenarios and learn from history's biggest wins and losses
          </p>
        </CardHeader>
      </Card>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search scenarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 border-2 border-gray-200 focus:border-blue-500"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="flex items-center space-x-2"
            >
              <span>{category.icon}</span>
              <span>{category.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredScenarios.map((scenario) => {
          const asset = ASSETS.find(a => a.id === scenario.asset);
          const result = calculateScenarioResult(scenario);
          
          return (
            <Card key={scenario.id} className="backdrop-blur-sm bg-white/90 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: asset.color }}
                    >
                      {asset.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-gray-900">
                        {scenario.title}
                      </CardTitle>
                    </div>
                  </div>
                  {scenario.tags.includes('legendary') && (
                    <Star className="h-5 w-5 text-yellow-500 fill-current" />
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {scenario.description}
                </p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Investment Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">
                      ${scenario.amount}
                    </div>
                    <div className="text-xs text-gray-600">Investment</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-600">
                      ${result.finalValue.toFixed(0)}
                    </div>
                    <div className="text-xs text-gray-600">Final Value</div>
                  </div>
                </div>

                {/* Performance */}
                <div className="text-center p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 flex items-center justify-center space-x-2">
                    <TrendingUp className="h-6 w-6" />
                    <span>+{result.percentage.toFixed(0)}%</span>
                  </div>
                  <div className="text-xs text-gray-600">Total Return</div>
                </div>

                {/* Time Period */}
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{scenario.buyDate} to {scenario.sellDate}</span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {scenario.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Story Preview */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {scenario.story.substring(0, 120)}...
                  </p>
                </div>

                {/* Action Button */}
                <Button
                  onClick={() => onScenarioSelect(scenario)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold transition-all duration-200"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Try This Scenario
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* No Results */}
      {filteredScenarios.length === 0 && (
        <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-2xl">
          <CardContent className="py-12">
            <div className="text-center">
              <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Scenarios Found</h3>
              <p className="text-gray-600">
                Try adjusting your search terms or category filters
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fun Facts */}
      <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900">
            💡 Did You Know?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
              <div className="text-2xl font-bold text-blue-600">10,000</div>
              <div className="text-sm text-gray-600">BTC spent on two pizzas in 2010</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl">
              <div className="text-2xl font-bold text-green-600">$1M</div>
              <div className="text-sm text-gray-600">Netflix stock bought in 2002</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
              <div className="text-2xl font-bold text-purple-600">32x</div>
              <div className="text-sm text-gray-600">Apple's return since 2010</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Scenarios;