import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { BookOpen, Search, TrendingUp, TrendingDown, AlertTriangle, Star, ExternalLink } from 'lucide-react';
import { INVESTMENT_STORIES, ASSETS } from '../data/mockData';

const Stories = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Stories', icon: '📚' },
    { id: 'legendary', label: 'Legendary', icon: '🏆' },
    { id: 'cautionary', label: 'Cautionary Tales', icon: '⚠️' },
    { id: 'missed-opportunity', label: 'Missed Opportunities', icon: '😅' },
    { id: 'innovation', label: 'Innovation', icon: '💡' }
  ];

  const filteredStories = INVESTMENT_STORIES.filter(story => {
    const matchesSearch = story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         story.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || story.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'legendary': return <Star className="h-5 w-5 text-yellow-500" />;
      case 'cautionary': return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'missed-opportunity': return <TrendingDown className="h-5 w-5 text-red-500" />;
      default: return <BookOpen className="h-5 w-5 text-blue-500" />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'legendary': return 'bg-yellow-100 text-yellow-800';
      case 'cautionary': return 'bg-orange-100 text-orange-800';
      case 'missed-opportunity': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  // Additional featured stories for variety
  const additionalStories = [
    {
      id: 'berkshire-hathaway',
      title: 'From Textile Mill to Investment Empire',
      content: 'Warren Buffett bought Berkshire Hathaway in 1965 for $12 per share. The failing textile company became his investment vehicle. Today, one share costs over $500,000, making it one of the most expensive stocks ever.',
      category: 'legendary',
      asset: 'stocks',
      lesson: 'Sometimes the best investments come from unexpected places.'
    },
    {
      id: 'tulip-mania',
      title: 'The First Bubble: Tulip Mania (1637)',
      content: 'In 1637, tulip bulbs in Holland sold for more than houses. A single bulb could cost 10 times the annual income of a skilled craftsman. Then the bubble burst, and fortunes vanished overnight.',
      category: 'cautionary',
      asset: 'commodity',
      lesson: 'When everyone is buying, it might be time to sell.'
    },
    {
      id: 'microsoft-employees',
      title: 'The Microsoft Millionaire Janitor',
      content: 'In the 1980s, Microsoft gave stock options to all employees, including janitors. One janitor held onto his shares and became worth over $5 million when the company went public.',
      category: 'legendary',
      asset: 'stocks',
      lesson: 'Stock options can be worth more than salary.'
    },
    {
      id: 'kodak-digital',
      title: 'Kodak\'s Digital Camera Mistake',
      content: 'Kodak invented the digital camera in 1975 but feared it would hurt film sales. They shelved the technology. Today, digital photography is everywhere, and Kodak went bankrupt in 2012.',
      category: 'missed-opportunity',
      asset: 'stocks',
      lesson: 'Innovation often comes from within, but incumbents resist change.'
    }
  ];

  const allStories = [...INVESTMENT_STORIES, ...additionalStories];
  const displayStories = allStories.filter(story => {
    const matchesSearch = story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         story.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || story.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <Card className="backdrop-blur-sm bg-card/90 border-border shadow-2xl">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Investment Stories
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            Learn from history's greatest investment successes, failures, and lessons
          </p>
        </CardHeader>
      </Card>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search stories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 border-2 border-border focus:border-blue-500"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="flex items-center space-x-2 border-2 border-border focus:border-blue-500"
            >
              <span>{category.icon}</span>
              <span>{category.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Stories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {displayStories.map((story) => (
          <Card key={story.id} className="backdrop-blur-sm bg-card/90 border-border shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  {getCategoryIcon(story.category)}
                  <div>
                    <CardTitle className="text-lg font-bold text-foreground leading-tight">
                      {story.title}
                    </CardTitle>
                    <Badge className={`mt-2 ${getCategoryColor(story.category)}`}>
                      {story.category.replace('-', ' ')}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Story Content */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-darkgray leading-relaxed">
                  {story.content}
                </p>
              </div>

              {/* Lesson */}
              <div className="text-black bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border-l-4 border-blue-500">
                <h4 className="text-black font-semibold mb-2 flex items-center space-x-2 ">
                  <span>💡</span>
                  <span>Key Lesson</span>
                </h4>
                <p className="text-black text-sm font-medium">
                  {story.lesson}
                </p>
              </div>

              {/* Asset Type */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">Asset Type:</span>
                  <Badge variant="outline">{story.asset}</Badge>
                </div>
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Learn More
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {displayStories.length === 0 && (
        <Card className="backdrop-blur-sm bg-card/90 border-border shadow-2xl">
          <CardContent className="py-12">
            <div className="text-center">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Stories Found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or category filters
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Featured Quote */}
      <Card className="backdrop-blur-sm bg-gradient-to-r from-blue-50 to-purple-50 border-border shadow-2xl">
        <CardContent className="py-8">
          <div className="text-center">
            <div className="text-4xl mb-4">💭</div>
            <blockquote className="text-black text-xl font-medium mb-4">
              "The stock market is a device for transferring money from the impatient to the patient."
            </blockquote>
            <cite className="text-black text-gray font-semibold">— Warren Buffett</cite>
          </div>
        </CardContent>
      </Card>

      {/* Story Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="backdrop-blur-sm bg-card/90 border-border shadow-xl">
          <CardContent className="py-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {displayStories.length}
            </div>
            <div className="text-sm text-muted-foreground">Stories Available</div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-card/90 border-border shadow-xl">
          <CardContent className="py-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {displayStories.filter(s => s.category === 'legendary').length}
            </div>
            <div className="text-sm text-muted-foreground">Success Stories</div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-card/90 border-border shadow-xl">
          <CardContent className="py-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {displayStories.filter(s => s.category === 'cautionary').length}
            </div>
            <div className="text-sm text-muted-foreground">Cautionary Tales</div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-card/90 border-border shadow-xl">
          <CardContent className="py-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {displayStories.filter(s => s.category === 'missed-opportunity').length}
            </div>
            <div className="text-sm text-muted-foreground">Missed Opportunities</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Stories;