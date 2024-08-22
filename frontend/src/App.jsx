import { Toaster } from 'react-hot-toast';

import MetadataFetcher from './components/MetadataFetcher';

function App() {
    return (
        <div>
            <MetadataFetcher />
            <Toaster/>
        </div>
    );
}

export default App;
