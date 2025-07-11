import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar, TrendingUp, TrendingDown, DollarSign, Share2 } from 'lucide-react';
import { ASSETS, generateMockPriceData } from '../data/mockData';
import { toast } from 'sonner';

const MainCalculator = ({ onResult, initialData }) => {
  const [selectedAsset, setSelectedAsset] = useState('');
  const [amount, setAmount] = useState('');
  const [buyDate, setBuyDate] = useState('');
  const [sellDate, setSellDate] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setSelectedAsset(initialData.asset);
      setAmount(initialData.amount.toString());
      setBuyDate(initialData.buyDate);
      setSellDate(initialData.sellDate);
      calculateInvestment();
    }
  }, [initialData]);

  const calculateInvestment = async () => {
    if (!selectedAsset || !amount || !buyDate || !sellDate) {
      toast.error('Please fill in all fields');
      return;
    }

    if (new Date(buyDate) >= new Date(sellDate)) {
      toast.error('Buy date must be before sell date');
      return;
    }

    setLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const asset = ASSETS.find(a => a.id === selectedAsset);
      const priceData = generateMockPriceData(selectedAsset, buyDate, sellDate);
      
      const buyPrice = priceData.find(p => p.date === buyDate)?.price || priceData[0]?.price;
      const sellPrice = priceData.find(p => p.date === sellDate)?.price || priceData[priceData.length - 1]?.price;
      
      const shares = parseFloat(amount) / buyPrice;
      const finalValue = shares * sellPrice;
      const gain = finalValue - parseFloat(amount);
      const percentageGain = ((finalValue - parseFloat(amount)) / parseFloat(amount)) * 100;
      
      const calculationResult = {
        asset: selectedAsset,
        assetInfo: asset,
        amount: parseFloat(amount),
        buyDate,
        sellDate,
        buyPrice,
        sellPrice,
        shares,
        finalValue,
        gain,
        percentageGain,
        priceData,
        scenario: initialData?.scenario || null
      };
      
      setResult(calculationResult);
      onResult(calculationResult);
      
      toast.success('Investment calculated successfully!');
    } catch (error) {
      toast.error('Error calculating investment');
    } finally {
      setLoading(false);
    }
  };

  const shareResult = () => {
    if (!result) return;
    
    const text = `I just calculated: $${result.amount} in ${result.assetInfo.name} (${result.buyDate}) would be worth $${result.finalValue.toFixed(2)} today! That's a ${result.percentageGain.toFixed(1)}% ${result.gain > 0 ? 'gain' : 'loss'}! 🚀\n\nTry it yourself at Contrafactum!`;
    
    navigator.clipboard.writeText(text);
    toast.success('Result copied to clipboard!');
  };

  const assetsByCategory = ASSETS.reduce((acc, asset) => {
    if (!acc[asset.category]) acc[asset.category] = [];
    acc[asset.category].push(asset);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {/* Calculator Form */}
      <Card className="backdrop-blur-sm bg-card/90 border-border shadow-2xl">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Investment Calculator
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            Discover what your past investments would be worth today
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Asset Selection */}
            <div className="space-y-2">
              <Label htmlFor="asset" className="text-sm font-semibold text-foreground">
                Choose Asset
              </Label>
              <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                <SelectTrigger className="h-12 border-2 border-border focus:border-blue-500">
                  <SelectValue placeholder="Select an asset..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(assetsByCategory).map(([category, assets]) => (
                    <div key={category}>
                      <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted">
                        {category}
                      </div>
                      {assets.map((asset) => (
                        <SelectItem key={asset.id} value={asset.id}>
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                              style={{ backgroundColor: asset.color }}
                            >
                              {asset.icon}
                            </div>
                            <div>
                              <div className="font-medium">{asset.name}</div>
                              <div className="text-xs text-muted-foreground">{asset.symbol}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
              {/* Quick Asset Buttons */}
              <div className="flex flex-wrap gap-2 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedAsset('bitcoin')}
                  className="text-xs"
                >
                  ₿ Bitcoin
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedAsset('tesla')}
                  className="text-xs"
                >
                  🚗 Tesla
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedAsset('nvidia')}
                  className="text-xs"
                >
                  💻 NVIDIA
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedAsset('apple')}
                  className="text-xs"
                >
                  🍎 Apple
                </Button>
              </div>
            </div>

            {/* Investment Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-semibold text-foreground">
                Investment Amount ($)
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  placeholder="1000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-10 h-12 border-2 border-border focus:border-blue-500"
                />
              </div>
              {/* Quick Amount Buttons */}
              <div className="flex flex-wrap gap-2 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount('100')}
                  className="text-xs"
                >
                  $100
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount('1000')}
                  className="text-xs"
                >
                  $1,000
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount('10000')}
                  className="text-xs"
                >
                  $10,000
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount('50000')}
                  className="text-xs"
                >
                  $50,000
                </Button>
              </div>
            </div>

            {/* Buy Date */}
            <div className="space-y-2">
              <Label htmlFor="buyDate" className="text-sm font-semibold text-foreground">
                Purchase Date
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="buyDate"
                  type="date"
                  value={buyDate}
                  onChange={(e) => setBuyDate(e.target.value)}
                  className="pl-10 h-12 border-2 border-border focus:border-blue-500"
                  max="2024-01-01"
                />
              </div>
              {/* Quick Date Buttons */}
              <div className="flex flex-wrap gap-2 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const date = new Date();
                    date.setFullYear(date.getFullYear() - 10);
                    setBuyDate(date.toISOString().split('T')[0]);
                  }}
                  className="text-xs"
                >
                  10 Years Ago
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const date = new Date();
                    date.setFullYear(date.getFullYear() - 5);
                    setBuyDate(date.toISOString().split('T')[0]);
                  }}
                  className="text-xs"
                >
                  5 Years Ago
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const date = new Date();
                    date.setFullYear(date.getFullYear() - 1);
                    setBuyDate(date.toISOString().split('T')[0]);
                  }}
                  className="text-xs"
                >
                  1 Year Ago
                </Button>
              </div>
            </div>

            {/* Sell Date */}
            <div className="space-y-2">
              <Label htmlFor="sellDate" className="text-sm font-semibold text-foreground">
                Sell Date
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="sellDate"
                  type="date"
                  value={sellDate}
                  onChange={(e) => setSellDate(e.target.value)}
                  className="pl-10 h-12 border-2 border-border focus:border-blue-500"
                  max="2024-12-31"
                />
              </div>
              {/* Quick Date Buttons */}
              <div className="flex flex-wrap gap-2 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const today = new Date();
                    setSellDate(today.toISOString().split('T')[0]);
                  }}
                  className="text-xs"
                >
                  Today
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSellDate('2024-01-01');
                  }}
                  className="text-xs"
                >
                  2024 Start
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSellDate('2023-01-01');
                  }}
                  className="text-xs"
                >
                  2023 Start
                </Button>
              </div>
            </div>
          </div>

          <Button 
            onClick={calculateInvestment} 
            disabled={loading}
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-lg transition-all duration-200 transform hover:scale-105"
          >
            {loading ? 'Calculating...' : 'Calculate Investment'}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold text-gray-900">
                Investment Results
              </CardTitle>
              <Button
                onClick={shareResult}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Initial Investment */}
              <div className="text-center p-6 bg-gray-50 rounded-xl">
                <div className="text-2xl font-bold text-gray-900">
                  ${result.amount.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600 mt-1">Initial Investment</div>
                <div className="text-xs text-gray-500 mt-2">
                  {result.shares.toFixed(6)} shares at ${result.buyPrice.toFixed(2)}
                </div>
              </div>

              {/* Final Value */}
              <div className="text-center p-6 bg-blue-50 rounded-xl">
                <div className="text-2xl font-bold text-blue-600">
                  ${result.finalValue.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600 mt-1">Current Value</div>
                <div className="text-xs text-gray-500 mt-2">
                  At ${result.sellPrice.toFixed(2)} per share
                </div>
              </div>

              {/* Gain/Loss */}
              <div className={`text-center p-6 rounded-xl ${
                result.gain > 0 ? 'bg-green-50' : 'bg-red-50'
              }`}>
                <div className={`text-2xl font-bold flex items-center justify-center space-x-2 ${
                  result.gain > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {result.gain > 0 ? (
                    <TrendingUp className="h-6 w-6" />
                  ) : (
                    <TrendingDown className="h-6 w-6" />
                  )}
                  <span>{result.gain > 0 ? '+' : ''}${result.gain.toFixed(2)}</span>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {result.gain > 0 ? 'Gain' : 'Loss'}
                </div>
                <div className={`text-xs mt-2 font-semibold ${
                  result.gain > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {result.percentageGain > 0 ? '+' : ''}{result.percentageGain.toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Scenario Story */}
            {result.scenario && (
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                <h4 className="font-semibold text-gray-900 mb-2">
                  {result.scenario.title}
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {result.scenario.story}
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {result.scenario.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MainCalculator;