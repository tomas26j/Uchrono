import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import { Toaster } from './components/ui/sonner';
import Header from './components/Header';
import MainCalculator from './components/MainCalculator';
import AdvancedCalculator from './components/AdvancedCalculator';
import Timeline from './components/Timeline';
import Scenarios from './components/Scenarios';
import Leaderboard from './components/Leaderboard';
import Stories from './components/Stories';
import Tips from './components/Tips';
import { DAILY_TIPS } from './data/mockData';

function App() {
  const [activeSection, setActiveSection] = useState('calculator');
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [calculatorData, setCalculatorData] = useState(null);
  const [dailyTip, setDailyTip] = useState(null);

  useEffect(() => {
    // Set a random daily tip on load
    const randomTip = DAILY_TIPS[Math.floor(Math.random() * DAILY_TIPS.length)];
    setDailyTip(randomTip);
  }, []);

  const handleCalculatorResult = (data) => {
    setCalculatorData(data);
    setSelectedAsset(data.asset);
  };

  const handleScenarioSelect = (scenario) => {
    setActiveSection('calculator');
    // Auto-populate calculator with scenario data
    setCalculatorData({
      asset: scenario.asset,
      amount: scenario.amount,
      buyDate: scenario.buyDate,
      sellDate: scenario.sellDate,
      scenario: scenario
    });
  };

  const sections = [
    { id: 'calculator', title: 'Calculator', icon: '📊' },
    { id: 'advanced', title: 'Advanced', icon: '🔬' },
    { id: 'timeline', title: 'Timeline', icon: '📈' },
    { id: 'scenarios', title: 'Scenarios', icon: '🎯' },
    { id: 'leaderboard', title: 'Leaderboard', icon: '🏆' },
    { id: 'stories', title: 'Stories', icon: '📚' },
    { id: 'tips', title: 'Tips', icon: '💡' }
  ];

  return (
    <BrowserRouter>
      <div className="App min-h-screen bg-background">
        <Header />
        
        {/* Daily Tip Banner */}
        {dailyTip && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 text-center">
            <div className="max-w-6xl mx-auto">
              <span className="font-semibold">💡 Daily Tip: </span>
              <span className="font-medium">{dailyTip.title}</span>
              <span className="hidden md:inline"> - {dailyTip.content}</span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="bg-card shadow-sm border-b border-border sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex space-x-8 overflow-x-auto">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-all duration-200 whitespace-nowrap ${
                    activeSection === section.id
                      ? 'border-blue-500 text-blue-400 font-semibold'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
                  }`}
                >
                  <span className="text-lg">{section.icon}</span>
                  <span className="font-medium">{section.title}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={
              <>
                {activeSection === 'calculator' && (
                  <MainCalculator 
                    onResult={handleCalculatorResult} 
                    initialData={calculatorData}
                  />
                )}
                {activeSection === 'advanced' && <AdvancedCalculator />}
                {activeSection === 'timeline' && (
                  <Timeline 
                    asset={selectedAsset} 
                    calculatorData={calculatorData}
                  />
                )}
                {activeSection === 'scenarios' && (
                  <Scenarios onScenarioSelect={handleScenarioSelect} />
                )}
                {activeSection === 'leaderboard' && <Leaderboard />}
                {activeSection === 'stories' && <Stories />}
                {activeSection === 'tips' && <Tips />}
              </>
            } />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-card text-foreground py-12 mt-16 border-t border-border">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">Contrafactum</h3>
              <p className="text-muted-foreground text-lg mb-6">
                What could have been, what you can learn
              </p>
              <div className="flex justify-center space-x-6 text-sm text-muted-foreground">
                <span>Educational purposes only</span>
                <span>•</span>
                <span>Past performance doesn't predict future results</span>
                <span>•</span>
                <span>Data provided by Alpha Vantage & CoinGecko</span>
              </div>
            </div>
          </div>
        </footer>

        <Toaster />
      </div>
    </BrowserRouter>
  );
}

export default App;