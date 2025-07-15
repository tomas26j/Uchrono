import React from 'react';

const Header = () => {
  return (
    <header className="bg-card shadow-sm border-b border-border">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <img src="/logo.png" alt="Uchrono Logo" className="w-10 h-10 rounded-xl object-contain bg-white" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Uchrono</h1>
                <p className="text-sm text-muted-foreground">What could have been, what you can learn</p>
              </div>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Educational Tool</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>Mock Data</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;