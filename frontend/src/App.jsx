import { Toaster } from 'react-hot-toast';

import MetadataFetcher from './MetadataFetcher';
import './app.css'; // Ensure this import is present to apply the styles

function App() {
    return (
        <div>
            <MetadataFetcher />
            <Toaster/>
        </div>
    );
}

export default App;
