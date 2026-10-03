import { useEffect, useRef, useState } from 'react';

export interface StockRow {
  id: number;
  symbol: string;
  name: string;
  sector: string;
  price: number;
  change: number;
  volume: number;
}

const STOCKS: Array<{ symbol: string; name: string; sector: string; basePrice: number }> = [
  { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology', basePrice: 227.5 },
  { symbol: 'MSFT', name: 'Microsoft Corp.', sector: 'Technology', basePrice: 421.3 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology', basePrice: 175.8 },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer', basePrice: 186.4 },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', sector: 'Technology', basePrice: 132.6 },
  { symbol: 'TSLA', name: 'Tesla Inc.', sector: 'Automotive', basePrice: 248.9 },
  { symbol: 'META', name: 'Meta Platforms Inc.', sector: 'Technology', basePrice: 563.2 },
  { symbol: 'NFLX', name: 'Netflix Inc.', sector: 'Media', basePrice: 712.4 },
  { symbol: 'AMD', name: 'Advanced Micro Devices', sector: 'Technology', basePrice: 152.1 },
  { symbol: 'ORCL', name: 'Oracle Corp.', sector: 'Technology', basePrice: 178.3 },
  { symbol: 'CRM', name: 'Salesforce Inc.', sector: 'Technology', basePrice: 328.7 },
  { symbol: 'UBER', name: 'Uber Technologies Inc.', sector: 'Transportation', basePrice: 74.6 },
];

function seedStocks(): StockRow[] {
  return STOCKS.map((s, i) => ({
    id: i + 1,
    symbol: s.symbol,
    name: s.name,
    sector: s.sector,
    price: s.basePrice,
    change: 0,
    volume: Math.floor(500_000 + Math.random() * 4_500_000),
  }));
}

/** Simulates a streaming quote feed: prices drift randomly on a fixed interval. */
export function useLiveStockData(intervalMs = 1500): StockRow[] {
  const [rows, setRows] = useState<StockRow[]>(seedStocks);
  const basePrices = useRef(new Map(STOCKS.map((s) => [s.symbol, s.basePrice])));

  useEffect(() => {
    const timer = setInterval(() => {
      setRows((prev) =>
        prev.map((row) => {
          const drift = (Math.random() - 0.5) * (row.price * 0.01);
          const nextPrice = Math.max(1, row.price + drift);
          const base = basePrices.current.get(row.symbol) ?? nextPrice;
          const change = ((nextPrice - base) / base) * 100;
          const volume = row.volume + Math.floor(Math.random() * 20_000);
          return { ...row, price: nextPrice, change, volume };
        })
      );
    }, intervalMs);
    return (): void => clearInterval(timer);
  }, [intervalMs]);

  return rows;
}
