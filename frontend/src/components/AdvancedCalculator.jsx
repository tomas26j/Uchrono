import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { 
  Plus, Minus, Download, Share2, TrendingUp, TrendingDown, 
  DollarSign, Target, Activity, Calendar, X 
} from 'lucide-react';
import { ASSETS, generateMockPriceData } from '../data/mockData';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AdvancedCalculator = () => {
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [activeStrategy, setActiveStrategy] = useState('single');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const { register, control, handleSubmit, watch, setValue, reset } = useForm({
    defaultValues: {
      singleInvestment: {
        amount: 1000,
        date: '2020-01-01'
      },
      dcaStrategy: {
        amount: 100,
        frequency: 'monthly',
        startDate: '2020-01-01',
        endDate: '2024-01-01'
      },
      steppedStrategy: {
        investments: [
          { date: '2020-01-01', amount: 1000 },
          { date: '2021-01-01', amount: 1500 },
          { date: '2022-01-01', amount: 2000 }
        ]
      }
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'steppedStrategy.investments'
  });

  const formData = watch();

  // Asset categories
  const assetCategories = {
    crypto: ASSETS.filter(a => a.category === 'crypto'),
    stock: ASSETS.filter(a => a.category === 'stock'),
    commodity: ASSETS.filter(a => a.category === 'commodity' || a.category === 'index')
  };

  const addAsset = (asset) => {
    if (!selectedAssets.find(a => a.id === asset.id)) {
      setSelectedAssets([...selectedAssets, asset]);
    }
  };

  const removeAsset = (assetId) => {
    setSelectedAssets(selectedAssets.filter(a => a.id !== assetId));
  };

  const calculateSingleInvestment = (asset, amount, startDate, endDate) => {
    const priceData = generateMockPriceData(asset.id, startDate, endDate);
    const buyPrice = priceData[0]?.price || 1;
    const sellPrice = priceData[priceData.length - 1]?.price || 1;
    const shares = amount / buyPrice;
    const finalValue = shares * sellPrice;
    const totalReturn = ((finalValue - amount) / amount) * 100;
    
    const days = Math.abs(new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24);
    const years = days / 365;
    const cagr = ((finalValue / amount) ** (1 / years) - 1) * 100;

    return {
      asset,
      initialInvestment: amount,
      finalValue,
      totalReturn,
      cagr,
      shares,
      buyPrice,
      sellPrice,
      priceData,
      maxDrawdown: Math.random() * 30, // Mock drawdown
      sharpeRatio: 0.5 + Math.random() * 2 // Mock Sharpe ratio
    };
  };

  const calculateDCA = (asset, amount, frequency, startDate, endDate) => {
    const priceData = generateMockPriceData(asset.id, startDate, endDate);
    const frequencyDays = frequency === 'weekly' ? 7 : 30;
    
    let totalShares = 0;
    let totalInvested = 0;
    const investments = [];

    for (let i = 0; i < priceData.length; i += frequencyDays) {
      if (priceData[i]) {
        const price = priceData[i].price;
        const shares = amount / price;
        totalShares += shares;
        totalInvested += amount;
        investments.push({
          date: priceData[i].date,
          amount,
          price,
          shares
        });
      }
    }

    const finalPrice = priceData[priceData.length - 1]?.price || 1;
    const finalValue = totalShares * finalPrice;
    const totalReturn = ((finalValue - totalInvested) / totalInvested) * 100;
    
    const days = Math.abs(new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24);
    const years = days / 365;
    const cagr = ((finalValue / totalInvested) ** (1 / years) - 1) * 100;

    return {
      asset,
      initialInvestment: totalInvested,
      finalValue,
      totalReturn,
      cagr,
      shares: totalShares,
      investments,
      priceData,
      maxDrawdown: Math.random() * 25,
      sharpeRatio: 0.8 + Math.random() * 1.5
    };
  };

  const calculateSteppedStrategy = (asset, investments) => {
    if (!investments || investments.length === 0) return null;
    
    const sortedInvestments = [...investments].sort((a, b) => new Date(a.date) - new Date(b.date));
    const startDate = sortedInvestments[0].date;
    const endDate = sortedInvestments[sortedInvestments.length - 1].date;
    
    const priceData = generateMockPriceData(asset.id, startDate, endDate);
    
    let totalShares = 0;
    let totalInvested = 0;
    
    sortedInvestments.forEach(investment => {
      const pricePoint = priceData.find(p => p.date === investment.date) || priceData[0];
      const shares = investment.amount / pricePoint.price;
      totalShares += shares;
      totalInvested += investment.amount;
    });

    const finalPrice = priceData[priceData.length - 1]?.price || 1;
    const finalValue = totalShares * finalPrice;
    const totalReturn = ((finalValue - totalInvested) / totalInvested) * 100;
    
    const days = Math.abs(new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24);
    const years = days / 365;
    const cagr = ((finalValue / totalInvested) ** (1 / years) - 1) * 100;

    return {
      asset,
      initialInvestment: totalInvested,
      finalValue,
      totalReturn,
      cagr,
      shares: totalShares,
      investments: sortedInvestments,
      priceData,
      maxDrawdown: Math.random() * 35,
      sharpeRatio: 0.6 + Math.random() * 1.8
    };
  };

  const onSubmit = async (data) => {
    if (selectedAssets.length === 0) {
      toast.error('Please select at least one asset');
      return;
    }

    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const calculatedResults = selectedAssets.map(asset => {
        switch (activeStrategy) {
          case 'single':
            return calculateSingleInvestment(
              asset,
              data.singleInvestment.amount,
              data.singleInvestment.date,
              '2024-01-01'
            );
          case 'dca':
            return calculateDCA(
              asset,
              data.dcaStrategy.amount,
              data.dcaStrategy.frequency,
              data.dcaStrategy.startDate,
              data.dcaStrategy.endDate
            );
          case 'stepped':
            return calculateSteppedStrategy(asset, data.steppedStrategy.investments);
          default:
            return null;
        }
      }).filter(Boolean);

      // Add benchmark calculations (S&P 500 and Gold)
      const sp500 = ASSETS.find(a => a.id === 'sp500');
      const gold = ASSETS.find(a => a.id === 'gold');
      
      const benchmarks = [];
      if (sp500 && activeStrategy === 'single') {
        benchmarks.push({
          ...calculateSingleInvestment(sp500, data.singleInvestment.amount, data.singleInvestment.date, '2024-01-01'),
          isBenchmark: true,
          benchmarkType: 'S&P 500'
        });
      }
      if (gold && activeStrategy === 'single') {
        benchmarks.push({
          ...calculateSingleInvestment(gold, data.singleInvestment.amount, data.singleInvestment.date, '2024-01-01'),
          isBenchmark: true,
          benchmarkType: 'Gold'
        });
      }

      setResults({
        portfolioResults: calculatedResults,
        benchmarks,
        strategy: activeStrategy,
        totalPortfolioValue: calculatedResults.reduce((sum, r) => sum + r.finalValue, 0),
        totalInvested: calculatedResults.reduce((sum, r) => sum + r.initialInvestment, 0)
      });
      
      toast.success('Portfolio calculated successfully!');
    } catch (error) {
      toast.error('Error calculating portfolio');
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = async () => {
    const element = document.getElementById('results-panel');
    if (!element) return;
    
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF();
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    
    let position = 0;
    
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    pdf.save('uchrono-investment-analysis.pdf');
    toast.success('PDF exported successfully!');
  };

  const exportToPNG = async () => {
    const element = document.getElementById('results-panel');
    if (!element) return;
    
    const canvas = await html2canvas(element);
    const link = document.createElement('a');
    link.download = 'uchrono-investment-analysis.png';
    link.href = canvas.toDataURL();
    link.click();
    toast.success('PNG exported successfully!');
  };

  const getEquivalents = (profit) => {
    const equivalents = [
      { item: 'Tesla Model S', price: 94990, icon: '🚗' },
      { item: 'Average US Home Down Payment', price: 60000, icon: '🏠' },
      { item: 'Harvard MBA Tuition', price: 73440, icon: '🎓' },
      { item: 'Rolex Submariner', price: 8100, icon: '⌚' },
      { item: 'iPhone 15 Pro Max', price: 1199, icon: '📱' },
      { item: 'Round-trip to Tokyo', price: 1200, icon: '✈️' }
    ];
    
    return equivalents.map(eq => ({
      ...eq,
      quantity: Math.floor(profit / eq.price)
    })).filter(eq => eq.quantity > 0);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <Card className="backdrop-blur-sm bg-card/90 border-border shadow-2xl">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Advanced Portfolio Calculator
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            Multi-asset investment strategies with advanced analytics
          </p>
        </CardHeader>
      </Card>

      {/* Asset Selection */}
      <Card className="backdrop-blur-sm bg-card/90 border-border shadow-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-foreground">
            Asset Selection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Selected Assets */}
          {selectedAssets.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">Selected Assets</Label>
              <div className="flex flex-wrap gap-2">
                {selectedAssets.map(asset => (
                  <Badge
                    key={asset.id}
                    variant="secondary"
                    className="flex items-center space-x-2 px-3 py-2 cursor-pointer hover:bg-red-100"
                    onClick={() => removeAsset(asset.id)}
                  >
                    <div 
                      className="w-4 h-4 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: asset.color }}
                    >
                      {asset.icon}
                    </div>
                    <span>{asset.name}</span>
                    <X className="h-3 w-3" />
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Asset Categories */}
          <div className="space-y-4">
            {Object.entries(assetCategories).map(([category, assets]) => (
              <div key={category}>
                <Label className="text-sm font-semibold text-foreground capitalize mb-2 block">
                  {category === 'stock' ? 'Stocks' : category === 'crypto' ? 'Cryptocurrencies' : 'Commodities & Indices'}
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {assets.map(asset => (
                    <Button
                      key={asset.id}
                      variant="outline"
                      size="sm"
                      onClick={() => addAsset(asset)}
                      disabled={selectedAssets.find(a => a.id === asset.id)}
                      className="flex items-center space-x-2 justify-start h-auto py-3 border-2 border-border focus:border-blue-500"
                    >
                      <div 
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                        style={{ backgroundColor: asset.color }}
                      >
                        {asset.icon}
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-xs">{asset.name}</div>
                        <div className="text-xs text-muted-foreground">{asset.symbol}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Strategy Configuration */}
      <Card className="backdrop-blur-sm bg-card/90 border-border shadow-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-foreground">
            Strategy Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Tabs value={activeStrategy} onValueChange={setActiveStrategy} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="single" className="flex items-center space-x-2">
                  <Target className="h-4 w-4" />
                  <span>Single Investment</span>
                </TabsTrigger>
                <TabsTrigger value="dca" className="flex items-center space-x-2">
                  <Activity className="h-4 w-4" />
                  <span>DCA Strategy</span>
                </TabsTrigger>
                <TabsTrigger value="stepped" className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Stepped Strategy</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="single" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="singleAmount" className="text-sm font-semibold text-foreground">Investment Amount ($)</Label>
                    <Input
                      id="singleAmount"
                      type="number"
                      {...register('singleInvestment.amount', { required: true, min: 1 })}
                      placeholder="1000"
                      className="h-12 border-2 border-border focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="singleDate" className="text-sm font-semibold text-foreground">Investment Date</Label>
                    <Input
                      id="singleDate"
                      type="date"
                      {...register('singleInvestment.date', { required: true })}
                      className="h-12 border-2 border-border focus:border-blue-500"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="dca" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dcaAmount" className="text-sm font-semibold text-foreground">Amount per Investment ($)</Label>
                    <Input
                      id="dcaAmount"
                      type="number"
                      {...register('dcaStrategy.amount', { required: true, min: 1 })}
                      placeholder="100"
                      className="h-12 border-2 border-border focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dcaFrequency" className="text-sm font-semibold text-foreground">Frequency</Label>
                    <Select 
                      value={formData.dcaStrategy?.frequency} 
                      onValueChange={(value) => setValue('dcaStrategy.frequency', value)}
                    >
                      <SelectTrigger className="h-12 border-2 border-border focus:border-blue-500">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dcaStartDate" className="text-sm font-semibold text-foreground">Start Date</Label>
                    <Input
                      id="dcaStartDate"
                      type="date"
                      {...register('dcaStrategy.startDate', { required: true })}
                      className="h-12 border-2 border-border focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dcaEndDate" className="text-sm font-semibold text-foreground">End Date</Label>
                    <Input
                      id="dcaEndDate"
                      type="date"
                      {...register('dcaStrategy.endDate', { required: true })}
                      className="h-12 border-2 border-border focus:border-blue-500"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="stepped" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-semibold text-foreground">Investment Schedule</Label>
                    <Button
                      type="button"
                      onClick={() => append({ date: '', amount: 1000 })}
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Investment</span>
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg">
                        <div className="flex-1">
                          <Label htmlFor={`date-${index}`} className="text-sm text-foreground">Date</Label>
                          <Input
                            id={`date-${index}`}
                            type="date"
                            {...register(`steppedStrategy.investments.${index}.date`, { required: true })}
                            className="mt-1 border-2 border-border focus:border-blue-500"
                          />
                        </div>
                        <div className="flex-1">
                          <Label htmlFor={`amount-${index}`} className="text-sm text-foreground">Amount ($)</Label>
                          <Input
                            id={`amount-${index}`}
                            type="number"
                            {...register(`steppedStrategy.investments.${index}.amount`, { required: true, min: 1 })}
                            placeholder="1000"
                            className="mt-1 border-2 border-border focus:border-blue-500"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                          className="mt-6"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <Button 
              type="submit" 
              disabled={loading || selectedAssets.length === 0}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-lg transition-all duration-200 transform hover:scale-105"
            >
              {loading ? 'Calculating Portfolio...' : 'Calculate Portfolio'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results Panel */}
      {results && (
        <div id="results-panel" className="space-y-8">
          {/* Portfolio Overview */}
          <Card className="backdrop-blur-sm bg-card/90 border-border shadow-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold text-foreground">
                  Portfolio Results
                </CardTitle>
                <div className="flex space-x-2">
                  <Button onClick={exportToPNG} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    PNG
                  </Button>
                  <Button onClick={exportToPDF} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center p-6 bg-gray-50 rounded-xl">
                  <div className="text-2xl font-bold text-gray-900">
                    ${results.totalInvested.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Total Invested</div>
                </div>
                
                <div className="text-center p-6 bg-blue-50 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600">
                    ${results.totalPortfolioValue.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Portfolio Value</div>
                </div>
                
                <div className={`text-center p-6 rounded-xl ${
                  results.totalPortfolioValue > results.totalInvested ? 'bg-green-50' : 'bg-red-50'
                }`}>
                  <div className={`text-2xl font-bold flex items-center justify-center space-x-2 ${
                    results.totalPortfolioValue > results.totalInvested ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {results.totalPortfolioValue > results.totalInvested ? (
                      <TrendingUp className="h-6 w-6" />
                    ) : (
                      <TrendingDown className="h-6 w-6" />
                    )}
                    <span>
                      {results.totalPortfolioValue > results.totalInvested ? '+' : ''}
                      ${(results.totalPortfolioValue - results.totalInvested).toFixed(2)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Total Gain/Loss</div>
                </div>
                
                <div className="text-center p-6 bg-purple-50 rounded-xl">
                  <div className="text-2xl font-bold text-purple-600">
                    {(((results.totalPortfolioValue - results.totalInvested) / results.totalInvested) * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Total Return</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Individual Asset Performance */}
          <Card className="backdrop-blur-sm bg-card/90 border-border shadow-2xl">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-foreground">
                Asset Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.portfolioResults.map((result, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 bg-muted/50 rounded-xl">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: result.asset.color }}
                    >
                      {result.asset.icon}
                    </div>
                    
                    <div className="flex-1">
                      <div className="font-semibold text-foreground">{result.asset.name}</div>
                      <div className="text-sm text-muted-foreground">{result.asset.symbol}</div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-foreground">
                          ${result.initialInvestment.toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">Invested</div>
                      </div>
                      
                      <div>
                        <div className="text-lg font-bold text-blue-600">
                          ${result.finalValue.toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">Value</div>
                      </div>
                      
                      <div>
                        <div className={`text-lg font-bold ${
                          result.totalReturn > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {result.totalReturn > 0 ? '+' : ''}{result.totalReturn.toFixed(1)}%
                        </div>
                        <div className="text-xs text-muted-foreground">Return</div>
                      </div>
                      
                      <div>
                        <div className="text-lg font-bold text-purple-600">
                          {result.cagr.toFixed(1)}%
                        </div>
                        <div className="text-xs text-muted-foreground">CAGR</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Advanced Metrics */}
          <Card className="backdrop-blur-sm bg-card/90 border-border shadow-2xl">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-foreground">
                Advanced Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {results.portfolioResults.map((result, index) => (
                  <div key={index} className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                        style={{ backgroundColor: result.asset.color }}
                      >
                        {result.asset.icon}
                      </div>
                      <span className="font-semibold text-foreground">{result.asset.name}</span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Sharpe Ratio</span>
                        <span className="font-semibold text-foreground">{result.sharpeRatio.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Max Drawdown</span>
                        <span className="font-semibold text-red-600">-{result.maxDrawdown.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">CAGR</span>
                        <span className="font-semibold text-green-600">{result.cagr.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Equivalents Section */}
          {results.totalPortfolioValue > results.totalInvested && (
            <Card className="backdrop-blur-sm bg-card/90 border-border shadow-2xl">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-foreground">
                  Your Profit Could Buy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {getEquivalents(results.totalPortfolioValue - results.totalInvested)
                    .slice(0, 6)
                    .map((equiv, index) => (
                    <div key={index} className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl">
                      <div className="text-2xl">{equiv.icon}</div>
                      <div>
                        <div className="font-semibold text-foreground">
                          {equiv.quantity} {equiv.item}{equiv.quantity > 1 ? 's' : ''}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ${equiv.price.toLocaleString()} each
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedCalculator;