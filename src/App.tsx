import { useEffect, useState } from "react"
import AmountInput from "./AmountInput";
import ResultRow from "./ResultRow";
import axios from 'axios';
import sortBy from 'lodash/sortBy';
import  useDebouncedEffect  from  'use-debounced-effect';

type CachedResults = {
  provider: string;
  btc: string;
};

type OfferResults = {
  [key: string]:string
};

const defaultAmount = '400';
function App() {
  const [prevAmount, setPrevAmount] = useState(defaultAmount);
  const [amount, setAmount] = useState(defaultAmount);
  const[cachedResults, setCachedResults] = useState<CachedResults[]>([]);
  const [offerResults, setOfferResults] = useState<OfferResults>({});
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    axios.get('https://m8b1xz34ta.us.aircode.run/cachedValues')
    .then(res => {
      setCachedResults(res.data);
      setLoading(false);
    });
  }, []);

  useDebouncedEffect(() => {
    if(amount === defaultAmount){
      return;
    }
    if(amount!==prevAmount){
      setLoading(true);
      axios
        .get(`https://m8b1xz34ta.us.aircode.run/offers?amount=${amount}`)
        .then(res => {
          setLoading(false);
          setOfferResults(res.data);
          setPrevAmount(amount);
        })
      console.log('Check for '+amount);
    }
  }, 300, [amount]);

  const sortedCache:CachedResults[] = sortBy(cachedResults, 'btc').reverse();
  const sortedResults:CachedResults[] = sortBy(Object.keys(offerResults).map(provider => ({
      provider, 
      btc:offerResults[provider]
  })), 'btc').reverse();

  const showCached = amount === defaultAmount;

  const rows = showCached ? sortedCache:sortedResults;
  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="uppercase text-6xl text-center font-bold 
      bg-gradient-to-br from-purple-600 to-sky-400 bg-clip-text 
      text-transparent from-40%">Find Cheapest BTC</h1>
      <div className="flex justify-center mt-6">
        <AmountInput 
          value={amount} 
          onChange={e => setAmount(e.target.value)}
        />
      </div>
      <div className="mt-6">
        {loading && (
          <>
            <ResultRow loading={true}/>
            <ResultRow loading={true}/>
            <ResultRow loading={true}/>
            <ResultRow loading={true}/>
          </>
        )}
        {!loading && rows.map(result => (
          <ResultRow 
            key={result.provider}
            providerName={result.provider}
            btc={result.btc}
          />
        ))}

      </div>
    </main>
  )
}

export default App
