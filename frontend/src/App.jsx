import { Toaster } from 'react-hot-toast';

import MetadataFetcher from './components/MetadataFetcher';
import './App.css';

function App() {
    return (
        <div>
            <MetadataFetcher />
            <Toaster/>
        </div>
    );
}

export default App;
