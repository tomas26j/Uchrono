import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Lightbulb, Search, TrendingUp, DollarSign, Shield, BookOpen, RefreshCw, Share2 } from 'lucide-react';
import { DAILY_TIPS } from '../data/mockData';
import { toast } from 'sonner';

const Tips = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [tipOfTheDay, setTipOfTheDay] = useState(null);

  const categories = [
    { id: 'all', label: 'All Tips', icon: '💡' },
    { id: 'education', label: 'Education', icon: '📚' },
    { id: 'strategy', label: 'Strategy', icon: '🎯' },
    { id: 'risk-management', label: 'Risk Management', icon: '🛡️' },
    { id: 'psychology', label: 'Psychology', icon: '🧠' }
  ];

  // Extended tips for more variety
  const extendedTips = [
    ...DAILY_TIPS,
    {
      id: 'time-in-market',
      title: 'Time in Market Beats Timing the Market',
      content: 'Studies show that investors who stay invested through market cycles outperform those who try to time entries and exits. Missing just 10 of the best days in 20 years can cut returns in half.',
      category: 'strategy'
    },
    {
      id: 'emergency-fund',
      title: 'Build Your Emergency Fund First',
      content: 'Before investing, save 3-6 months of expenses in a high-yield savings account. This prevents you from selling investments during emergencies when markets might be down.',
      category: 'risk-management'
    },
    {
      id: 'emotional-investing',
      title: 'Don\'t Let Emotions Drive Decisions',
      content: 'Fear and greed are the biggest enemies of successful investing. When markets crash, fear makes people sell low. When markets boom, greed makes people buy high. Stay disciplined.',
      category: 'psychology'
    },
    {
      id: 'index-funds',
      title: 'The Power of Index Funds',
      content: 'Index funds offer instant diversification and low fees. Over 90% of actively managed funds fail to beat their benchmark index over 15 years. Simple often beats complex.',
      category: 'strategy'
    },
    {
      id: 'tax-advantaged',
      title: 'Maximize Tax-Advantaged Accounts',
      content: 'Use 401(k)s, IRAs, and HSAs to their fullest. These accounts can save thousands in taxes annually and help your investments grow faster through tax-deferred or tax-free growth.',
      category: 'education'
    },
    {
      id: 'rebalancing',
      title: 'Rebalance Your Portfolio',
      content: 'Rebalancing forces you to sell high-performing assets and buy underperforming ones, maintaining your target allocation. Do this annually or when allocations drift 5% from targets.',
      category: 'strategy'
    },
    {
      id: 'debt-first',
      title: 'Pay Off High-Interest Debt First',
      content: 'Credit card debt at 18% APR is guaranteed to cost you 18% annually. No investment can guarantee 18% returns. Pay off high-interest debt before investing.',
      category: 'risk-management'
    },
    {
      id: 'start-early',
      title: 'Start Investing Early',
      content: 'A 25-year-old investing $100/month until retirement will have more than a 35-year-old investing $200/month. Starting 10 years earlier is worth doubling your contributions.',
      category: 'education'
    }
  ];

  const filteredTips = extendedTips.filter(tip => {
    const matchesSearch = tip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tip.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || tip.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    // Set a random tip of the day
    const randomTip = extendedTips[Math.floor(Math.random() * extendedTips.length)];
    setTipOfTheDay(randomTip);
  }, []);

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'education': return <BookOpen className="h-5 w-5 text-blue-500" />;
      case 'strategy': return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'risk-management': return <Shield className="h-5 w-5 text-orange-500" />;
      case 'psychology': return <span className="text-purple-500">🧠</span>;
      default: return <Lightbulb className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'education': return 'bg-blue-100 text-blue-800';
      case 'strategy': return 'bg-green-100 text-green-800';
      case 'risk-management': return 'bg-orange-100 text-orange-800';
      case 'psychology': return 'bg-purple-100 text-purple-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const shareTip = (tip) => {
    const text = `💡 Financial Tip: ${tip.title}\n\n${tip.content}\n\n#FinancialTips #Investing #ContrafactumApp`;
    navigator.clipboard.writeText(text);
    toast.success('Tip copied to clipboard!');
  };

  const refreshTipOfTheDay = () => {
    const randomTip = extendedTips[Math.floor(Math.random() * extendedTips.length)];
    setTipOfTheDay(randomTip);
    toast.success('New tip of the day loaded!');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Financial Tips & Education
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Learn essential financial concepts and investment strategies
          </p>
        </CardHeader>
      </Card>

      {/* Tip of the Day */}
      {tipOfTheDay && (
        <Card className="backdrop-blur-sm bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 shadow-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Lightbulb className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    💡 Tip of the Day
                  </CardTitle>
                  <p className="text-sm text-gray-600">Your daily dose of financial wisdom</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshTipOfTheDay}
                  className="flex items-center space-x-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>New Tip</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => shareTip(tipOfTheDay)}
                  className="flex items-center space-x-2"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {tipOfTheDay.title}
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {tipOfTheDay.content}
              </p>
              <Badge className={getCategoryColor(tipOfTheDay.category)}>
                {tipOfTheDay.category.replace('-', ' ')}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search tips..."
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

      {/* Tips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTips.map((tip) => (
          <Card key={tip.id} className="backdrop-blur-sm bg-white/90 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  {getCategoryIcon(tip.category)}
                  <div>
                    <CardTitle className="text-lg font-bold text-gray-900 leading-tight">
                      {tip.title}
                    </CardTitle>
                    <Badge className={`mt-2 ${getCategoryColor(tip.category)}`}>
                      {tip.category.replace('-', ' ')}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => shareTip(tip)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Tip Content */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 leading-relaxed text-sm">
                  {tip.content}
                </p>
              </div>

              {/* Action */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-600">Financial Wisdom</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => shareTip(tip)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filteredTips.length === 0 && (
        <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-2xl">
          <CardContent className="py-12">
            <div className="text-center">
              <Lightbulb className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Tips Found</h3>
              <p className="text-gray-600">
                Try adjusting your search terms or category filters
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Educational Resources */}
      <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900">
            📚 Educational Resources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-xl">
              <h4 className="font-semibold text-blue-900 mb-2">📖 Recommended Books</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• "The Intelligent Investor" by Benjamin Graham</li>
                <li>• "A Random Walk Down Wall Street" by Burton Malkiel</li>
                <li>• "The Bogleheads' Guide to Investing" by Taylor Larimore</li>
              </ul>
            </div>
            <div className="p-4 bg-green-50 rounded-xl">
              <h4 className="font-semibold text-green-900 mb-2">🎓 Key Concepts</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Compound Interest</li>
                <li>• Asset Allocation</li>
                <li>• Dollar-Cost Averaging</li>
                <li>• Risk vs. Return</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-xl">
          <CardContent className="py-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {filteredTips.length}
            </div>
            <div className="text-sm text-gray-600">Tips Available</div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-xl">
          <CardContent className="py-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {filteredTips.filter(t => t.category === 'strategy').length}
            </div>
            <div className="text-sm text-gray-600">Strategy Tips</div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-xl">
          <CardContent className="py-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {filteredTips.filter(t => t.category === 'risk-management').length}
            </div>
            <div className="text-sm text-gray-600">Risk Management</div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-xl">
          <CardContent className="py-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {filteredTips.filter(t => t.category === 'psychology').length}
            </div>
            <div className="text-sm text-gray-600">Psychology Tips</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Tips;