import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import '../css/MetadataFetcher.css';

const MetadataFetcher = () => {
    const [urls, setUrls] = useState(['', '', '']);
    const [metadata, setMetadata] = useState([]);
    const [error, setError] = useState(null);

    const handleUrlChange = (index, value) => {
        const newUrls = [...urls];
        newUrls[index] = value;
        setUrls(newUrls);
    };

    const addUrlField = () => {
        setUrls([...urls, '']);
    };

    // Check if URL starts with 'http://' or 'https://'
    const isValidUrl = (url) => {
        
        return /^(http:\/\/|https:\/\/)/.test(url);
    };

    // Handle form submission to fetch metadata.
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setMetadata([]);
    
        // Filter out empty URLs
        const filledUrls = urls.filter(url => url.trim() !== '');
    
        // Check if there are at least 3 URLs
        if (filledUrls.length < 3) {
            toast.error('Please provide at least 3 URLs.');
            return;
        }
    
        // Validate URLs and show error if any URL is invalid
        const invalidUrls = filledUrls.filter(url => !isValidUrl(url));
        if (invalidUrls.length > 0) {
            toast.error('Please provide valid URLs starting with "http://" or "https://"');
            return;
        }
    
        try {
            // Extract CSRF token from cookies
            const csrfToken = document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN')).split('=')[1];

            // Make a POST request to the backend to fetch metadata
            const response = await axios.post(
                'https://tolstoy-home-task.onrender.com/fetch-metadata', 
                { urls },
                {
                    headers: {
                        'X-XSRF-TOKEN': csrfToken
                    },
                    withCredentials: true
                }
            );
            setMetadata(response.data);
    
            // Handle errors in the response metadata
            response.data.forEach(item => {
                if (item.error) {
                    if (item.url !== '') {
                        toast.error(`Error fetching metadata for URL: ${item.url}`);
                    }
                }
            });
        } catch {
            // Display a general error toast if the request fails
            toast.error("Failed to fetch metadata. Please try again.");
        }
    };
    
    return (
        <div className="metadata-fetcher-container">
            <div className="metadata-fetcher">
                <h1 className="h1">Metadata Fetcher</h1>
                <form className="form" onSubmit={handleSubmit}>
                    {urls.map((url, index) => (
                        <input
                            key={index}
                            className="input"
                            type="text"
                            placeholder="Enter URL"
                            value={url}
                            onChange={(e) => handleUrlChange(index, e.target.value)}
                        />
                    ))}
                    <div className="buttons">
                        <button type="button" onClick={addUrlField} className="button">
                            Add Another URL
                        </button>
                        <button type="submit" className="button">Submit</button>
                    </div>
                </form>
                {error && <div className="error">{error}</div>}
                <div className="metadata-wrapper">
                    <div className="metadata">
                        {metadata
                            .filter(data => data.url && data.url.trim() !== '')
                            .map((data, index) => (
                                <div key={index} className="metadata-item">
                                    <h3>{data.title || "No title available"}</h3>
                                    <p>{data.description || "No description available"}</p>
                                    {data.image && data.image !== "No image available" ? (
                                        <img src={data.image} alt="metadata" className="metadata-image" />
                                    ) : (
                                        <p>No image available</p>
                                    )}
                                </div>
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MetadataFetcher;