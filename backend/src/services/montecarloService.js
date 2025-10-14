//It computes returns, builds covariance, does Cholesky, 
//simulates multivariate normals, revalues portfolio for each sim, and returns VaR stats.
//Default sims = 5000 (adjustable).
//This builds covariance from historical returns and uses Cholesky to create correlated normals. 
// If covariance is not PD, it falls back to diagonal approximation.
//simulations default is 5000 — adjust when queuing.
//Returns an object with varValue (in currency), and a small sample of losses for inspection.
import MarketPrice from "../models/MarketPrice.js";
/**
 * Utilities
 */
function mean(arr){
  if(arr.length===0) return 0;
  return arr.reduce((a,b)=>a+b,0)/arr.length;
}
function subtract(a,b){ return a.map((v,i)=>v - b[i]); }

/**
 * Compute covariance matrix for a list of return arrays (aligned)
 * returns matrix as array of arrays
 */
function covarianceMatrix(returnsAligned){
  const n = returnsAligned[0].length;
  const m = returnsAligned.length;
  const means = returnsAligned.map(r=>mean(r));
  const cov = Array.from({length:m}, ()=>Array(m).fill(0));
  for(let i=0;i<m;i++){
    for(let j=i;j<m;j++){
      let s = 0;
      for(let k=0;k<n;k++){
        s += (returnsAligned[i][k]-means[i]) * (returnsAligned[j][k]-means[j]);
      }
      const value = s / (n - 1);
      cov[i][j] = value;
      cov[j][i] = value;
    }
  }
  return { cov, means };
}

/**
 * Cholesky decomposition (covariance must be positive-definite)
 * Returns lower-triangular L such that L * L^T = A
 */
function cholesky(A){
  const n = A.length;
  const L = Array.from({length:n}, ()=>Array(n).fill(0));
  for(let i=0;i<n;i++){
    for(let j=0;j<=i;j++){
      let sum = 0;
      for(let k=0;k<j;k++) sum += L[i][k]*L[j][k];
      if(i===j){
        const val = A[i][i] - sum;
        if(val <= 0) return null; // not pos-def
        L[i][j] = Math.sqrt(val);
      } else {
        L[i][j] = (1.0 / L[j][j]) * (A[i][j] - sum);
      }
    }
  }
  return L;
}

/** Box-Muller -> standard normal pair */
function randnPair(){
  let u=0,v=0;
  while(u===0) u = Math.random();
  while(v===0) v = Math.random();
  const mag = Math.sqrt(-2.0 * Math.log(u));
  const z0 = mag * Math.cos(2*Math.PI*v);
  const z1 = mag * Math.sin(2*Math.PI*v);
  return [z0, z1];
}

/** Generate k independent standard normals */
function randnVec(k){
  const out = new Array(k);
  let i = 0;
  while(i < k){
    const [a,b] = randnPair();
    out[i++] = a;
    if(i < k) out[i++] = b;
  }
  return out;
}

/**
 * Main Monte Carlo VaR
 * @param {Array} positions - [{ symbol, quantity, avgPrice }]
 * @param {Number} confidence - e.g. 0.95
 * @param {Number} horizonDays - integer
 * @param {Number} simulations - number of MC sims
 */
export async function computeMonteCarloVaR(positions, confidence=0.95, horizonDays=1, simulations=5000){
  // 1) fetch history for each symbol (same lookback)
  const lookback = 120; // days of prices to use to build returns & cov
  const symbolToPrices = {};
  for(const pos of positions){
    const data = await MarketPrice.find({ symbol: pos.symbol })
      .sort({ timestamp: -1 })
      .limit(lookback);
    if(!data || data.length < 2) continue;
    symbolToPrices[pos.symbol] = data.map(d => d.price).reverse();
  }
  const symbols = Object.keys(symbolToPrices);
  if(symbols.length === 0) {
    throw new Error("Insufficient historical price data for Monte Carlo");
  }

  // 2) compute returns arrays aligned (daily simple returns)
  const returnsArr = symbols.map(sym => {
    const prices = symbolToPrices[sym];
    const r = [];
    for(let i=1;i<prices.length;i++){
      r.push((prices[i] - prices[i-1]) / prices[i-1]);
    }
    return r;
  });

  // align length (shortest)
  const minLen = Math.min(...returnsArr.map(r=>r.length));
  const aligned = returnsArr.map(r => r.slice(r.length - minLen));

  // 3) covariance matrix & means
  const { cov, means } = covarianceMatrix(aligned);
  // 4) cholesky
  let L = cholesky(cov);
  // If not pos-def (cholesky failed), fall back to diagonal (assume independent)
  if(!L){
    L = Array.from({length:cov.length}, (_,i)=>Array.from({length:cov.length}, (_,j)=> i===j? Math.sqrt(cov[i][i]):0));
  }

  // 5) get latest prices for portfolio valuation / weights
  const latestPrices = {};
  for(const sym of symbols){
    const arr = symbolToPrices[sym];
    latestPrices[sym] = arr[arr.length - 1];
  }

  // compute portfolio current value
  let portfolioValue = 0;
  const posWeights = [];
  for(const pos of positions){
    const p = latestPrices[pos.symbol];
    const val = pos.quantity * p;
    portfolioValue += val;
    posWeights.push({ symbol: pos.symbol, qty: pos.quantity, lastPrice: p, value: val });
  }

  // 6) simulate
  const losses = new Array(simulations);
  const dim = symbols.length;
  for(let s=0;s<simulations;s++){
    // sample standard normals vector
    const z = randnVec(dim);
    // multiply L * z  -> correlated normals with cov
    const correlated = new Array(dim).fill(0);
    for(let i=0;i<dim;i++){
      let sum = 0;
      for(let k=0;k<=i;k++){
        sum += L[i][k] * z[k];
      }
      correlated[i] = sum + means[i]; // add mean
    }

    // compute asset simulated returns over horizonDays assuming iid daily returns:
    // approximate multi-day return by sqrt(horizonDays) scaling (parametric style) or repeated sampling — we scale here
    const scale = Math.sqrt(horizonDays);
    // revalue portfolio
    let newPortfolioValue = 0;
    for(let i=0;i<dim;i++){
      const sym = symbols[i];
      // simulated return for this asset
      const r = correlated[i] * scale;
      const last = latestPrices[sym];
      const simPrice = last * (1 + r);
      // get quantity
      const pos = positions.find(p => p.symbol === sym);
      const qty = pos ? pos.quantity : 0;
      newPortfolioValue += qty * simPrice;
    }
    const pnl = newPortfolioValue - portfolioValue;
    // loss is negative pnl
    losses[s] = -pnl;
  }

  // 7) compute VaR quantile
  losses.sort((a,b)=>a-b); // ascending; worst losses at end
  // we want the (confidence) quantile of loss distribution (i.e. alpha = confidence)
  // For VaR at 95% we want the 95th percentile loss (i.e. the value such that 95% of losses <= that)
  const idx = Math.floor(confidence * simulations) - 1;
  const idxSafe = Math.max(0, Math.min(simulations - 1, idx));
  const varValue = losses[idxSafe];
  // some summary stats
  const meanLoss = mean(losses);
  const stdLoss = Math.sqrt(losses.reduce((sum, v)=> sum + Math.pow(v - meanLoss, 2), 0) / losses.length);

  return {
    portfolioValue,
    varValue,
    simulations,
    meanLoss,
    stdLoss,
    lossesSample: losses.slice(Math.max(0, idxSafe-5), idxSafe+5) // small window for debugging
  };
}