import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast'; // Import the toast library
import './css/MetadataFetcher.css';

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

    const isValidUrl = (url) => {
        // Check if URL starts with 'http://' or 'https://'
        return /^(http:\/\/|https:\/\/)/.test(url);
    };

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
            const response = await axios.post('http://localhost:5000/fetch-metadata', { urls });
            setMetadata(response.data);

            // Handle errors in the response metadata
            response.data.forEach(item => {
                if (item.error) {
                    toast.error(`Error fetching metadata for URL: ${item.url}`);
                }
            });
        } catch (error) {
            setError(error.response ? error.response.data.error : 'Error fetching metadata');
            //toast.error("Failed to fetch metadata. Please try again.");
        }
    };

    return (
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
            <div className="metadata">
                {metadata.map((data, index) => (
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
    );
};

export default MetadataFetcher;
